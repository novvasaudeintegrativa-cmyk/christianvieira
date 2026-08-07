import React from 'react';
import {
  AbsoluteFill,
  Series,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
} from 'remotion';

export type FeedCarrosselProps = {
  slides: string[]; // 1 texto por tela (2 a 5 telas)
};

const NAVY = '#0D1B2A';
const NAVY_DARK = '#091219';
const GOLD = '#D4AE4A';
const FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";

export const CARROSSEL_SLIDE_DURATION = 150; // 5s a 30fps por tela

function slideFontSize(text: string): number {
  const MAX = 96;
  const MIN = 56;
  const SHORT = 25;
  const LONG = 100;
  if (text.length <= SHORT) return MAX;
  if (text.length >= LONG) return MIN;
  const t = (text.length - SHORT) / (LONG - SHORT);
  return Math.round(MAX - t * (MAX - MIN));
}

const Background: React.FC<{ pulseSeed?: number }> = ({ pulseSeed = 0 }) => {
  const frame = useCurrentFrame();
  const glow = interpolate((frame + pulseSeed) % 90, [0, 45, 90], [0.28, 0.5, 0.28]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 20%, rgba(212,174,74,${glow * 0.2}) 0%, ${NAVY} 55%, ${NAVY_DARK} 100%)`,
      }}
    />
  );
};

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
        <polyline points="6,30 18,5 30,30" stroke={GOLD} strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="16.55" y="3.55" width="2.9" height="2.9" fill={GOLD} transform="rotate(45 18 5)" />
      </svg>
      <span style={{ fontFamily: FONT, fontSize: 45, fontWeight: 700, letterSpacing: 4, color: '#fff' }}>
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

// indicador de progresso (bolinhas) — mostra em qual tela do carrossel estamos
const Dots: React.FC<{ index: number; total: number }> = ({ index, total }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 170,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === index ? 28 : 10,
          height: 10,
          borderRadius: 5,
          background: i === index ? GOLD : 'rgba(255,255,255,0.25)',
          transition: 'width .2s',
        }}
      />
    ))}
  </div>
);

const CtaLinkNaBio: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 100,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}
  >
    <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
      🔗 LINK NA BIO
    </span>
  </div>
);

const CarrosselSlide: React.FC<{ text: string; index: number; total: number }> = ({ text, index, total }) => {
  const isLast = index === total - 1;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background pulseSeed={index * 30} />
      <LogoWithCreci />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 100px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: slideFontSize(text),
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: -1.5,
            color: '#fff',
            textAlign: 'center',
            fontFamily: FONT,
          }}
        >
          {text}
        </h1>
      </AbsoluteFill>
      <Dots index={index} total={total} />
      {isLast && <CtaLinkNaBio />}
    </AbsoluteFill>
  );
};

// carrossel multi-tela: 1 texto por tela, audio continuo do inicio ao fim
export const FeedCarrossel: React.FC<FeedCarrosselProps> = ({ slides }) => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio/RealState.mp3')} volume={0.35} />
      <Series>
        {slides.map((text, i) => (
          <Series.Sequence durationInFrames={CARROSSEL_SLIDE_DURATION} key={i}>
            <CarrosselSlide text={text} index={i} total={slides.length} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

export function carrosselDuration(slideCount: number) {
  return CARROSSEL_SLIDE_DURATION * slideCount;
}
