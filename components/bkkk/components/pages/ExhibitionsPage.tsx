'use client';
import { useState, useEffect } from 'react';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import type { ExhibitionItem } from '@/lib/wp-mappers';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { siteConfig } from '@/utils/siteConfig';
import { useAppNavigate } from '@/components/bkkk/utils/useAppNavigate';
import { useBkkkExhibitions, useSectionVisibility } from '@/lib/useWPData';
import { ListingAccordionNav } from '@/components/shared/ListingAccordionNav';
import { RichContent, stripWrapperDivs } from '@/utils/richContent';

// Categorize exhibition status using ISO dates
function getExhibitionStatus(fromDate: string, toDate: string, explicitStatus: 'current' | 'upcoming' | 'past', referenceDate: Date): 'current' | 'upcoming' | 'past' | null {
  // Priority 1: Use explicit status if provided
  if (explicitStatus) {
    return explicitStatus;
  }

  // Priority 2: Calculate from dates
  const start = new Date(fromDate);
  // Handle "Onwards" as ongoing exhibitions (no end date)
  const end = toDate === 'Onwards' 
    ? new Date(9999, 11, 31) 
    : new Date(toDate);

  // Upcoming: exhibition hasn't started yet
  if (referenceDate < start) {
    return 'upcoming';
  }

  // Current: today is between start and end
  if (referenceDate >= start && referenceDate <= end) {
    return 'current';
  }

  // Past: exhibition has ended
  if (referenceDate > end) {
    return 'past';
  }

  return null;
}

interface ExhibitionsPageProps {
  onNavigate?: (page: string, slug?: string) => void;
  targetSectionId?: string;
}

export function ExhibitionsPage({ onNavigate: onNavigateProp, targetSectionId }: ExhibitionsPageProps) {
  const internalNavigate = useAppNavigate();
  const onNavigate = onNavigateProp ?? internalNavigate;
  const { language } = useLanguage();
  const covers = useCovers();
  const [activeSection, setActiveSection] = useState('upcoming-exhibitions');
  const { data: exhibitions } = useBkkkExhibitions();
  const wpSections = useSectionVisibility('bkkk');
  const vis = {
    upcoming: wpSections?.exhibitions?.upcoming ?? siteConfig.visibility.exhibitions.upcoming,
    current:  wpSections?.exhibitions?.current  ?? siteConfig.visibility.exhibitions.current,
    past:     wpSections?.exhibitions?.past     ?? siteConfig.visibility.exhibitions.past,
  };

  const today = new Date();

  // Categorize exhibitions by status
  const currentExhibitions = exhibitions
    .filter(ex => getExhibitionStatus(ex.fromDate, ex.toDate, (ex.status ?? "past") as "current" | "past" | "upcoming", today) === 'current')
    .sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  const upcomingExhibitions = exhibitions
    .filter(ex => getExhibitionStatus(ex.fromDate, ex.toDate, (ex.status ?? "past") as "current" | "past" | "upcoming", today) === 'upcoming')
    .sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  const pastExhibitions = exhibitions
    .filter(ex => getExhibitionStatus(ex.fromDate, ex.toDate, (ex.status ?? "past") as "current" | "past" | "upcoming", today) === 'past')
    .sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  // Navigation sections
  const sections = [
    ...(vis.upcoming ? [{ 
      id: 'upcoming-exhibitions', 
      label: language === 'th' ? 'นิทรรศการที่กำลังจะเริ่ม' : 'Upcoming Exhibitions',
      count: upcomingExhibitions.length
    }] : []),
    ...(vis.current ? [{ 
      id: 'current-exhibitions', 
      label: language === 'th' ? 'นิทรรศการปัจจุบัน' : 'Current Exhibitions',
      count: currentExhibitions.length
    }] : []),
    ...(vis.past ? [{ 
      id: 'past-exhibitions', 
      label: language === 'th' ? 'นิทรรศการที่ผ่านมา' : 'Past Exhibitions',
      count: pastExhibitions.length
    }] : [])
  ].filter(section => section.count > 0);

  // Scroll to section handler
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
  }, []);

  // Scroll to target section on mount
  useEffect(() => {
    if (targetSectionId) {
      setTimeout(() => scrollToSection(targetSectionId), 100);
    }
  }, [targetSectionId]);

  // Exhibition card component
  const ExhibitionCard = ({ item, index, prefix }: { item: any; index: number; prefix: string }) => {
    const imageUrl = item.featuredImage || '';
    const [imgError, setImgError] = useState(false);
    
    return (
      <div 
        id={`record-${item.slug}`}
        key={`${prefix}-${index}-${item.slug}`}
        className="flex flex-col gap-6 w-full cursor-pointer group" 
        onClick={() => onNavigate?.('exhibition-detail', item.slug)}
      >
        {imageUrl && !imgError && (
          <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
            <ImageWithFallback 
              src={imageUrl} 
              hoverSrc={item.gallery?.[0]}
              alt={item.title[language]}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h3 className={`text-xl md:text-2xl font-bold leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
            {item.title[language]}
          </h3>
          {(item.additionalInfo?.[language] || item.additionalInfo?.en) ? (
            <div className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
              <RichContent content={stripWrapperDivs(item.additionalInfo[language] || item.additionalInfo.en)} />
            </div>
          ) : (
            <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
              {item.artist[language] || item.curator?.[language]}
            </p>
          )}
          <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
            {item.dateDisplay[language]}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white min-h-screen pb-24 font-sans text-black">
      {/* Hero Section */}
      <ParallaxHero 
        image="https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-Exhibitions-list-83b680a4.jpg"
        height="h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
          {/* Sticky Navigation Menu */}
          <aside className="w-full md:w-1/2 shrink-0">
            <ListingAccordionNav
              sections={sections.map(s => ({
                id: s.id,
                label: s.label,
                records: (
                  s.id === 'upcoming-exhibitions' ? upcomingExhibitions :
                  s.id === 'current-exhibitions'  ? currentExhibitions  :
                  pastExhibitions
                ).map(ex => ({ id: ex.id, slug: ex.slug, title: ex.title[language] })),
              }))}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              onRecordClick={(slug) => {
                const el = document.getElementById(`record-${slug}`);
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
              }}
            />
          </aside>

          {/* Content Sections */}
          <div className="w-full md:w-1/2 flex flex-col md:items-end">
            {/* Upcoming Exhibitions Section */}
            {vis.upcoming && upcomingExhibitions.length > 0 && (
              <section id="upcoming-exhibitions" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">{upcomingExhibitions.map((item, index) => (
                  <ExhibitionCard key={`upcoming-${item.id}`} item={item} index={index} prefix="upcoming" />
                ))}</div>
              </section>
            )}

            {/* Current Exhibitions Section */}
            {vis.current && currentExhibitions.length > 0 && (
              <section id="current-exhibitions" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">{currentExhibitions.map((item, index) => (
                  <ExhibitionCard key={item.id} item={item} index={index} prefix="current" />
                ))}</div>
              </section>
            )}

            {/* Past Exhibitions Section */}
            {vis.past && pastExhibitions.length > 0 && (
              <section id="past-exhibitions" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">{pastExhibitions.map((item, index) => (
                  <ExhibitionCard key={`past-${item.id}`} item={item} index={index} prefix="past" />
                ))}</div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
