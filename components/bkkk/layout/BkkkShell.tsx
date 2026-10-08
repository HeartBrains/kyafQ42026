'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/bkkk/components/layout/Header';
import { Footer } from '@/components/bkkk/components/layout/Footer';
import { MenuOverlay } from '@/components/bkkk/components/layout/MenuOverlay';
import { BackToTop } from '@/components/bkkk/components/ui/BackToTop';
import { useAppNavigate } from '@/components/bkkk/utils/useAppNavigate';
import { useSiteConfig } from '@/lib/useWPData';
import { CoversContext } from '@/lib/coversContext';
import type { CoverConfigMap } from '@/lib/wp-api';
import { useScrollTriggeredFooter } from '@/components/shared/useScrollTriggeredFooter';

interface BkkkShellProps {
  children: React.ReactNode;
  initialCovers: CoverConfigMap;
  initialCss: string;
}

export function BkkkShell({ children, initialCovers, initialCss }: BkkkShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useAppNavigate();
  const router = useRouter();
  const pathname = usePathname();
  const { anchorRef, footerRef, footerHeight, isSticky, isExiting } = useScrollTriggeredFooter();

  // Runtime fetch — overrides build-time values once WP responds
  const siteConfig = useSiteConfig('bkkk');
  const covers = siteConfig?.covers ?? initialCovers;
  const css = siteConfig?.css ?? initialCss;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <CoversContext.Provider value={covers}>
        <Header
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
          onLogoClick={scrolled ? undefined : () => router.push('/')}
          isTransparent={!scrolled}
          isScrolled={scrolled}
        />
        <MenuOverlay
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={navigate}
          activePage={pathname}
        />
        <main className="pb-20 md:pb-0">{children}</main>
        <div ref={anchorRef} aria-hidden="true" />
        <div aria-hidden="true" style={{ height: isSticky || isExiting ? footerHeight : 0 }} />
        <div ref={footerRef} data-sticky={isSticky ? 'true' : isExiting ? 'exiting' : 'false'} className={`site-sticky-footer ${isSticky || isExiting ? 'fixed inset-x-0 bottom-0 z-40' : ''}`}>
          <Footer onNavigate={navigate} isSticky={isSticky} />
        </div>
        <BackToTop />
      </CoversContext.Provider>
    </div>
  );
}
