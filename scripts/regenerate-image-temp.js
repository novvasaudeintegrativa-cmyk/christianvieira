#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_IMAGEN = 'imagen-4.0-fast-generate-001';

const OUT = path.join(__dirname, '..', 'blog', 'images', 'post-02-casa-ou-apartamento.jpg');

const prompt = 'Split composition side by side comparison: on the left a modern Brazilian house exterior with a small garden, on the right a modern apartment building facade with balconies, Rio de Janeiro style, soft warm afternoon light, clean minimal architecture photography, no people, no text, professional real estate photography, balanced medium-distance shot, not wide-angle, not panoramic';

async function main() {
  const url = `${GEMINI_BASE}/models/${MODEL_IMAGEN}:predict?key=${GEMINI_KEY}`;
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: '4:3' }
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  if (!res.ok) throw new Error(`Imagen error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data.predictions[0].bytesBase64Encoded;
  fs.writeFileSync(OUT, Buffer.from(b64, 'base64'));
  console.log('Imagem salva em', OUT);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
