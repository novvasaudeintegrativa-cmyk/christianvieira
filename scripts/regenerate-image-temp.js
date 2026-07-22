#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_IMAGEN = 'imagen-4.0-fast-generate-001';

const OUT = path.join(__dirname, '..', 'blog', 'images', 'post-02-casa-ou-apartamento.jpg');

const prompt = 'Photo of a small modern single-family house with a front garden and tiled roof, tropical plants, sunny day, residential street in Rio de Janeiro Brazil, warm afternoon light, clean minimal contemporary Brazilian residential architecture, no people, no text, professional real estate photography, medium-distance eye-level shot, not wide-angle, not panoramic, not a skyscraper, not an office building, low-rise 1-2 story house only';

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
