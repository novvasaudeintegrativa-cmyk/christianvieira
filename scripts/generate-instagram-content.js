#!/usr/bin/env node
/**
 * generate-instagram-content.js
 *
 * Para cada post do calendário:
 *  1. Gera legenda Instagram via Gemini (3 parágrafos, 3 emojis, CTA com link)
 *  2. Cria card 1080×1440 com headline + subheadline + CTA sobre a foto do blog
 *  3. Sobe task no ClickUp com legenda e card em anexo
 *
 * Uso:
 *   node scripts/generate-instagram-content.js --num=2
 *   node scripts/generate-instagram-content.js --all
 *   node scripts/generate-instagram-content.js --num=2 --dry-run
 */

const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const SCHEDULE = path.join(ROOT, 'blog', 'posts-schedule.json');
const IMGS_DIR = path.join(ROOT, 'blog', 'images');

// ─── carrega .env.local ──────────────────────────────────────────────────────
(function loadEnv() {
  const envFile = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx < 1 || line.trim().startsWith('#')) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  });
})();

const GEMINI_KEY   = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ALT;
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_TEXT   = 'gemini-2.5-flash';
const MODEL_IMAGEN = 'imagen-4.0-fast-generate-001';

const CLICKUP_TOKEN   = process.env.CLICKUP_API_TOKEN;
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID || '901327843318';
const CLICKUP_BASE    = 'https://api.clickup.com/api/v2';

const SITE_URL = 'https://corretordeimovelrj.com.br';

// ─── helpers gerais ─────────────────────────────────────────────────────────

function numPad(n) { return String(n).padStart(2, '0'); }

function postUrl(post) {
  return `${SITE_URL}/blog/posts/${post.slug}.html`;
}

