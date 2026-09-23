'use client';

import Link from 'next/link';
import { useState } from 'react';

type SiteId = 'kyaf' | 'bkkk';

interface HeroState {
  id: SiteId;
  name: string;
  image: string;
  href: '/kyaf/' | '/bk/';
}

interface HeroDualSwitcherProps {
  initialSite: SiteId;
  kyafImage: string;
  bkkkImage: string;
}

export function HeroDualSwitcher({ initialSite, kyafImage, bkkkImage }: HeroDualSwitcherProps) {
  const [activeSite, setActiveSite] = useState<SiteId>(initialSite);
  const states: HeroState[] = [
    { id: 'kyaf', name: 'Khao Yai\nArt Forest', image: kyafImage, href: '/kyaf/' },
    { id: 'bkkk', name: 'Bangkok\nKunsthalle', image: bkkkImage, href: '/bk/' },
  ];
  const active = states.find((state) => state.id === activeSite) ?? states[0];

  return (
    <section className="dual-hero" aria-label="Khao Yai Art Forest and Bangkok Kunsthalle">
      {states.map((state) => (
        <div
          key={state.id}
          className="dual-hero__image"
          data-active={state.id === activeSite}
          style={{ backgroundImage: `url(${state.image})` }}
          aria-hidden="true"
        />
      ))}
      <div className="dual-hero__shade" aria-hidden="true" />
      <div className="dual-hero__controls" role="tablist" aria-label="Select location">
        {states.map((state) => (
          <button
            key={state.id}
            type="button"
            role="tab"
            aria-selected={state.id === activeSite}
            className="dual-hero__tab"
            onClick={() => setActiveSite(state.id)}
          >
            {state.name.split('\n').map((line) => <span key={line}>{line}</span>)}
          </button>
        ))}
      </div>
      <Link className="dual-hero__link" href={active.href} aria-label={`Explore ${active.name.replace('\n', ' ')}`}>
        <span>{active.name.split('\n').map((line) => <span key={line}>{line}</span>)}</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
