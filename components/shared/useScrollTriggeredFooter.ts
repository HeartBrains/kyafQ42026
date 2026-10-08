'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const listingRoutes = new Set([
  'activities',
  'archives',
  'artists',
  'blog',
  'exhibitions',
  'moving-image',
  'news',
  'press',
  'residency',
  'shop',
  'team',
]);

export function useScrollTriggeredFooter() {
  const pathname = usePathname();
  const anchorRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sitePrefix = pathname.startsWith('/bk/') || pathname === '/bk'
      ? '/bk'
      : pathname.startsWith('/kyaf/') || pathname === '/kyaf'
        ? '/kyaf'
        : null;
    const route = sitePrefix ? pathname.slice(sitePrefix.length).split('/').filter(Boolean) : [];
    const isEligibleRoute = sitePrefix !== null && (
      route.length === 0 || (route.length === 1 && listingRoutes.has(route[0]))
    );

    if (!isEligibleRoute) {
      setIsSticky(false);
      setIsExiting(false);
      setFooterHeight(0);
      return;
    }

    const updateFooterState = () => {
      const anchor = anchorRef.current;
      const footer = footerRef.current;
      if (!anchor || !footer) return;

      if (!window.matchMedia('(min-width: 768px)').matches) {
        setFooterHeight(0);
        setIsSticky(false);
        setIsExiting(false);
        return;
      }

      const hero = document.querySelector<HTMLElement>('.dual-hero');
      const hasPassedHero = hero
        ? hero.getBoundingClientRect().bottom <= 0
        : window.scrollY > 50;
      const footerIsBelowViewport = anchor.getBoundingClientRect().top > window.innerHeight;
      const isAtPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const nextHeight = footer.offsetHeight;

      setFooterHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight);
      setIsSticky((currentState) => {
        const nextState = hasPassedHero && footerIsBelowViewport;
        if (currentState && !nextState && !isAtPageEnd) {
          if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
          setIsExiting(true);
          exitTimerRef.current = setTimeout(() => setIsExiting(false), 1000);
        } else if (nextState || isAtPageEnd) {
          if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
          setIsExiting(false);
        }
        return currentState === nextState ? currentState : nextState;
      });
    };

    updateFooterState();
    window.addEventListener('scroll', updateFooterState, { passive: true });
    window.addEventListener('resize', updateFooterState);
    const resizeObserver = new ResizeObserver(updateFooterState);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    return () => {
      window.removeEventListener('scroll', updateFooterState);
      window.removeEventListener('resize', updateFooterState);
      resizeObserver.disconnect();
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [pathname]);

  return { anchorRef, footerRef, footerHeight, isSticky, isExiting };
}
