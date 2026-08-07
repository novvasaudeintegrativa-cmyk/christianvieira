import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';

export type FeedChristianProps = {
  headline: string;
  subheadline: string;
};

const NAVY = '#0D1B2A';
const NAVY_DARK = '#091219';
const GOLD = '#D4AE4A';
const FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";

// headline 50% maior que o padrao do BlogAnnouncement (78px) para frases curtas,
// reduzindo proporcionalmente para frases longas caberem bem no slide
function headlineFontSize(headline: string): number {
  const MAX = 117; // 78 * 1.5
  const MIN = 62;
  const SHORT = 25; // ate 25 chars, usa o tamanho maximo
  const LONG = 80; // a partir de 80 chars, usa o tamanho minimo
  if (headline.length <= SHORT) return MAX;
  if (headline.length >= LONG) return MIN;
  const t = (headline.length - SHORT) / (LONG - SHORT);
  return Math.round(MAX - t * (MAX - MIN));
}

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame % 90, [0, 45, 90], [0.28, 0.5, 0.28]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 20%, rgba(212,174,74,${glow * 0.2}) 0%, ${NAVY} 55%, ${NAVY_DARK} 100%)`,
      }}
    />
  );
};

// logo 50% maior que o padrao do BlogAnnouncement + CRECI logo abaixo (autoridade)
const LogoWithCreci: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 110,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 27 }}>
      <svg width="57" height="57" viewBox="0 0 36 36" fill="none">
        <polyline
          points="6,30 18,5 30,30"
          stroke={GOLD}
          strokeWidth="2.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <rect x="16.55" y="3.55" width="2.9" height="2.9" fill={GOLD} transform="rotate(45 18 5)" />
      </svg>
      <span
        style={{
          fontFamily: FONT,
          fontSize: 45,
          fontWeight: 700,
          letterSpacing: 4,
          color: '#fff',
        }}
      >
        CHRISTIAN VIEIRA
      </span>
    </div>
    <span
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 3,
        color: GOLD,
        opacity: 0.85,
      }}
    >
      CRECI 45539
    </span>
  </div>
);

// CTA com setinha do lado esquerdo (em vez de seta embaixo, como no card estatico)
const CtaSaibaMais: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 110,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}
  >
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
    <span
      style={{
        fontFamily: FONT,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: 3,
        color: '#fff',
      }}
    >
      SAIBA MAIS NA LEGENDA ABAIXO
    </span>
  </div>
);

// slide unico, estatico desde o frame 0, 20s, com audio de fundo
export const FeedChristian: React.FC<FeedChristianProps> = ({ headline, subheadline }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Audio src={staticFile('audio/RealState.mp3')} volume={0.35} />
      <Background />
      <LogoWithCreci />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 90px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
          <h1
            style={{
              margin: 0,
              fontSize: headlineFontSize(headline),
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: -2,
              color: '#fff',
              textAlign: 'center',
              fontFamily: FONT,
            }}
          >
            {headline}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 500,
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'center',
              maxWidth: 820,
              fontFamily: FONT,
            }}
          >
            {subheadline}
          </p>
        </div>
      </AbsoluteFill>
      <CtaSaibaMais />
    </AbsoluteFill>
  );
};

export const FEED_DURATION = 600; // 20s a 30fps
