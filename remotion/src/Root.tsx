import React from 'react';
import { Composition } from 'remotion';
import { BlogAnnouncement, BlogAnnouncementProps, totalDuration } from './BlogAnnouncement';

const defaultProps: BlogAnnouncementProps = {
  title: 'Financiamento imobiliário explicado de forma simples',
  highlightWord: 'Financiamento',
  category: 'FINANCIAMENTO',
  date: '22 jul 2026',
  hook: 'Sabia que dá pra economizar até R$ 40 mil escolhendo a tabela certa?',
  highlights: [
    'Tabela SAC ou PRICE: a escolha muda o valor total pago no fim.',
    'A entrada ideal reduz juros e libera aprovação mais rápida.',
    'FGTS pode ser usado — poucos sabem como aplicar direito.',
  ],
  cta: 'Fale com o Christian Vieira',
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BlogAnnouncement"
      component={BlogAnnouncement}
      durationInFrames={totalDuration(defaultProps.highlights.length)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
