'use client';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
const aboutHero = '/assets/2e3a0e5af1e1e13f82c48787eed213758894268f.png';

export type AboutPageType = 'about' | 'vision' | 'history' | 'founder' | 'team';

interface AboutLayoutProps {
  children: ReactNode;
  activePage: AboutPageType;
  onNavigate: (page: string) => void;
}

const MENU_ITEMS: { label: string; page: AboutPageType }[] = [
  { label: 'About Us', page: 'about' },
  { label: 'Vision / Mision', page: 'vision' },
  { label: 'History', page: 'history' },
  { label: 'Founder', page: 'founder' },
  { label: 'Team', page: 'team' },
];

export function AboutLayout({ children, activePage, onNavigate }: AboutLayoutProps) {
  const [currentSection, setCurrentSection] = useState<AboutPageType>(activePage);
  const isScrolling = useRef(false);

  // Sync prop change to local state and scroll to section
  useEffect(() => {
    // If activePage changes (or on mount), we lock the spy and scroll manually
    setCurrentSection(activePage);
    isScrolling.current = true;

    const el = document.getElementById(activePage);
    if (el) {
        // Unlock after enough time for smooth scroll to complete
        // 100ms delay to start, ~800ms for scroll
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        setTimeout(() => { isScrolling.current = false; }, 1000);
    } else {
        isScrolling.current = false;
    }
  }, [activePage]);

  // Scroll Spy
  useEffect(() => {
    // Keep track of all currently intersecting sections
    const visibleSections = new Set<string>();

    const observer = new IntersectionObserver((entries) => {
        // Only update if not manually scrolling
        if (isScrolling.current) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.add(entry.target.id);
            } else {
                visibleSections.delete(entry.target.id);
            }
        });

        // Find the first menu item that is currently visible
        // This ensures that if multiple are visible, we pick the top-most one based on menu order
        const activeItem = MENU_ITEMS.find(item => visibleSections.has(item.page));
        if (activeItem) {
            setCurrentSection(activeItem.page);
        }
    }, { 
       threshold: 0,
       rootMargin: "-20% 0px -50% 0px" 
    });
    
    MENU_ITEMS.forEach(item => {
        const el = document.getElementById(item.page);
        if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []); // Run once on mount

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <ParallaxHero 
        image={aboutHero}
        height="h-[60vh] min-h-[60vh] max-h-[60vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      <div className="w-full px-[5%] py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-1/4 shrink-0 h-fit hidden md:block">
            <nav className="flex flex-col space-y-2">
              {MENU_ITEMS.map((item, index) => {
                const isActive = currentSection === item.page;
                return (
                  <Reveal key={item.page} delay={index * 0.1} duration={0.5}>
                      <button
                        onClick={() => onNavigate(item.page)}
                        className={`text-left text-2xl md:text-3xl font-sans transition-all duration-500 ease-out ${
                          isActive
                            ? 'text-black font-medium pl-2 border-l-2 border-black'
                            : 'text-gray-300 hover:text-gray-500 hover:pl-1'
                        }`}
                      >
                        {item.label}
                      </button>
                  </Reveal>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 md:w-3/4">
             {/* We don't need Reveal wrapper here as each section inside children handles it */}
             {children}
          </main>
        </div>
      </div>
    </div>
  );
}
