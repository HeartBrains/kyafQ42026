'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import type { HomeHeroSlide } from './homeHeroSlides';

type SiteId = 'kyaf' | 'bkkk';

interface HeroDualSwitcherProps {
  initialSite: SiteId;
  slides: Record<SiteId, HomeHeroSlide[]>;
  previousLabel: string;
  nextLabel: string;
  navigationLabel: string;
}

export function HeroDualSwitcher({
  initialSite,
  slides,
  previousLabel,
  nextLabel,
  navigationLabel,
}: HeroDualSwitcherProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const dragged = useRef(false);
  const activeSlides = slides[initialSite];
  const activeSlide = activeSlides[activeSlideIndex % activeSlides.length];

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

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a, button')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStartX.current = event.clientX;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStartX.current = null; }}
      onClickCapture={(event) => {
        if (dragged.current) {
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }
      }}
    >
      {activeSlides.map((slide, index) => (
        <div
      key={`${initialSite}-${slide.href}`}
          className="dual-hero__image"
          data-active={index === activeSlideIndex % activeSlides.length}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden="true"
        />
      ))}
      <div className="dual-hero__shade" aria-hidden="true" />
      <Link className="dual-hero__slide-link text-xl md:text-2xl font-normal" href={activeSlide.href}>
        {activeSlide.label}
      </Link>
      <div className="dual-hero__slide-count" aria-hidden="true">
        {activeSlideIndex + 1} / {activeSlides.length}
      </div>
      <div className="dual-hero__arrows" role="group" aria-label={navigationLabel}>
        <button
          className="dual-hero__arrow"
          type="button"
          aria-label={previousLabel}
          onClick={() => showSlide(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          className="dual-hero__arrow"
          type="button"
          aria-label={nextLabel}
          onClick={() => showSlide(1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
