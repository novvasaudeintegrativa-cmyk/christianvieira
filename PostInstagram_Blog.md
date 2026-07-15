# Post Instagram — Blog Christian Vieira

Automação para gerar legenda + imagem de cada post do blog e subir como task no ClickUp.

---

## O que faz

Para cada post do `blog/posts-schedule.json`, o script:

1. **Gera a legenda** (Gemini Flash)
   - Texto em português, tom consultivo e próximo
   - Emojis estratégicos
   - Hashtags do mercado imobiliário RJ
   - Link da postagem: `https://corretordeimovelrj.com.br/blog/posts/{slug}.html`

2. **Gera a imagem 1:1** (Gemini Imagen · 1080×1080)
   - Fundo navy + acentos dourados (identidade do site)
   - Headline = título do post
   - Subheadline = chamada curta e direta
   - Rodapé: `corretordeimovelrj.com.br`
   - Salva em `blog/images/instagram-post-NN-{slug}.jpg`

3. **Cria task no ClickUp**
   - Título: `📸 Instagram — {título do post}`
   - Descrição: legenda pronta para copiar e colar
   - Data de entrega: data de publicação do post
   - Anexo: imagem gerada

---

## Script

**Arquivo:** `scripts/generate-instagram-content.js`

**Uso:**
```
node scripts/generate-instagram-content.js --num=2    # post específico pelo número
node scripts/generate-instagram-content.js --all      # todos os posts pendentes
```

---

## Configuração necessária

Adicionar no `.env.local` (já existe, só confirmar):

```
CLICKUP_API_TOKEN=...
GEMINI_API_KEY=...
```

**ClickUp List ID** — lista configurada:
```
CLICKUP_LIST_ID=901327843318
```

---

## Calendário de posts

| # | Data | Título | Categoria |
|---|------|--------|-----------|
| 01 | 08 Jul 2026 | Erros do comprador de primeiro imóvel | GUIA |
| 02 | 15 Jul 2026 | Casa ou apartamento? Como escolher | DICAS |
| 03 | 22 Jul 2026 | Comprar na planta no Rio de Janeiro | GUIA |
| 04 | 29 Jul 2026 | Recreio dos Bandeirantes: por que valoriza? | MERCADO |
| 05 | 05 Ago 2026 | Queda da Selic e o financiamento imobiliário | MERCADO |
| 06 | 12 Ago 2026 | FipeZap: preço do m² no Rio em 2026 | DADOS |
| 07 | 19 Ago 2026 | Mercado imobiliário RJ em 2025 | MERCADO |
| … | … | … | … |
