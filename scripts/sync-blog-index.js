'use strict';
const fs      = require('fs');
const path    = require('path');

const ROOT     = path.join(__dirname, '..');
const SCHED    = path.join(ROOT, 'blog', 'posts-schedule.json');
const INDEX    = path.join(ROOT, 'blog', 'index.html');
const IMG_DIR  = path.join(ROOT, 'blog', 'images');
const POST_DIR = path.join(ROOT, 'blog', 'posts');

const schedule = JSON.parse(fs.readFileSync(SCHED, 'utf8'));
const today    = new Date().toISOString().slice(0, 10);

const published = schedule.posts
  .filter(p => p.date <= today)
  .sort((a, b) => b.date.localeCompare(a.date));

if (!published.length) {
  console.log('Nenhum post publicado ainda. blog/index.html não alterado.');
  process.exit(0);
}

function pad(n) { return String(n).padStart(2, '0'); }

function findThumb(post) {
  const prefix = `post-${pad(post.num)}-`;
  try {
    const files = fs.readdirSync(IMG_DIR);
    const match = files.find(f => f.startsWith(prefix) && /\.(jpe?g|png|webp)$/i.test(f));
    return match ? `images/${match}` : null;
  } catch { return null; }
}

function getExcerpt(post) {
  const file = path.join(POST_DIR, `${post.slug}.html`);
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
           || html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
    if (m) return m[1];
  }
  return `Leia o artigo e saiba mais sobre o mercado imobiliário do Rio de Janeiro com Christian Vieira, CRECI 45539.`;
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

const ARROW_SM = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
const ARROW_MD = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

function thumbEl(post, src) {
  if (src) return `<img class="post-card__thumb-img" src="${src}" alt="${post.title}">`;
  return `<div class="post-card__thumb-placeholder"><span class="post-card__thumb-icon">🏙️</span></div>`;
}

function featuredCard(p) {
  const thumb   = findThumb(p);
  const excerpt = getExcerpt(p);
  return `
    <!-- Post Destaque: #${pad(p.num)} -->
    <article class="post-card post-card--featured" data-category="${p.category.toLowerCase()}">
      <div class="post-card__thumb">
        ${thumbEl(p, thumb)}
      </div>
      <div class="post-card__body">
        <span class="post-card__badge">DESTAQUE DA SEMANA</span>
        <div class="post-card__meta">
          <span class="post-card__tag ${p.tag_class}">${p.category}</span>
          <span class="post-card__date">${fmtDate(p.date)}</span>
        </div>
        <h2 class="post-card__title">${p.title}</h2>
        <p class="post-card__excerpt">${excerpt}</p>
        <a href="posts/${p.slug}.html" class="post-card__link">
          Ler artigo completo
          ${ARROW_MD}
        </a>
      </div>
    </article>`;
}

function regularCard(p) {
  const thumb   = findThumb(p);
  const excerpt = getExcerpt(p);
  return `
    <!-- Post #${pad(p.num)} -->
    <article class="post-card" data-category="${p.category.toLowerCase()}">
      <div class="post-card__thumb">
        ${thumbEl(p, thumb)}
      </div>
      <div class="post-card__body">
        <div class="post-card__meta">
          <span class="post-card__tag ${p.tag_class}">${p.category}</span>
          <span class="post-card__date">${fmtDate(p.date)}</span>
        </div>
        <h2 class="post-card__title">${p.title}</h2>
        <p class="post-card__excerpt">${excerpt}</p>
        <a href="posts/${p.slug}.html" class="post-card__link">Ler artigo ${ARROW_SM}</a>
      </div>
    </article>`;
}

const [featured, ...rest] = published;
const gridContent = [featuredCard(featured), ...rest.map(regularCard)].join('\n');

let html = fs.readFileSync(INDEX, 'utf8');
const START_MARKER = '<!-- POSTS:START -->';
const END_MARKER   = '<!-- POSTS:END -->';
const si = html.indexOf(START_MARKER);
const ei = html.indexOf(END_MARKER);

if (si === -1 || ei === -1) {
  console.error('ERRO: Marcadores <!-- POSTS:START --> e <!-- POSTS:END --> não encontrados em blog/index.html');
  process.exit(1);
}

html = html.slice(0, si + START_MARKER.length) + gridContent + '\n    ' + html.slice(ei);

// Injeta timestamp de build para garantir que o FTP detecte mudança a cada deploy
const buildTag = `<!-- build:${new Date().toISOString()} -->`;
html = html.replace(/<!-- build:.*?-->/, '').replace('</head>', `${buildTag}\n</head>`);

fs.writeFileSync(INDEX, html, 'utf8');

console.log(`✅ blog/index.html sincronizado — ${published.length} post(s) publicado(s):`);
published.forEach(p => console.log(`   • #${pad(p.num)}  ${p.date}  ${p.title}`));

// Exporta variáveis para GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  const out = [
    `post_title=${featured.title}`,
    `post_date=${featured.date}`,
    `post_num=${pad(featured.num)}`,
    `post_count=${published.length}`,
    `post_url=https://corretordeimovelrj.com.br/blog/posts/${featured.slug}.html`,
  ].join('\n') + '\n';
  fs.appendFileSync(process.env.GITHUB_OUTPUT, out, 'utf8');
}
