'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { HomeHeroSlide } from './homeHeroSlides';

type SiteId = 'kyaf' | 'bkkk';

interface HeroState {
  id: SiteId;
  name: string;
  href: '/kyaf/' | '/bk/';
}

interface HeroDualSwitcherProps {
  initialSite: SiteId;
  slides: Record<SiteId, HomeHeroSlide[]>;
  previousLabel: string;
  nextLabel: string;
  locationLabel: string;
  navigationLabel: string;
}

export function HeroDualSwitcher({
  initialSite,
  slides,
  previousLabel,
  nextLabel,
  locationLabel,
  navigationLabel,
}: HeroDualSwitcherProps) {
  const [activeSite, setActiveSite] = useState<SiteId>(initialSite);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const dragged = useRef(false);
  const states: HeroState[] = [
    { id: 'kyaf', name: 'Khao Yai\nArt Forest', href: '/kyaf/' },
    { id: 'bkkk', name: 'Bangkok\nKunsthalle', href: '/bk/' },
  ];
  const active = states.find((state) => state.id === activeSite) ?? states[0];
  const activeSlides = slides[activeSite];
  const currentSlide = activeSlides[activeSlideIndex % activeSlides.length];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isHovered || reducedMotion || activeSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % activeSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, isHovered, reducedMotion]);

  const showSlide = (direction: -1 | 1) => {
    setActiveSlideIndex((index) => (index + direction + activeSlides.length) % activeSlides.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStartX.current = event.clientX;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    if (pointerStartX.current === null) return;
    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(distance) < 55) return;
    dragged.current = true;
    showSlide(distance < 0 ? 1 : -1);
  };

  return (
    <section
      className="dual-hero"
      aria-label="Khao Yai Art Forest and Bangkok Kunsthalle"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setIsHovered(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setIsHovered(false)}
    >
      {activeSlides.map((slide, index) => (
        <div
          key={`${activeSite}-${slide.href}`}
          className="dual-hero__image"
          data-active={index === activeSlideIndex % activeSlides.length}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden="true"
        />
      ))}
      <div className="dual-hero__shade" aria-hidden="true" />
      <Link
        className="dual-hero__image-link"
        href={currentSlide.href}
        aria-label={currentSlide.label}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { pointerStartX.current = null; }}
        onClickCapture={(event) => {
          if (dragged.current) {
            event.preventDefault();
            dragged.current = false;
          }
        }}
      />
      <div className="dual-hero__controls" role="tablist" aria-label={locationLabel}>
        {states.map((state) => (
          <button
            key={state.id}
            type="button"
            role="tab"
            aria-selected={state.id === activeSite}
            className="dual-hero__tab"
            onClick={() => {
              setActiveSite(state.id);
              setActiveSlideIndex(0);
            }}
          >
            {state.name.split('\n').map((line) => <span key={line}>{line}</span>)}
          </button>
        ))}
      </div>
      <div className="dual-hero__slide-label" aria-hidden="true">{currentSlide.label}</div>
      <div className="dual-hero__slide-controls" role="group" aria-label={navigationLabel}>
        <button type="button" aria-label={previousLabel} onClick={() => showSlide(-1)}>
          <span aria-hidden="true">←</span>
        </button>
        <span aria-hidden="true">{activeSlideIndex + 1} / {activeSlides.length}</span>
        <button type="button" aria-label={nextLabel} onClick={() => showSlide(1)}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <Link className="dual-hero__link" href={active.href} aria-label={`Explore ${active.name.replace('\n', ' ')}`}>
        <span>{active.name.split('\n').map((line) => <span key={line}>{line}</span>)}</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
