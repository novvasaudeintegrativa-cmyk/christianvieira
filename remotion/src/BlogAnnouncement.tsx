import React from 'react';
import {
  AbsoluteFill,
  Series,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

export type BlogAnnouncementProps = {
  title: string;
  highlightWord: string; // palavra do titulo a destacar em dourado
  category: string;
  date: string;
  hook: string;
  highlights: string[]; // 2 a 4 destaques curtos
  cta: string;
};

export const SLIDE_DURATION = 210; // 7s a 30fps — padrao fixo de todo video Remotion com texto

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  DICAS: { bg: 'rgba(120,60,160,0.16)', fg: '#c79bf0' },
  FINANCIAMENTO: { bg: 'rgba(184,150,46,0.16)', fg: '#D4AE4A' },
  BAIRROS: { bg: 'rgba(34,130,84,0.18)', fg: '#4fd18a' },
  DOCUMENTOS: { bg: 'rgba(184,150,46,0.16)', fg: '#D4AE4A' },
  CUSTOS: { bg: 'rgba(200,60,30,0.18)', fg: '#ff8a68' },
  'AVALIAÇÃO': { bg: 'rgba(30,100,180,0.18)', fg: '#6fa8ff' },
  MERCADO: { bg: 'rgba(0,130,130,0.18)', fg: '#4fd6d6' },
};

const NAVY = '#0D1B2A';
const NAVY_DARK = '#091219';
const GOLD = '#D4AE4A';
const GREEN = '#25D366';
const FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";

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

// ── Logo fixo no topo (padrao de todo video Remotion com texto) ─────────────
const Logo: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 70,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    }}
  >
    <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
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
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 3,
        color: '#fff',
      }}
    >
      CHRISTIAN VIEIRA
    </span>
  </div>
);

const Footer: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 90,
      left: 90,
      right: 90,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontSize: 26,
      color: 'rgba(255,255,255,0.45)',
      fontFamily: FONT,
    }}
  >
    <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>CHRISTIAN VIEIRA</span>
    <span>·</span>
    <span>CRECI 45539</span>
  </div>
);

// ícone de "video/reel" — badge de play
const VideoIcon: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'rgba(212,174,74,0.16)',
      border: `1.5px solid ${GOLD}`,
    }}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill={GOLD}>
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
);