function xmlEsc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// quebra texto em linhas respeitando maxChars por linha
function wrapText(text, maxChars) {
  const words  = text.split(' ');
  const lines  = [];
  let   current = '';
  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── subheadlines por categoria ─────────────────────────────────────────────

const SUBHEADLINES = {
  DICAS:         'Tudo que você precisa saber antes de decidir',
  GUIA:          'O guia completo para tomar a decisão certa',
  MERCADO:       'Entenda o cenário e invista com inteligência',
  FINANCIAMENTO: 'Finanças imobiliárias sem mistério',
  DADOS:         'Dados reais do mercado carioca',
  INVESTIMENTO:  'Estratégias para construir patrimônio',
  BAIRROS:       'Os melhores bairros do Rio de Janeiro',
  DOCUMENTOS:    'Documentação sem complicação',
  CUSTOS:        'Quanto custa de verdade',
  AVALIAÇÃO:     'Saiba o valor real do imóvel',
};

// ─── Gemini text ─────────────────────────────────────────────────────────────

async function geminiText(prompt) {
  const url = `${GEMINI_BASE}/models/${MODEL_TEXT}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 2048 }
    })
  });
  if (!res.ok) throw new Error(`Gemini text ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// ─── Gemini Imagen (fundo para posts sem foto no blog) ───────────────────────

async function geminiImagen(post) {
  const sub   = SUBHEADLINES[post.category] || 'Consultoria imobiliária no Rio de Janeiro';
  const prompt = `Luxury real estate lifestyle photo, Rio de Janeiro, warm natural light.
Scene: elegant living room or building exterior with ocean view, no people, no text.
Style: architectural photography, sharp detail, golden hour light, premium quality.
Category context: ${post.category} — ${sub}.
Aspect ratio 3:4 portrait. High resolution, cinematic.`;

  const url = `${GEMINI_BASE}/models/${MODEL_IMAGEN}:predict?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances:  [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '3:4' }
    })
  });
  if (!res.ok) throw new Error(`Imagen ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.predictions[0].bytesBase64Encoded;
}

// ─── caption prompt ──────────────────────────────────────────────────────────

// fontes de referência por categoria
const SOURCES = {
  DICAS:         'Christian Vieira, Corretor de Imóveis · CRECI 45539 · Experiência prática no mercado carioca',
  GUIA:          'Christian Vieira, Corretor de Imóveis · CRECI 45539 · Mercado imobiliário do Rio de Janeiro',
  MERCADO:       'SECOVI-RJ · FipeZAP · Christian Vieira, CRECI 45539',
  FINANCIAMENTO: 'Banco Central do Brasil · Caixa Econômica Federal · Christian Vieira, CRECI 45539',
  DADOS:         'FipeZAP · IBGE · SECOVI-RJ · Christian Vieira, CRECI 45539',
  INVESTIMENTO:  'SECOVI-RJ · FipeZAP · Christian Vieira, CRECI 45539',
  BAIRROS:       'Prefeitura do Rio de Janeiro · ZAP Imóveis · Christian Vieira, CRECI 45539',
  DOCUMENTOS:    'Cartório de Registro de Imóveis · Conselho Federal de Corretores (COFECI) · Christian Vieira, CRECI 45539',
  CUSTOS:        'SELIC/Banco Central · Receita Federal · Christian Vieira, CRECI 45539',
  AVALIAÇÃO:     'FipeZAP · CRECI-RJ · Christian Vieira, CRECI 45539',
};

function captionPrompt(post) {
  const url    = postUrl(post);
  const fonte  = SOURCES[post.category] || 'Christian Vieira, CRECI 45539 · corretordeimovelrj.com.br';
  return `Você é o assistente do Christian Vieira, corretor imobiliário no Rio de Janeiro (CRECI 45539).

Escreva uma legenda para Instagram sobre este post do blog:
Título: "${post.title}"
Categoria: ${post.category}

REGRAS OBRIGATÓRIAS — siga exatamente:
1. TRÊS parágrafos separados por linha em branco.
   - 1º parágrafo: apresenta o problema ou contexto (2-3 frases).
   - 2º parágrafo: aprofunda com dica prática ou dado relevante (2-3 frases).
   - 3º parágrafo: CTA — convite a ler o artigo completo.
2. Emojis: use pelo menos 1 emoji por parágrafo, de forma natural no texto (não apenas no fim).
3. Após o 3º parágrafo, coloque o link em linha própria:
   ${url}
4. Linha em branco, depois a fonte de referência exatamente assim:
   📚 Fonte: ${fonte}
5. Linha em branco, depois de 8 a 10 hashtags relevantes em uma única linha.
6. Tom consultivo, próximo e direto — como Christian fala com clientes face a face.
7. Português brasileiro. Retorne SOMENTE o texto da legenda, sem títulos nem explicações.

ESTRUTURA EXATA DE SAÍDA:
[1º parágrafo com emoji(s)]

[2º parágrafo com emoji(s)]

[3º parágrafo CTA com emoji(s)]
${url}

📚 Fonte: ${fonte}

#hashtag1 #hashtag2 ...`;
}

// ─── ClickUp ─────────────────────────────────────────────────────────────────

async function createTask(post, caption) {
  const dueMs = new Date(post.date + 'T12:00:00-03:00').getTime();
  const res = await fetch(`${CLICKUP_BASE}/list/${CLICKUP_LIST_ID}/task`, {
    method:  'POST',
    headers: { 'Authorization': CLICKUP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:          `📸 Instagram — ${post.title}`,
      description:   caption,
      due_date:      dueMs,
      due_date_time: false,
      tags:          ['instagram', 'blog', post.category.toLowerCase()]
    })
  });
  if (!res.ok) throw new Error(`ClickUp create ${res.status}: ${await res.text()}`);
  return (await res.json()).id;
}

async function uploadAttachment(taskId, imgPath, filename) {
  const form = new FormData();
  form.append('attachment', new Blob([fs.readFileSync(imgPath)], { type: 'image/jpeg' }), filename);
  const res = await fetch(`${CLICKUP_BASE}/task/${taskId}/attachment`, {
    method:  'POST',
    headers: { 'Authorization': CLICKUP_TOKEN },
    body:    form
  });
  if (!res.ok) throw new Error(`ClickUp upload ${res.status}: ${await res.text()}`);
  return await res.json();
}

// ─── localiza foto original do post no blog ──────────────────────────────────

function findBlogImage(post) {
  const exact = `post-${numPad(post.num)}-${post.slug}.jpg`;
  const found = fs.readdirSync(IMGS_DIR).find(f => f === exact);
  return found ? path.join(IMGS_DIR, found) : null;
}

// ─── card Instagram 1080×1440 ────────────────────────────────────────────────
//
// Layout (de cima pra baixo):
//   ┌─ navbar area (faixa navy translúcida) ─────────────────────────────────┐
//   │  logo mark  ·  Christian Vieira  ·  CRECI 45539                       │
//   ├─ linha ouro ────────────────────────────────────────────────────────── │
//   │                                                                         │
//   │          [ FOTO DO POST — área central da imagem ]                     │
//   │                                                                         │
//   ├─ gradiente navy crescente ──────────────────────────────────────────── │
//   │  [CATEGORIA]                                                            │
//   │  HEADLINE em branco bold                                                │
//   │  ── barra ouro ──                                                       │
//   │  Subheadline em branco 65%                                              │
//   │  ─────────────────────── linha divisória ouro ───────────────────       │
//   │          SAIBA MAIS NA LEGENDA ABAIXO  ▼                               │
//   │                         corretordeimovelrj.com.br                      │
//   └────────────────────────────────────────────────────────────────────────┘

async function createInstagramCard(post, srcPath, outPath) {
  const sharp = require('sharp');

  const W  = 1080;
  const H  = 1440;
  const PX = 72;   // padding horizontal

  // Cores design system
  const NAVY  = '#0D1B2A';
  const GOLD  = '#C5973E';
  const WHITE = '#FFFFFF';

  // Tipografia — tamanhos ajustados
  const HEADLINE_FS = 74;
  const LINE_H      = HEADLINE_FS + 18;  // 92px por linha

  const sub  = xmlEsc(SUBHEADLINES[post.category] || 'Consultoria imobiliária no Rio de Janeiro');
  const cat  = xmlEsc(post.category);
  const catW = Math.max(130, post.category.length * 14 + 52);

  // Headline ~22 chars/linha a 74px
  const headLines = wrapText(post.title, 22);
  const numLines  = headLines.length;

  // ── Layout ancorado no rodapé ────────────────────────────────────────────
  const siteY    = H -  30;   // URL rodapé   (18px)
  const arrowCy  = H -  90;   // seta centro
  const ctaY     = H - 144;   // CTA texto    (20px)
  const divY     = H - 194;   // linha divisória
  const subY     = H - 252;   // subheadline  (28px)
  const barY     = H - 308;   // barra dourada
  const hlLastY  = H - 352;   // última linha headline
  const hlFirstY = hlLastY - (numLines - 1) * LINE_H;
  const catPillY = hlFirstY - 108;  // pílula bem acima, sem sobreposição

  // Constrói tspans do headline
  const tspans = headLines.map((line, i) =>
    `<tspan x="${PX}" dy="${i === 0 ? 0 : LINE_H}">${xmlEsc(line)}</tspan>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <!-- Gradiente principal: foto visível no centro, pesado só embaixo -->
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${NAVY}" stop-opacity="0.0"/>
      <stop offset="20%"  stop-color="${NAVY}" stop-opacity="0.0"/>
      <stop offset="52%"  stop-color="${NAVY}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${NAVY}" stop-opacity="0.96"/>
    </linearGradient>
    <!-- Faixa topo navbar -->
    <linearGradient id="topbar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${NAVY}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${NAVY}" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <!-- Overlay gradiente principal -->
  <rect width="${W}" height="${H}" fill="url(#grad)"/>

  <!-- Faixa navbar topo -->
  <rect x="0" y="0" width="${W}" height="124" fill="url(#topbar)"/>

  <!-- Logo mark: chevron + diamante (maior) -->
  <g transform="translate(${PX}, 20)">
    <polyline points="0,48 22,4 44,48"
      stroke="${GOLD}" stroke-width="3.6" stroke-linecap="square"
      stroke-linejoin="miter" fill="none"/>
    <rect x="17.8" y="0.8" width="8.5" height="8.5" fill="${GOLD}"
      transform="rotate(45 22 4)"/>
  </g>

  <!-- Nome -->
  <text x="${PX + 66}" y="52"
    fill="${WHITE}" font-size="26" font-weight="700"
    font-family="Arial, Helvetica, sans-serif">Christian Vieira</text>
  <!-- CRECI -->
  <text x="${PX + 66}" y="78"
    fill="${GOLD}" font-size="14" font-family="Arial, Helvetica, sans-serif"
    letter-spacing="2.5">CRECI 45539 · IMÓVEIS RJ</text>

  <!-- Linha separadora topo -->
  <line x1="${PX}" y1="100" x2="${W - PX}" y2="100"
    stroke="${GOLD}" stroke-width="1" stroke-opacity="0.35"/>

  <!-- ── Pílula categoria — bem visível acima do headline ── -->
  <rect x="${PX}" y="${catPillY}" width="${catW}" height="42"
    rx="6"
    fill="rgba(197,151,62,0.25)"
    stroke="${GOLD}" stroke-width="1.8" stroke-opacity="0.85"/>
  <text x="${PX + catW / 2}" y="${catPillY + 29}"
    fill="${GOLD}" font-size="14" font-weight="700"
    font-family="Arial, Helvetica, sans-serif"
    text-anchor="middle" letter-spacing="4">${cat}</text>

  <!-- ── Headline ── -->
  <text y="${hlFirstY}"
    fill="${WHITE}" font-size="${HEADLINE_FS}" font-weight="800"
    font-family="Arial, Helvetica, sans-serif">${tspans}</text>

  <!-- Barra dourada -->
  <rect x="${PX}" y="${barY}" width="88" height="4" rx="2" fill="${GOLD}"/>

  <!-- ── Subheadline ── -->
  <text x="${PX}" y="${subY}"
    fill="rgba(255,255,255,0.75)" font-size="28"
    font-family="Arial, Helvetica, sans-serif">${sub}</text>

  <!-- Linha divisória -->
  <line x1="${PX}" y1="${divY}" x2="${W - PX}" y2="${divY}"
    stroke="${GOLD}" stroke-width="0.9" stroke-opacity="0.30"/>

  <!-- ── CTA ── -->
  <text x="${W / 2}" y="${ctaY}"
    fill="${WHITE}" font-size="20" font-weight="700"
    font-family="Arial, Helvetica, sans-serif"
    text-anchor="middle" letter-spacing="4">SAIBA MAIS NA LEGENDA ABAIXO</text>

  <!-- Seta para baixo (triângulo ouro, maior) -->
  <polygon
    points="${W/2 - 20},${arrowCy - 14}  ${W/2 + 20},${arrowCy - 14}  ${W/2},${arrowCy + 14}"
    fill="${GOLD}"/>

  <!-- ── URL rodapé — legível ── -->
  <text x="${W / 2}" y="${siteY}"
    fill="rgba(255,255,255,0.55)" font-size="18"
    font-family="Arial, Helvetica, sans-serif"
    text-anchor="middle" letter-spacing="2">corretordeimovelrj.com.br</text>
</svg>`;

  await sharp(srcPath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .composite([{ input: Buffer.from(svg), gravity: 'northwest' }])
    .jpeg({ quality: 92 })
    .toFile(outPath);
}

// ─── processamento de um post ────────────────────────────────────────────────

async function processPost(post, dryRun) {
  const url = postUrl(post);
  console.log(`\n📱 Post #${numPad(post.num)}: ${post.title}`);
  console.log(`   📅 ${post.date}  |  ${post.category}  |  ${url}`);

  // 1. Legenda
  console.log('\n   ✍️  Gerando legenda...');
  const caption = await geminiText(captionPrompt(post));
  console.log('\n   Legenda:');
  console.log('   ' + '─'.repeat(56));
  console.log(caption.split('\n').map(l => '   ' + l).join('\n'));
  console.log('   ' + '─'.repeat(56));

  if (dryRun) {
    const previewPath = path.join(ROOT, '.caption-preview.txt');
    fs.writeFileSync(previewPath, caption, 'utf8');
    console.log(`\n   [dry-run] Legenda salva em .caption-preview.txt. Card e ClickUp pulados.\n`);
    return;
  }

  // 2. Card Instagram 1080×1440
  const cardFilename = `instagram-card-${numPad(post.num)}-${post.slug}.jpg`;
  const cardPath     = path.join(IMGS_DIR, cardFilename);

  const blogImg = findBlogImage(post);
  if (blogImg) {
    console.log(`\n   🎨 Criando card sobre foto do blog (${path.basename(blogImg)})...`);
    await createInstagramCard(post, blogImg, cardPath);
  } else {
    console.log('\n   🖼️  Nenhuma foto do blog — gerando fundo via IA...');
    const b64    = await geminiImagen(post);
    const tmpPath = path.join(IMGS_DIR, `_tmp-bg-${numPad(post.num)}.jpg`);
    fs.writeFileSync(tmpPath, Buffer.from(b64, 'base64'));
    console.log('   🎨 Aplicando layout ao fundo gerado...');
    await createInstagramCard(post, tmpPath, cardPath);
    fs.unlinkSync(tmpPath);
  }
  console.log(`   💾 Card salvo: blog/images/${cardFilename}`);

  // 3. Task no ClickUp
  console.log('\n   📋 Criando task no ClickUp...');
  const taskId = await createTask(post, caption);
  console.log(`   ✅ Task: https://app.clickup.com/t/${taskId}`);

  // 4. Anexar card
  console.log('   📎 Anexando card...');
  await uploadAttachment(taskId, cardPath, cardFilename);
  console.log('   ✅ Card anexado!');
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  // Verifica sharp
  try { require('sharp'); } catch (e) {
    console.error('❌  Dependência "sharp" não encontrada. Execute: npm install');
    process.exit(1);
  }

  const args   = process.argv.slice(2);
  const numArg = args.find(a => a.startsWith('--num='))?.split('=')[1];
  const all    = args.includes('--all');
  const dryRun = args.includes('--dry-run');

  if (!GEMINI_KEY)               { console.error('❌  GEMINI_API_KEY não definida'); process.exit(1); }
  if (!CLICKUP_TOKEN && !dryRun) { console.error('❌  CLICKUP_API_TOKEN não definida'); process.exit(1); }

  if (!numArg && !all) {
    console.log('Uso:\n  node scripts/generate-instagram-content.js --num=2\n  node scripts/generate-instagram-content.js --all\n  node scripts/generate-instagram-content.js --num=2 --dry-run');
    process.exit(0);
  }

  const schedule = JSON.parse(fs.readFileSync(SCHEDULE, 'utf8'));
  const targets  = numArg
    ? schedule.posts.filter(p => p.num === parseInt(numArg))
    : schedule.posts;

  if (!targets.length) { console.error(`❌  Post #${numArg} não encontrado.`); process.exit(1); }

  console.log(`\n🚀 Gerando conteúdo Instagram para ${targets.length} post(s)...`);
  for (const post of targets) await processPost(post, dryRun);
  console.log('\n✅ Concluído!\n');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
