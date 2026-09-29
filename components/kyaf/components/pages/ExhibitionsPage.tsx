// @ts-nocheck
'use client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useState, useEffect } from 'react';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import { useAppNavigate } from '@/components/kyaf/utils/useAppNavigate';
import { useKyafExhibitions, useSectionVisibility } from '@/lib/useWPData';
import { EXHIBITIONS_HERO_IMAGE } from '@/utils/imageConstants';
import { RichContent } from '@/utils/richContent';
import { ListingAccordionNav } from '@/components/shared/ListingAccordionNav';

interface ExhibitionsPageProps {
  onNavigate?: (page: string, slug?: string) => void;
  targetSectionId?: string;
}

export function ExhibitionsPage({ onNavigate: onNavigateProp, targetSectionId }: ExhibitionsPageProps) {
  const internalNavigate = useAppNavigate();
  const onNavigate = onNavigateProp ?? internalNavigate;
  const { data: exhibitions } = useKyafExhibitions();
  const [activeSection, setActiveSection] = useState('upcoming-exhibitions');
  const { language } = useLanguage();
  const covers = useCovers();
  const wpSections = useSectionVisibility('kyaf');
  const vis = {
    upcoming: wpSections?.exhibitions?.upcoming ?? true,
    current:  wpSections?.exhibitions?.current  ?? true,
    past:     wpSections?.exhibitions?.past     ?? true,
  };

  const upcoming = exhibitions.filter(ex => ex.status === 'upcoming');
  const current  = exhibitions.filter(ex => ex.status === 'current');
  const past     = exhibitions.filter(ex => ex.status === 'past');

  const sections = [
    ...(vis.upcoming ? [{ id: 'upcoming-exhibitions', label: language === 'th' ? 'ผลงานศิลปะที่กำลังจะมาถึง' : 'Upcoming Artworks', items: upcoming }] : []),
    ...(vis.current  ? [{ id: 'current-exhibitions',  label: language === 'th' ? 'ผลงานศิลปะปัจจุบัน'         : 'Current Artworks',  items: current  }] : []),
    ...(vis.past     ? [{ id: 'past-exhibitions',     label: language === 'th' ? 'ผลงานศิลปะที่ผ่านมา'        : 'Past Artworks',     items: past     }] : []),
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to target section on mount (from menu navigation)
  useEffect(() => {
    if (targetSectionId) {
      const idMap: Record<string, string> = {
        upcoming: 'upcoming-exhibitions',
        current:  'current-exhibitions',
        past:     'past-exhibitions',
      };
      setTimeout(() => scrollToSection(idMap[targetSectionId] ?? targetSectionId), 100);
    }
  }, [targetSectionId]);

  const ExhibitionCard = ({ item }: { item: any }) => (
    <div
      id={`record-${item.slug}`}
      className="flex flex-col gap-6 w-full cursor-pointer group"
      onClick={() => onNavigate?.('exhibition-detail', item.slug)}
    >
      <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
        <ImageWithFallback
          src={item.featuredImage}
          hoverSrc={item.gallery?.[0]}
          alt={language === 'th' ? item.title.th : item.title.en}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className={`text-xl md:text-2xl font-bold leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
          {language === 'th' ? item.title.th : item.title.en}
        </h3>
        {item.artist && (
          <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
            {language === 'th' ? item.artist.th : item.artist.en}
          </p>
        )}
        {item.listingSummary && (
          <div className={`text-xl md:text-2xl font-normal text-gray-600 leading-tight line-clamp-3 mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
            <RichContent content={language === 'th' ? item.listingSummary.th : item.listingSummary.en} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen pb-24 font-sans text-black">
      {/* Hero */}
      <ParallaxHero image={covers.exhibitions || EXHIBITIONS_HERO_IMAGE} height="h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </ParallaxHero>

      <div className="w-full px-[6vw] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">

          {/* Sticky nav */}
          <aside className="w-full md:w-1/2 shrink-0">
            <ListingAccordionNav
              sections={sections.map(s => ({
                id: s.id,
                label: s.label,
                records: s.items.map(item => ({
                  id: item.id,
                  slug: item.slug,
                  title: language === 'th' ? item.title.th : item.title.en,
                })),
              }))}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              onRecordClick={(slug) => {
                const el = document.getElementById(`record-${slug}`);
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
              }}
            />
          </aside>

          {/* Scrollable sections */}
          <div className="w-full md:w-1/2 flex flex-col">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16">
                  {s.items.length > 0 ? (
                    s.items.map((item, index) => (
                      <Reveal key={item.id} delay={index * 0.05}>
                        <ExhibitionCard item={item} />
                      </Reveal>
                    ))
                  ) : (
                    <div className="py-20 text-gray-400 text-xl md:text-2xl">
                      {language === 'th' ? 'เร็วๆ นี้' : 'Coming soon'}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
