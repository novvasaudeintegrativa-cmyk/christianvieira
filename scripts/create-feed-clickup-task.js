#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

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

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_TEXT = 'gemini-2.5-flash';

const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN;
const CLICKUP_BASE = 'https://api.clickup.com/api/v2';
const LIST_ID = '901327843318'; // PostInstagram_Blog

const SITE_URL = 'https://corretordeimovelrj.com.br';

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

function captionPrompt(headline, subheadline) {
  return `Você é o assistente do Christian Vieira, corretor imobiliário no Rio de Janeiro (CRECI 45539).

Escreva uma legenda para Instagram (Feed) sobre este tema:
Headline: "${headline}"
Subheadline: "${subheadline}"

Tema: a dúvida na escolha do imóvel certo — bairro, tipo de imóvel e valor ideal para a realidade de quem está comprando.

REGRAS OBRIGATÓRIAS — siga exatamente:
1. TRÊS ou QUATRO parágrafos separados por linha em branco.
   - 1º parágrafo: apresenta o problema/contexto (2-3 frases).
   - 2º/3º parágrafo: aprofunda com dica prática ou empatia pela dor do leitor.
   - último parágrafo: CTA — convite a conversar com o Christian.
2. Emojis: use 3 ou 4 no total, de forma natural no texto.
3. Após o último parágrafo, coloque uma linha com CTA de contato:
   💬 Fale com o Christian Vieira: https://wa.me/5521993399299
4. Linha em branco, depois de 8 a 10 hashtags relevantes em uma única linha.
5. Tom consultivo, próximo e direto — como Christian fala com clientes face a face.
6. Português brasileiro. Retorne SOMENTE o texto da legenda, sem títulos nem explicações.`;
}

async function createTask(name, description, dueMs) {
  const res = await fetch(`${CLICKUP_BASE}/list/${LIST_ID}/task`, {
    method: 'POST',
    headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description,
      due_date: dueMs,
      due_date_time: true,
      tags: ['feed', 'instagram', 'serie-feed-christian']
    })
  });
  if (!res.ok) throw new Error(`ClickUp create ${res.status}: ${await res.text()}`);
  return (await res.json()).id;
}

async function uploadAttachment(taskId, filePath, filename) {
  const form = new FormData();
  form.append('attachment', new Blob([fs.readFileSync(filePath)]), filename);
  const res = await fetch(`${CLICKUP_BASE}/task/${taskId}/attachment`, {
    method: 'POST',
    headers: { Authorization: CLICKUP_TOKEN },
    body: form
  });
  if (!res.ok) throw new Error(`ClickUp upload ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function main() {
  const headline = 'Dúvida na escolha do imóvel';
  const subheadline = 'Qual bairro, tipo de imóvel e valor ideal para sua realidade.';

  console.log('Gerando legenda via Gemini...');
  const caption = await geminiText(captionPrompt(headline, subheadline));
  console.log('\n' + caption + '\n');

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueMs = new Date(`${todayStr}T10:30:00-03:00`).getTime();

  console.log('Criando task no ClickUp...');
  const taskId = await createTask(
    '🎬 Feed Christian #01 — Quem procura Christian Vieira',
    caption,
    dueMs
  );
  console.log(`Task criada: https://app.clickup.com/t/${taskId}`);

  const videoPath = path.join(ROOT, 'remotion', 'out', 'feed-christian.mp4');
  if (fs.existsSync(videoPath)) {
    console.log('Anexando vídeo...');
    await uploadAttachment(taskId, videoPath, 'feed-christian-01.mp4');
    console.log('Vídeo anexado!');
  } else {
    console.log('Vídeo ainda não existe em remotion/out/feed-christian.mp4 — anexe depois.');
  }

  console.log(`\nConcluído! https://app.clickup.com/t/${taskId}`);
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
