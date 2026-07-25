import React from 'react';
import { Composition } from 'remotion';
import { BlogAnnouncement, BlogAnnouncementProps, totalDuration } from './BlogAnnouncement';
import { FeedChristian, FeedChristianProps, FEED_DURATION } from './FeedChristian';

const defaultProps: BlogAnnouncementProps = {
  title: 'Quanto custa financiar um imóvel?',
  highlightWord: 'custa',
  category: 'FINANCIAMENTO',
  date: '25 jul 2026',
  hook: 'Sabia que o financiamento custa muito mais que só a parcela mensal?',
  highlights: [
    'ITBI, seguros e taxas administrativas entram na conta real.',
    'O CET (Custo Efetivo Total) mostra o valor completo do financiamento.',
    'Comparar bancos e prazos pode economizar milhares de reais.',
  ],
  cta: 'Fale com o Christian Vieira',
};

// Feed #1 da serie — card 1 da secao "Quem procura Christian Vieira" (index.html)
const feedDefaultProps: FeedChristianProps = {
  headline: 'Dúvida na escolha do imóvel',
  subheadline: 'Qual bairro, tipo de imóvel e valor ideal para sua realidade.',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BlogAnnouncement"
        component={BlogAnnouncement}
        durationInFrames={totalDuration(defaultProps.highlights.length)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="FeedChristian"
        component={FeedChristian}
        durationInFrames={FEED_DURATION}
        fps={30}
        width={1080}
        height={1440}
        defaultProps={feedDefaultProps}
      />
    </>
  );
};
