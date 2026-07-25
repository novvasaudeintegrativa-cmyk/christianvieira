# Feed Christian — Série de Vídeos de Autoridade (Instagram Feed)

Série de vídeos curtos para o Feed do Instagram, com conteúdo extraído
diretamente do site institucional (https://corretordeimovelrj.com.br/),
seguindo a **ordem das seções da página** (uma seção = um Feed da série).

## Especificação técnica

- **Formato:** 1080px × 1440px (retrato, feed do Instagram — não é Reels)
- **Duração:** 1 slide único de 20 segundos
- **Áudio:** trilha de fundo (`remotion/public/audio/RealState.mp3`, volume 0.35)
- **Composição Remotion:** `remotion/src/FeedChristian.tsx`, id `FeedChristian`

## Layout (de cima pra baixo)

1. **Logo do Christian Vieira** — 50% maior que o padrão usado nos vídeos de blog/Reels (`remotion/src/BlogAnnouncement.tsx`)
2. **CRECI 45539** — imediatamente abaixo da logo, para reforçar autoridade
3. **Headline** — extraída do H2/título da seção do site. Tamanho base 117px (50% maior que o padrão de 78px dos Reels), mas **reduz proporcionalmente para frases longas** (ver `headlineFontSize()` em `FeedChristian.tsx`) para não estourar o slide
4. **Subheadline** — extraída do parágrafo/corpo logo abaixo do H2 na mesma seção do site
5. **CTA no rodapé:** "SAIBA MAIS NA LEGENDA ABAIXO" com uma **setinha apontando para a esquerda** (diferente do card estático do blog, que usa seta pra baixo)

Tudo estático, visível desde o frame 0 (sem animação de entrada) — mesmo padrão de imediatismo já definido para os vídeos de blog.

## Legenda (Instagram)

Gerada via Gemini, seguindo o mesmo padrão das legendas do blog:
3-4 parágrafos, 3-4 emojis, CTA final "💬 Fale com o Christian Vieira: [link]",
fonte quando aplicável, 8-10 hashtags.

## ClickUp

Cada Feed da série vira uma task na lista **PostInstagram_Blog**
(list id `901327843318`), com o vídeo renderizado anexado, nome no
formato `🎬 Feed Christian #NN — {nome da seção do site}`.

## Sequência (ordem das seções/cards do site, na ordem em que aparecem na página)

Quando uma seção do site tem múltiplos cards (ex: "Quem procura Christian
Vieira" tem 4 cards de desafios), **cada card vira um Feed separado da
série** — headline = título do card, subheadline = texto do card. Isso
gera headlines curtas e mais legíveis que citar a frase inteira da seção.

| # | Origem (seção / card) | Headline | Status |
|---|---|---|---|
| 01 | Quem procura Christian Vieira → card 1 | Dúvida na escolha do imóvel | Gerado 2026-07-25, aguardando aprovação |
| 02 | Quem procura Christian Vieira → card 2 | Medo do financiamento | Pendente |
| 03 | Quem procura Christian Vieira → card 3 | Processo confuso da compra | Pendente |
| 04 | Quem procura Christian Vieira → card 4 | Insegurança na decisão | Pendente |
| 05+ | Próxima seção do site, a definir | — | Pendente |

**Programação:** a série começou em 2026-07-25 às 10h30. Cada Feed é
gerado e enviado ao ClickUp para aprovação antes de agendar a publicação
real no Instagram.

## Fluxo de trabalho

1. Extrair headline + subheadline da próxima seção do site (na ordem em que aparecem na página)
2. Atualizar `feedDefaultProps` em `remotion/src/Root.tsx`
3. Renderizar: `cd remotion && npx remotion render src/index.ts FeedChristian out/feed-christian.mp4`
4. Gerar legenda + criar task no ClickUp (`scripts/create-feed-clickup-task.js`, ajustar headline/subheadline/nome da task a cada novo Feed)
5. Aguardar aprovação do cliente antes de agendar a publicação
