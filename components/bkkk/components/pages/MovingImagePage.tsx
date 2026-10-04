'use client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '@/utils/languageContext';
import { useState, useEffect, useMemo } from 'react';
import type { MovingImageItem } from '@/lib/wp-mappers';
import { useAppNavigate } from '@/components/bkkk/utils/useAppNavigate';
import { useMovingImages, useSectionVisibility } from '@/lib/useWPData';
import { siteConfig } from '@/utils/siteConfig';
import { ListingAccordionNav } from '@/components/shared/ListingAccordionNav';
const movingImageHero = '/assets/429c8ad61cdb4d502462d129e377fe4faf35abf2.png';

interface MovingImagePageProps {
  onNavigate?: (page: string, slug?: string) => void;
  targetSectionId?: string;
}

export function MovingImagePage({ onNavigate: onNavigateProp, targetSectionId }: MovingImagePageProps) {
  const internalNavigate = useAppNavigate();
  const onNavigate = onNavigateProp ?? internalNavigate;
  const { language } = useLanguage();
  const { data: movingImageRecords } = useMovingImages();
  const [activeSection, setActiveSection] = useState('current-programs');

  const wpSections = useSectionVisibility('bkkk');
  const vis = {
    upcoming: wpSections?.movingImage?.upcoming ?? siteConfig.visibility.movingImage.upcoming,
    current:  wpSections?.movingImage?.current  ?? siteConfig.visibility.movingImage.current,
    past:     wpSections?.movingImage?.past     ?? siteConfig.visibility.movingImage.past,
  };
  const upcomingPrograms = vis.upcoming ? movingImageRecords.filter(r => r.status === 'upcoming') : [];
  const currentPrograms  = vis.current  ? movingImageRecords.filter(r => r.status === 'current')  : [];
  const pastPrograms     = vis.past     ? movingImageRecords.filter(r => r.status === 'past')     : [];

  // Anchor sections - memoized to prevent recreation on every render
  const sections = useMemo(() => {
    return [
      { id: 'upcoming-programs', label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวที่กำลังจะมาถึง' : 'Upcoming Moving Image Program' },
      { id: 'current-programs', label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวปัจจุบัน' : 'Current Moving Image Program' },
      { id: 'past-programs', label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวที่ผ่านมา' : 'Past Moving Image Program' }
    ].filter(section => {
      // Only show sections that have content
      if (section.id === 'upcoming-programs') return upcomingPrograms.length > 0;
      if (section.id === 'current-programs') return currentPrograms.length > 0;
      if (section.id === 'past-programs') return pastPrograms.length > 0;
      return true;
    });
  }, [language, upcomingPrograms.length, currentPrograms.length, pastPrograms.length]);

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Scroll to target section if provided
  useEffect(() => {
    if (targetSectionId) {
      scrollToSection(targetSectionId);
    }
  }, [targetSectionId]);

  return (
    <div className="w-full bg-white min-h-screen pb-24 font-sans text-black">
      {/* Hero Section with Slider */}
      {movingImageHero ? (
        <div className="relative w-full h-[50vh] min-h-[50vh] max-h-[50vh] overflow-hidden z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${movingImageHero})` }} />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
        </div>
      ) : (
        <div className="relative w-full h-[50vh] min-h-[50vh] max-h-[50vh] bg-gray-100" />
      )}

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
          {/* Left Column - Title & Anchor Menu */}
          <aside className="w-full md:w-1/2 shrink-0">
            <ListingAccordionNav
              sections={sections.map(s => ({
                id: s.id,
                label: s.label,
                records: (
                  s.id === 'upcoming-programs' ? upcomingPrograms :
                  s.id === 'current-programs'  ? currentPrograms  :
                  pastPrograms
                ).map(r => ({ id: r.id, slug: r.slug, title: r.title[language] || r.title.en })),
              }))}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              onRecordClick={(slug) => {
                const el = document.getElementById(`record-${slug}`);
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
              }}
            />
          </aside>

          {/* Right Column - Content */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Upcoming Programs */}
            {upcomingPrograms.length > 0 && <section id="upcoming-programs" className="mb-32 md:mb-40 scroll-mt-32">
              <div className="flex flex-col gap-12 md:gap-16">
                  {upcomingPrograms.map((record) => (
                    <div
                      id={`record-${record.slug}`}
                      key={record.id}
                      className="flex flex-col gap-6 w-full cursor-pointer group"
                      onClick={() => onNavigate?.('moving-image-detail', record.slug)}
                    >
                      {record.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-200 overflow-hidden relative transition-colors duration-300 group-hover:bg-gray-300">
                          <ImageWithFallback src={record.featuredImage} hoverSrc={record.gallery?.[0]} alt={record.title[language] || record.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" fetchPriority="low" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-bold leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.title[language] || record.title.en}</h3>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.artist?.[language] || record.artist?.en}</p>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.dateDisplay?.[language] || record.dateDisplay?.en}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>}

            {/* Current Programs */}
            {currentPrograms.length > 0 && <section id="current-programs" className="mb-32 md:mb-40 scroll-mt-32">
              <div className="flex flex-col gap-12 md:gap-16">
                  {currentPrograms.map((record) => (
                    <div
                      id={`record-${record.slug}`}
                      key={record.id}
                      className="flex flex-col gap-6 w-full cursor-pointer group"
                      onClick={() => onNavigate?.('moving-image-detail', record.slug)}
                    >
                      {record.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-200 overflow-hidden relative transition-colors duration-300 group-hover:bg-gray-300">
                          <ImageWithFallback src={record.featuredImage} hoverSrc={record.gallery?.[0]} alt={record.title[language] || record.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" fetchPriority="low" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-bold leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.title[language] || record.title.en}</h3>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.artist?.[language] || record.artist?.en}</p>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.dateDisplay?.[language] || record.dateDisplay?.en}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>}

            {/* Past Programs */}
            {pastPrograms.length > 0 && <section id="past-programs" className="mb-32 md:mb-40 scroll-mt-32">
              <div className="flex flex-col gap-12 md:gap-16">
                  {pastPrograms.map((record) => (
                    <div
                      id={`record-${record.slug}`}
                      key={record.id}
                      className="flex flex-col gap-6 w-full cursor-pointer group"
                      onClick={() => onNavigate?.('moving-image-detail', record.slug)}
                    >
                      {record.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-200 overflow-hidden relative transition-colors duration-300 group-hover:bg-gray-300">
                          <ImageWithFallback src={record.featuredImage} hoverSrc={record.gallery?.[0]} alt={record.title[language] || record.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" fetchPriority="low" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-bold leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.title[language] || record.title.en}</h3>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.artist?.[language] || record.artist?.en}</p>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{record.dateDisplay?.[language] || record.dateDisplay?.en}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>}
          </div>
        </div>
      </div>
    </div>
  );
}