// título com a palavra de destaque colorida em dourado
const TitleWithHighlight: React.FC<{ title: string; highlightWord: string }> = ({
  title,
  highlightWord,
}) => {
  if (!highlightWord) return <>{title}</>;
  const parts = title.split(new RegExp(`(${highlightWord})`, 'i'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlightWord.toLowerCase() ? (
          <span key={i} style={{ color: GOLD }}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

// util: entrada com spring (fade + slide up)
function useEnter(delay: number, damping = 200) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(frame - delay, 0);
  const v = spring({ frame: local, fps, config: { damping } });
  return {
    opacity: interpolate(v, [0, 1], [0, 1]),
    y: interpolate(v, [0, 1], [36, 0]),
  };
}

// ── Slide 1: eyebrow + categoria ──────────────────────────────────────────
const SlideIntro: React.FC<{ category: string; date: string }> = ({ category, date }) => {
  const cat = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.DICAS;
  const e1 = useEnter(2);
  const e2 = useEnter(14);
  return (
    <AbsoluteFill>
      <Background />
      <Logo />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 6,
              color: GOLD,
              opacity: e1.opacity,
              transform: `translateY(${e1.y}px)`,
            }}
          >
            NOVO NO BLOG
          </span>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '12px 28px',
              borderRadius: 10,
              background: cat.bg,
              color: cat.fg,
              opacity: e2.opacity,
              transform: `translateY(${e2.y}px)`,
            }}
          >
            {category} · {date}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Slide 2: titulo — estatico e visivel ja no frame 0, com icone de video ──
const SlideTitle: React.FC<{ title: string; highlightWord: string }> = ({
  title,
  highlightWord,
}) => {
  return (
    <AbsoluteFill>
      <Background pulseSeed={20} />
      <Logo />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <VideoIcon />
          <h1
            style={{
              margin: 0,
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1.5,
              color: '#fff',
              textAlign: 'center',
              fontFamily: FONT,
            }}
          >
            <TitleWithHighlight title={title} highlightWord={highlightWord} />
          </h1>
        </div>
      </AbsoluteFill>
      <Footer />
    </AbsoluteFill>
  );
};

// ── Slide de hook/pergunta ──────────────────────────────────────────────────
const SlideHook: React.FC<{ hook: string }> = ({ hook }) => {
  const e = useEnter(2);
  return (
    <AbsoluteFill>
      <Background pulseSeed={40} />
      <Logo />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 110px' }}>
        <p
          style={{
            margin: 0,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#fff',
            textAlign: 'center',
            fontFamily: FONT,
            opacity: e.opacity,
            transform: `translateY(${e.y}px)`,
          }}
        >
          {hook}
        </p>
      </AbsoluteFill>
      <Footer />
    </AbsoluteFill>
  );
};

// ── Slide de destaque/dica numerada ─────────────────────────────────────────
const SlideHighlight: React.FC<{ text: string; index: number; total: number }> = ({
  text,
  index,
  total,
}) => {
  const e = useEnter(2);
  const eNum = useEnter(0, 260);
  return (
    <AbsoluteFill>
      <Background pulseSeed={60 + index * 15} />
      <Logo />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3,
              color: GOLD,
              opacity: eNum.opacity,
            }}
          >
            DICA {index + 1}/{total}
          </span>
          <p
            style={{
              margin: 0,
              fontSize: 50,
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#fff',
              textAlign: 'center',
              fontFamily: FONT,
              opacity: e.opacity,
              transform: `translateY(${e.y}px)`,
            }}
          >
            {text}
          </p>
        </div>
      </AbsoluteFill>
      <Footer />
    </AbsoluteFill>
  );
};

// ── Slide final: CTA ────────────────────────────────────────────────────────
const SlideCTA: React.FC<{ cta: string }> = ({ cta }) => {
  const frame = useCurrentFrame();
  const e = useEnter(2, 12);
  const pulse = 1 + Math.sin(frame / 8) * 0.03;
  const badge = useEnter(30);
  return (
    <AbsoluteFill>
      <Background pulseSeed={140} />
      <Logo />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              background: GREEN,
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
              fontFamily: FONT,
              padding: '26px 48px',
              borderRadius: 100,
              boxShadow: '0 14px 44px rgba(37,211,102,0.4)',
              opacity: e.opacity,
              transform: `scale(${interpolate(e.opacity, [0, 1], [0.85, 1]) * pulse})`,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.508A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.214-3.727.977.995-3.645-.235-.374A9.818 9.818 0 1112 21.818z" />
            </svg>
            {cta}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              opacity: badge.opacity,
              fontFamily: FONT,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>CHRISTIAN VIEIRA</span>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)' }}>
              CRECI 45539 · corretordeimovelrj.com.br
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BlogAnnouncement: React.FC<BlogAnnouncementProps> = ({
  title,
  highlightWord,
  category,
  date,
  hook,
  highlights,
  cta,
}) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Audio src={staticFile('audio/RealState.mp3')} volume={0.35} />
      <Series>
        <Series.Sequence durationInFrames={SLIDE_DURATION}>
          <SlideIntro category={category} date={date} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SLIDE_DURATION}>
          <SlideTitle title={title} highlightWord={highlightWord} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SLIDE_DURATION}>
          <SlideHook hook={hook} />
        </Series.Sequence>
        {highlights.map((text, i) => (
          <Series.Sequence durationInFrames={SLIDE_DURATION} key={i}>
            <SlideHighlight text={text} index={i} total={highlights.length} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={SLIDE_DURATION}>
          <SlideCTA cta={cta} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

export function totalDuration(highlightsCount: number) {
  return SLIDE_DURATION * (3 + highlightsCount + 1);
}
