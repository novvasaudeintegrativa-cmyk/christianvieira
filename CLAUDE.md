# CLAUDE.md

## O que é este projeto

Site institucional + blog + automação de conteúdo de **Christian Vieira**, corretor de imóveis no Rio de Janeiro (CRECI 45539). Site em produção: `corretordeimovelrj.com.br`. É um site estático (HTML/CSS/Tailwind via CDN, sem build step no front-end principal) com um pipeline de automação de conteúdo em Node.js por trás.

## Calendário editorial

Quando o usuário mencionar "calendário" (postagens, calendário editorial, agenda de posts), a referência visual é `blog/calendario-editorial.html`. **Mas o source of truth real é `blog/posts-schedule.json`** — é esse arquivo que os scripts de automação e o workflow do GitHub Actions leem para decidir o que publicar. `calendario-editorial.html` é montado/editado manualmente e pode ficar dessincronizado das datas reais do JSON (já aconteceu: post #04 aparece como "25/07" no JSON mas "29/07" no HTML do calendário).

Estado atual (30/07/2026): só existem 4 posts no `posts-schedule.json` (até 25/07/2026). O planejamento de agosto–dezembro (que chegaria a #24) foi **zerado a pedido do cliente** (commit `chore: zerar calendario editorial futuro`) — os próximos temas ainda serão redefinidos do zero.

## Pipeline de blog (automação central do projeto)

Fluxo: `blog/posts-schedule.json` → `scripts/generate-post.js` (Gemini Flash gera texto, Gemini Imagen gera imagem) → grava `blog/posts/{slug}.html` + `blog/images/post-NN-{slug}.jpg` → `scripts/sync-blog-index.js` injeta os cards entre os marcadores `<!-- POSTS:START -->` / `<!-- POSTS:END -->` em `blog/index.html`.

- **Agendamento automático:** `.github/workflows/auto-publish.yml` roda toda terça 11:00 UTC (08:00 BRT), gera o próximo post pendente e faz commit/push. Pode ser disparado manualmente pela aba Actions (`workflow_dispatch`, com `post_num` opcional).
- **Requer `GEMINI_API_KEY`** como secret do repo (ou em `.env.local` localmente, que os scripts carregam automaticamente).
- **Posts "órfãos" — cuidado:** existem 5 arquivos em `blog/posts/` que NÃO estão mais no `posts-schedule.json` atual (`comprar-na-planta-rio.html`, `fipezap-preco-m2-rio-2026.html`, `mercado-imobiliario-rj-2025.html`, `recreio-bandeirantes-valoriza.html`, `selic-queda-financiamento.html`). Sobraram de uma numeração/planejamento anterior ao reset do calendário — ainda existem no disco (e possivelmente acessíveis por URL direta), mas não aparecem no `blog/index.html` nem no schedule atual. Não assuma que todo `.html` em `blog/posts/` está "ativo": confie no `posts-schedule.json` como fonte da verdade.
- Isso também já causou um bug real (`fix: corrigir busca de imagem por prefixo ambiguo`): nomes de imagem tipo `post-02-*` existem duplicados entre numerações antigas e atuais — buscas por prefixo `post-0N` podem casar com o arquivo errado.
- `PostInstagram_Blog.md` tem uma tabela de calendário **desatualizada** (planejamento antigo #01–#07+); não usar como referência de datas reais, só como histórico de contexto.

## Deploy

Dois destinos, definidos em `.github/workflows/static.yml` (roda em todo push para `master`):

1. **GitHub Pages** — ativo, automático, serve como staging/backup.
2. **Hostinger (produção real)** — o job de deploy via FTP está **desativado (`if: false`)** desde 2026-07-22: havia um bug de sincronização confirmado com o suporte da Hostinger (arquivos gravados via FTP não refletiam no site). A solução atual é o repositório conectado direto via **Git no hPanel** (Sites → Avançado → Git), que faz deploy via `git pull`. **Isso significa que o deploy em produção não é 100% automático** — falta configurar o webhook de auto-deploy; por enquanto é preciso clicar "Reimplantar" manualmente no hPanel após cada push. O workflow `auto-publish.yml` tenta notificar isso via webhook do Google Calendar (`secrets.GOOGLE_CALENDAR_WEBHOOK`), se configurado.
3. `.htaccess` desativa cache de HTML (sempre serve versão atual) e usa cache longo (30 dias) para assets estáticos — relevante para não confundir "não vi minha mudança" com bug de deploy.

## Automação de Instagram

`scripts/generate-instagram-content.js` gera legenda (Gemini) + card 1080×1080 (Sharp, sobre a foto do post ou fundo gerado por IA) para cada post do blog, e sobe como task no ClickUp (list id `901327843318`, nome `PostInstagram_Blog`). Requer `CLICKUP_API_TOKEN` e `GEMINI_API_KEY` em `.env.local`. Uso: `--num=N`, `--all`, `--dry-run`.

Separadamente, `scripts/create-feed-clickup-task.js` + `remotion/src/FeedChristian.tsx` geram a série **"Feed Christian"**: vídeos 1080×1440 de 20s extraídos seção a seção do site institucional (não do blog), documentados em `FeedChristian.md`. Fluxo manual: atualizar `feedDefaultProps` em `remotion/src/Root.tsx` → renderizar via Remotion → gerar legenda + task no ClickUp → aguardar aprovação do cliente antes de agendar.

## Remotion (vídeos)

Subprojeto em `remotion/` (Node/TypeScript, tem seu próprio `package.json`). Duas composições em `Root.tsx`:
- `BlogAnnouncement` (1080×1920, Reels de anúncio de post do blog)
- `FeedChristian` (1080×1440, série de Feed do Instagram)

Rodar: `cd remotion && npx remotion studio src/index.ts` (preview) ou `npx remotion render src/index.ts <Composition> out/arquivo.mp4`.

## Estrutura de páginas

- `index.html` — site institucional principal (Tailwind CDN + `design-system.css` + `style.css`).
- `blog/` — blog (índice + posts individuais + calendário editorial).
- `lancamentos/` — uma pasta por empreendimento em lançamento (ArcosdoPorto, CartollaII, ConnectSquare, MetropolitanDream, OrlaRecreioReserva), cada uma com seu `index.html`, carrossel de imagens e PDF do book digital. Linkados no dropdown "Lançamentos" da navbar.
- `design-system.html` / `design-system.css` — guia de estilo/tokens visuais do site (cores navy/gold, tipografia Plus Jakarta Sans).
- `webflow-design.md` — extração de tokens de um design Webflow de referência; é material de apoio/inspiração, não reflete o design system real do site (cores azul/roxo do Webflow, não navy/gold do Christian Vieira).
- `teste.html`, `teste-123.html`, `teste-1234.html`, `ftp-deploy-check.html` — arquivos de teste deixados na raiz durante debug do deploy (FTP/Hostinger), não são páginas reais do site.
- `CHRISTIAN.docx` — documento de briefing/conteúdo do cliente (Word).

## Contexto de negócio

- Christian Vieira atua principalmente em Zona Sul, Zona Oeste (Recreio, Barra da Tijuca) e Zona Norte do Rio de Janeiro.
- WhatsApp de contato: `5521993399299` (usado em CTAs, links `wa.me`, e como CTA final das legendas do Instagram).
- Tom de voz do conteúdo gerado: direto, confiável, educativo mas acessível; artigos em primeira pessoa como "Christian Vieira, corretor e mentor imobiliário com +10 anos de experiência".
