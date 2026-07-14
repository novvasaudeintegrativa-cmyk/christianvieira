#!/usr/bin/env node
/**
 * generate-post.js
 *
 * Lê posts-schedule.json, encontra o próximo post não publicado que já venceu,
 * gera conteúdo via Gemini Flash e imagem via Gemini Imagen,
 * e salva os arquivos HTML + JPG no projeto.
 *
 * Uso:
 *   GEMINI_API_KEY=... node scripts/generate-post.js
 *   GEMINI_API_KEY=... node scripts/generate-post.js --num 3   # forçar post específico
 *   GEMINI_API_KEY=... node scripts/generate-post.js --dry-run # apenas imprime o que geraria
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..');
const SCHEDULE  = path.join(ROOT, 'blog', 'posts-schedule.json');
const POSTS_DIR = path.join(ROOT, 'blog', 'posts');
const IMGS_DIR  = path.join(ROOT, 'blog', 'images');

const GEMINI_KEY    = process.env.GEMINI_API_KEY;
const GEMINI_BASE   = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_TEXT    = 'gemini-2.0-flash';
const MODEL_IMAGEN  = 'imagen-4.0-fast-generate-001';

// ─── helpers ────────────────────────────────────────────────────────────────

function ptDate(iso) {
  const months = ['janeiro','fevereiro','março','abril','maio','junho',
                  'julho','agosto','setembro','outubro','novembro','dezembro'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${months[m - 1]} de ${y}`;
}

function numPad(n) { return String(n).padStart(2, '0'); }

function imageName(post) {
  return `post-${numPad(post.num)}-${post.slug}.jpg`;
}

async function geminiText(prompt) {
  const url = `${GEMINI_BASE}/models/${MODEL_TEXT}:generateContent?key=${GEMINI_KEY}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  if (!res.ok) throw new Error(`Gemini text error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function geminiImagen(prompt) {
  const url = `${GEMINI_BASE}/models/${MODEL_IMAGEN}:predict?key=${GEMINI_KEY}`;
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: '16:9' }
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  if (!res.ok) throw new Error(`Imagen error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.predictions[0].bytesBase64Encoded;
}

// ─── encontrar post pendente ─────────────────────────────────────────────────

function findPost(schedule, forceNum) {
  const today = new Date();
  today.setHours(23, 59, 59, 0);

  if (forceNum) {
    return schedule.posts.find(p => p.num === forceNum) || null;
  }

  return schedule.posts
    .filter(p => {
      const due = new Date(p.date + 'T00:00:00');
      const htmlPath = path.join(POSTS_DIR, p.slug + '.html');
      return due <= today && !fs.existsSync(htmlPath);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}

// ─── prompt de imagem por categoria ─────────────────────────────────────────

function imagePrompt(post) {
  const base = 'high quality professional photography, clean minimal style, warm tones, no text, no people faces';
  const map = {
    DICAS:         `Brazilian residential real estate, modern apartment or house exterior, Rio de Janeiro urban setting, soft natural light. ${base}`,
    FINANCIAMENTO: `Financial planning desk scene with documents, calculator and pen, warm light, clean flat lay, real estate context. ${base}`,
    BAIRROS:       `Aerial drone view of Rio de Janeiro residential neighborhood, tree-lined streets, warm golden hour light. ${base}`,
    DOCUMENTOS:    `Clean flat lay of official documents, pen, stamp, real estate contract papers on neutral background. ${base}`,
    CUSTOS:        `Calculator, coins, pen and real estate documents on clean desk, warm neutral background. ${base}`,
    'AVALIAÇÃO':   `Real estate agent reviewing property value charts on tablet, modern office, warm professional setting. ${base}`,
    MERCADO:       `Rio de Janeiro skyline with residential buildings, golden afternoon light, aerial view. ${base}`,
  };
  return map[post.category] || map['DICAS'];
}

// ─── prompt de conteúdo ──────────────────────────────────────────────────────

function contentPrompt(post) {
  return `Você é Christian Vieira, corretor e mentor imobiliário com mais de 10 anos de experiência no Rio de Janeiro. CRECI 45539. Atua principalmente na Zona Sul, Zona Oeste (Recreio, Barra da Tijuca) e Zona Norte.

Tom: direto, confiável, educativo mas acessível. Frases curtas e objetivas. Sem jargões desnecessários. Use exemplos do Rio de Janeiro quando relevante.

Público-alvo: pessoas que querem comprar o primeiro imóvel no Rio de Janeiro, ou precisam de orientação imobiliária especializada.

Escreva um artigo de blog (mínimo 850 palavras) sobre o tema: "${post.title}"

Retorne SOMENTE o seguinte JSON válido (sem bloco markdown, sem texto antes ou depois, apenas JSON):

{
  "meta_description": "resumo de 120-155 caracteres para SEO",
  "excerpt": "1-2 frases curtas que apresentam o artigo ao leitor (até 210 caracteres)",
  "reading_time": <inteiro: estimativa de minutos de leitura>,
  "intro": "<p>primeiro parágrafo com gancho forte</p><p>segundo parágrafo</p><p>terceiro parágrafo</p>",
  "sections": [
    { "h2": "Título da seção", "html": "<p>conteúdo com <strong>negrito</strong> quando relevante</p>" },
    { "blockquote": "Citação marcante e prática do Christian Vieira sobre o tema" },
    { "h2": "Outro título de seção", "html": "<p>...</p><ul><li>item 1</li><li>item 2</li></ul>" }
  ],
  "cta_title": "CHAMADA PARA AÇÃO EM MAIÚSCULAS (máx 55 caracteres)",
  "cta_body": "1-2 frases convidando o leitor a entrar em contato com o Christian para orientação personalizada.",
  "cta_wa": "Olá, Christian! Li seu artigo sobre ${post.title.toLowerCase()} e gostaria de orientação."
}

Requisitos obrigatórios:
- Mínimo 5 itens em "sections" (combinando h2 e blockquote)
- Máximo 1 blockquote
- Parágrafos em <p>, listas em <ul><li>, negrito em <strong>
- Não invente estatísticas ou dados sem embasamento real
- O artigo deve ter no mínimo 850 palavras contando intro + sections`;
}

// ─── renderizar HTML ─────────────────────────────────────────────────────────

function renderSections(sections) {
  return sections.map(sec => {
    if (sec.h2)         return `\n      <h2>${sec.h2}</h2>\n      ${sec.html}`;
    if (sec.blockquote) return `\n      <blockquote>${sec.blockquote}</blockquote>`;
    return '';
  }).join('\n');
}

function renderRelated(schedule, relatedSlugs) {
  const icons = {
    DICAS:         `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    FINANCIAMENTO: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    BAIRROS:       `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    DOCUMENTOS:    `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="12" y2="16"/>`,
    CUSTOS:        `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>`,
    'AVALIAÇÃO':   `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
    MERCADO:       `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
  };

  return relatedSlugs.slice(0, 3).map(slug => {
    const post = schedule.posts.find(p => p.slug === slug);
    if (!post) return '';
    const icon = icons[post.category] || icons.DICAS;
    return `
        <a href="${post.slug}.html" class="related-post">
          <div class="related-post__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(184,150,46,0.6)" stroke-width="1.5">${icon}</svg></div>
          <div><p class="related-post__title">${post.title}</p><p class="related-post__date">${ptDate(post.date).replace(' de ', ' ').split(' ')[0]} ${ptDate(post.date).split(' ')[2]} ${post.date.split('-')[0]}</p></div>
        </a>`;
  }).join('');
}

function renderHTML(post, content, schedule) {
  const imgSrc = `../images/${imageName(post)}`;
  const dateStr = ptDate(post.date);
  const waMsg = encodeURIComponent(content.cta_wa || `Olá, Christian! Li seu artigo sobre "${post.title}" e gostaria de orientação.`);
  const related = renderRelated(schedule, post.related || []);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | Blog Christian Vieira</title>
  <meta name="description" content="${content.meta_description}">

  <link rel="stylesheet" href="../../design-system.css">
  <link rel="stylesheet" href="../../style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{'gold':'var(--color-gold)','gold-light':'var(--color-gold-light)','navy':'var(--color-navy)','stone':'var(--color-stone)','ink':'var(--color-ink)','ink-soft':'var(--color-ink-soft)'},fontFamily:{sans:['Plus Jakarta Sans','Arial','sans-serif'],mono:['ui-monospace','SFMono-Regular','Menlo','Monaco','Consolas','monospace']}}}}</script>
  <style>
    .post-hero{background:var(--color-navy);}
    .post-hero__inner{display:grid;grid-template-columns:1fr 380px;gap:56px;align-items:center;max-width:1200px;margin:0 auto;padding:72px clamp(1rem,5vw,2rem) 56px;}
    .post-hero__content{min-width:0;}
    .post-hero__image{border-radius:14px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.5);aspect-ratio:16/10;}
    .post-hero__image img{width:100%;height:100%;object-fit:cover;display:block;}
    @media(max-width:900px){.post-hero__inner{grid-template-columns:1fr;gap:28px;}.post-hero__image{order:-1;}}
    .post-hero__back{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.45);text-decoration:none;margin-bottom:28px;transition:color .2s}
    .post-hero__back:hover{color:var(--color-gold-light)}
    .post-hero__meta{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
    .post-tag{font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:.1em;padding:4px 10px;border-radius:4px;background:rgba(184,150,46,.15);color:var(--color-gold-light)}
    .post-hero__date{font-family:var(--font-mono);font-size:11px;color:rgba(255,255,255,.4)}
    .post-hero__title{font-size:clamp(28px,4.5vw,52px);font-weight:800;letter-spacing:-.04em;color:#fff;line-height:1.1;margin-bottom:20px;}
    .post-hero__excerpt{font-size:17px;color:rgba(255,255,255,.55);line-height:1.65;margin-bottom:28px}
    .post-hero__author{display:flex;align-items:center;gap:12px}
    .post-hero__avatar{width:40px;height:40px;background:var(--color-gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
    .post-hero__author-name{font-size:14px;font-weight:700;color:#fff}
    .post-hero__author-role{font-family:var(--font-mono);font-size:10px;color:rgba(255,255,255,.4);margin-top:2px}
    .post-layout{display:grid;grid-template-columns:1fr 320px;gap:48px;max-width:1100px;margin:0 auto;padding:56px clamp(1rem,5vw,2rem) 80px}
    @media(max-width:860px){.post-layout{grid-template-columns:1fr}.post-sidebar{order:-1}}
    .post-body{font-size:17px;line-height:1.75;color:var(--color-ink-soft)}
    .post-body h2{font-size:clamp(22px,2.5vw,28px);font-weight:700;letter-spacing:-.03em;color:var(--color-ink);margin:40px 0 16px;line-height:1.2}
    .post-body h3{font-size:19px;font-weight:700;color:var(--color-ink);margin:32px 0 12px}
    .post-body p{margin-bottom:20px}
    .post-body strong{font-weight:700;color:var(--color-ink)}
    .post-body ul{padding-left:20px;margin-bottom:20px}
    .post-body ul li{margin-bottom:8px}
    .post-body ol{padding-left:20px;margin-bottom:20px}
    .post-body ol li{margin-bottom:12px}
    .post-body blockquote{border-left:3px solid var(--color-gold);padding:16px 20px;margin:28px 0;background:var(--color-stone);border-radius:0 8px 8px 0;font-style:italic;font-size:18px;color:var(--color-ink)}
    .post-body .highlight-box{background:rgba(13,27,42,.04);border:1px solid var(--color-border);border-radius:10px;padding:24px;margin:28px 0}
    .post-body .highlight-box h4{font-size:13px;font-family:var(--font-mono);font-weight:700;letter-spacing:.1em;color:var(--color-gold);margin-bottom:12px}
    .post-sidebar{position:sticky;top:80px;align-self:start;display:flex;flex-direction:column;gap:24px}
    .sidebar-card{background:var(--color-stone);border:1px solid var(--color-border);border-radius:10px;padding:24px}
    .sidebar-card__label{font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--color-gold);margin-bottom:12px;display:block}
    .sidebar-card__title{font-size:16px;font-weight:700;color:var(--color-ink);margin-bottom:8px}
    .sidebar-card__body{font-size:14px;color:var(--color-ink-soft);line-height:1.6;margin-bottom:16px}
    .related-post{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-border);text-decoration:none}
    .related-post:last-child{border-bottom:none;padding-bottom:0}
    .related-post__icon{width:40px;height:40px;background:var(--color-navy);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .related-post__title{font-size:13px;font-weight:600;color:var(--color-ink);line-height:1.4;transition:color .2s}
    .related-post:hover .related-post__title{color:var(--color-gold)}
    .related-post__date{font-family:var(--font-mono);font-size:10px;color:var(--color-ink-muted);margin-top:3px}
  </style>
</head>
<body style="background:var(--color-stone);">

<nav id="navbar" class="sticky top-0 z-50">
  <div class="nav-inner max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
    <a href="../../index.html" class="flex items-center gap-3 shrink-0">
      <div class="nav-logo-badge w-9 h-9 flex items-center justify-center">CV</div>
      <div><p class="nav-logo-name">Christian Vieira</p><p class="nav-logo-sub">Imóveis &amp; Consultoria</p><p class="nav-logo-creci">CRECI 45539</p></div>
    </a>
    <div class="hidden lg:flex items-center gap-7">
      <a href="../../index.html" class="cv-nav-link">Início</a>
      <div class="nav-dropdown" id="nav-dd">
        <button class="nav-dropdown__trigger" aria-expanded="false">Lançamentos <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;transition:transform .25s ease"><polyline points="6 9 12 15 18 9"/></svg></button>
        <div class="nav-dropdown__panel" role="menu">
          <a href="../../lancamentos/ArcosdoPorto/index.html" class="nav-dropdown__item">Arcos do Porto</a>
          <a href="../../lancamentos/CartollaII/index.html" class="nav-dropdown__item">Residencial Cartola II</a>
          <a href="../../lancamentos/MetropolitanDream/index.html" class="nav-dropdown__item">Metropolitan Dream</a>
          <a href="../../lancamentos/OrlaRecreioReserva/index.html" class="nav-dropdown__item">Orla Recreio Reserva</a>
          <a href="../../lancamentos/ConnectSquare/index.html" class="nav-dropdown__item">Connect Square</a>
        </div>
      </div>
      <a href="../../index.html#consultoria" class="cv-nav-link">Consultoria</a>
      <a href="../index.html" class="cv-nav-link" style="color:var(--color-gold);font-weight:700;">Blog</a>
      <a href="../../index.html#contato" class="cv-nav-link">Contato</a>
    </div>
    <div class="flex items-center gap-3">
      <a href="../../index.html#contato" class="cv-btn cv-btn-primary whitespace-nowrap hidden sm:inline-flex">Fale com o Christian</a>
      <button class="nav-hamburger lg:hidden" id="nav-hamburger" aria-label="Abrir menu" aria-expanded="false"><span class="nav-hamburger__label">MENU</span><div class="nav-hamburger__bars"><span></span><span></span><span></span></div></button>
    </div>
  </div>
  <div class="nav-mobile" id="nav-mobile" aria-hidden="true">
    <a href="../../index.html" class="nav-mobile-link">Início</a>
    <a href="../index.html" class="nav-mobile-link" style="color:var(--color-gold);font-weight:700;">Blog</a>
    <a href="../../index.html#contato" class="nav-mobile-link">Contato</a>
    <a href="../../index.html#contato" class="nav-mobile-cta">Fale com o Christian</a>
  </div>
</nav>

<div class="post-hero">
<div class="post-hero__inner">
<div class="post-hero__content">
  <a href="../index.html" class="post-hero__back"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Voltar ao Blog</a>
  <div class="post-hero__meta">
    <span class="post-tag">${post.category}</span>
    <span class="post-hero__date">${dateStr} · ${content.reading_time} min de leitura</span>
  </div>
  <h1 class="post-hero__title">${post.title}</h1>
  <p class="post-hero__excerpt">${content.excerpt}</p>
  <div class="post-hero__author">
    <div class="post-hero__avatar">CV</div>
    <div><p class="post-hero__author-name">Christian Vieira</p><p class="post-hero__author-role">CORRETOR E MENTOR IMOBILIÁRIO · CRECI 45539</p></div>
  </div>
</div>
<div class="post-hero__image">
  <img src="${imgSrc}" alt="${post.title}">
</div>
</div>
</div>

<div style="background:var(--color-stone);">
  <div class="post-layout">
    <article class="post-body">

      ${content.intro}
${renderSections(content.sections)}

      <div class="highlight-box">
        <h4>${content.cta_title}</h4>
        <p style="font-size:15px;color:var(--color-ink-soft);margin-bottom:16px;line-height:1.6;">${content.cta_body}</p>
        <a href="https://wa.me/5521993399299?text=${waMsg}" target="_blank" rel="noopener" class="cv-btn cv-btn-gold" style="display:inline-flex;">Falar com o Christian</a>
      </div>

    </article>

    <aside class="post-sidebar">
      <div class="sidebar-card" style="background:var(--color-navy);border-color:rgba(184,150,46,0.15);">
        <span class="sidebar-card__label" style="color:var(--color-gold-light);">FALE COM O ESPECIALISTA</span>
        <p class="sidebar-card__title" style="color:#fff;">Precisa de orientação imobiliária?</p>
        <p class="sidebar-card__body" style="color:rgba(255,255,255,0.5);">Christian Vieira analisa seu perfil e indica o melhor caminho para comprar, investir ou vender no Rio.</p>
        <a href="https://wa.me/5521993399299" target="_blank" rel="noopener" class="cv-btn cv-btn-gold" style="display:flex;width:100%;justify-content:center;">WhatsApp</a>
      </div>
      <div class="sidebar-card">
        <span class="sidebar-card__label">POSTS RELACIONADOS</span>
        ${related}
      </div>
      <div class="sidebar-card">
        <span class="sidebar-card__label">LANÇAMENTOS</span>
        <p class="sidebar-card__body">Conheça os empreendimentos disponíveis com Christian Vieira no Rio de Janeiro.</p>
        <a href="../../index.html#lancamentos" class="cv-btn cv-btn-charcoal" style="display:flex;justify-content:center;font-size:11px;">Ver lançamentos</a>
      </div>
    </aside>
  </div>
</div>

<footer style="background:#060810;border-top:1px solid rgba(184,150,46,0.1);padding:32px clamp(1rem,4vw,2rem);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
  <div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;background:var(--color-gold);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px;font-weight:700;color:#fff;">CV</div><div><p style="font-size:12px;font-weight:600;color:#fff;">Christian Vieira</p><p style="font-family:var(--font-mono);font-size:9px;font-weight:600;letter-spacing:0.08em;color:var(--color-gold);margin-top:1px;">IMÓVEIS &amp; CONSULTORIA · RJ · CRECI 45539</p></div></div>
  <p style="font-family:var(--font-mono);font-size:10px;color:rgba(255,255,255,0.5);">© 2026 Christian Vieira. Todos os direitos reservados.</p>
</footer>
<a href="https://wa.me/5521993399299" target="_blank" rel="noopener" style="position:fixed;bottom:24px;right:24px;z-index:50;width:52px;height:52px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,0.35);text-decoration:none;transition:transform 300ms;" title="WhatsApp"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
<script>(function(){const ham=document.getElementById('nav-hamburger');const mob=document.getElementById('nav-mobile');if(ham&&mob){ham.addEventListener('click',()=>{const o=mob.classList.toggle('is-open');ham.classList.toggle('is-open',o);ham.setAttribute('aria-expanded',o);mob.setAttribute('aria-hidden',!o)});}document.querySelectorAll('.nav-dropdown').forEach(dd=>{const t=dd.querySelector('.nav-dropdown__trigger');if(!t)return;t.addEventListener('click',e=>{e.stopPropagation();dd.classList.toggle('is-open');t.setAttribute('aria-expanded',dd.classList.contains('is-open'))});document.addEventListener('click',()=>{dd.classList.remove('is-open');t.setAttribute('aria-expanded',false)})})})();</script>
</body>
</html>`;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!GEMINI_KEY) {
    console.error('❌  GEMINI_API_KEY não definida. Defina a variável de ambiente antes de rodar.');
    process.exit(1);
  }

  const args      = process.argv.slice(2);
  const dryRun    = args.includes('--dry-run');
  const numArg    = args.find(a => a.startsWith('--num='));
  const forceNum  = numArg ? parseInt(numArg.split('=')[1]) : null;

  const schedule = JSON.parse(fs.readFileSync(SCHEDULE, 'utf8'));
  const post = findPost(schedule, forceNum);

  if (!post) {
    console.log('✅  Nenhum post pendente para hoje. Calendário em dia!');
    return;
  }

  console.log(`📝  Post #${numPad(post.num)}: "${post.title}"`);
  console.log(`📅  Data: ${ptDate(post.date)} | Categoria: ${post.category}`);

  if (dryRun) {
    console.log('\n──── DRY RUN ────');
    console.log(`   HTML destino: blog/posts/${post.slug}.html`);
    console.log(`   Imagem destino: blog/images/${imageName(post)}`);
    console.log('   (nenhum arquivo foi criado)');
    return;
  }

  // 1. Gerar conteúdo
  console.log('\n⏳  Gerando conteúdo via Gemini...');
  const rawText = await geminiText(contentPrompt(post));

  let content;
  try {
    const clean = rawText.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
    content = JSON.parse(clean);
  } catch (e) {
    console.error('❌  Falha ao parsear JSON do Gemini:\n', rawText.slice(0, 500));
    process.exit(1);
  }
  console.log(`✅  Conteúdo gerado (${content.reading_time} min de leitura)`);

  // 2. Gerar imagem
  console.log('\n⏳  Gerando imagem via Gemini Imagen...');
  let imageOk = false;
  try {
    const b64 = await geminiImagen(imagePrompt(post));
    const imgPath = path.join(IMGS_DIR, imageName(post));
    fs.writeFileSync(imgPath, Buffer.from(b64, 'base64'));
    console.log(`✅  Imagem salva: blog/images/${imageName(post)}`);
    imageOk = true;
  } catch (e) {
    console.warn(`⚠️  Imagem não gerada: ${e.message}`);
    console.warn('    O post será criado sem imagem (adicione manualmente depois).');
  }

  // 3. Renderizar e salvar HTML
  const html = renderHTML(post, content, schedule);
  const htmlPath = path.join(POSTS_DIR, post.slug + '.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`\n✅  Post salvo: blog/posts/${post.slug}.html`);

  if (!imageOk) {
    console.warn(`⚠️  Adicione a imagem manualmente em: blog/images/${imageName(post)}`);
  }

  console.log('\n🚀  Pronto! Faça commit e push para publicar no GitHub Pages.');
}

main().catch(err => {
  console.error('❌  Erro fatal:', err.message);
  process.exit(1);
});
