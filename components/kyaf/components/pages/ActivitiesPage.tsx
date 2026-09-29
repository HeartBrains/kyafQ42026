// @ts-nocheck
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import type { ActivityItem } from '@/lib/wp-mappers';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { siteConfig } from '@/utils/siteConfig';
import { useAppNavigate } from '@/components/kyaf/utils/useAppNavigate';
import { useKyafActivities, useSectionVisibility } from '@/lib/useWPData';
import { ListingAccordionNav } from '@/components/shared/ListingAccordionNav';
import { ActivityTagFilter, activityMatchesTag, rememberActivityListingUrl, type ActivityTagSlug } from '@/components/shared/ActivityTagFilter';
import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';

interface ActivitiesPageProps {
  onNavigate?: (page: string, slug?: string) => void;
  targetSectionId?: string;
}

export function ActivitiesPage({ onNavigate: onNavigateProp, targetSectionId }: ActivitiesPageProps) {
  const internalNavigate = useAppNavigate();
  const onNavigate = onNavigateProp ?? internalNavigate;
  const { language } = useLanguage();
  const covers = useCovers();
  const [activeSection, setActiveSection] = useState('current-activities');
  const [selectedTag, setSelectedTag] = useState<ActivityTagSlug>('all');
  const handledRouteSection = useRef<string | null>(null);
  const { data: rawActivities } = useKyafActivities();
  const wpSections = useSectionVisibility('kyaf');
  const vis = {
    upcoming: wpSections?.activities?.upcoming ?? siteConfig.visibility.activities.upcoming,
    current:  wpSections?.activities?.current  ?? siteConfig.visibility.activities.current,
    past:     wpSections?.activities?.past     ?? siteConfig.visibility.activities.past,
  };

  const filteredActivities = rawActivities.filter((activity) => activityMatchesTag(activity.categories?.en, selectedTag));
  const currentActivities  = filteredActivities.filter(a => a.status === 'current');
  const upcomingActivities = filteredActivities.filter(a => a.status === 'upcoming');
  const pastActivities     = filteredActivities.filter(a => a.status === 'past');
  const handleTagChange = useCallback((tag: ActivityTagSlug) => setSelectedTag(tag), []);

  const sections = [
    ...(vis.upcoming && upcomingActivities.length > 0 ? [{ id: 'upcoming-activities', label: language === 'th' ? 'กิจกรรมที่กำลังจะมาถึง' : 'Upcoming Activities' }] : []),
    ...(vis.current && currentActivities.length > 0 ? [{ id: 'current-activities', label: language === 'th' ? 'กิจกรรมปัจจุบัน' : 'Current Activities' }] : []),
    ...(vis.past && pastActivities.length > 0 ? [{ id: 'past-activities', label: language === 'th' ? 'กิจกรรมที่ผ่านมา' : 'Past Activities' }] : []),
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= pos) { setActiveSection(sections[i].id); break; }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  useEffect(() => {
    if (targetSectionId) setTimeout(() => scrollToSection(targetSectionId), 100);
  }, [targetSectionId]);

  useEffect(() => {
    const requestedSection = new URLSearchParams(window.location.search).get('section');
    if (!requestedSection || handledRouteSection.current === requestedSection) return;
    if (!sections.some((section) => section.id === requestedSection)) return;

    const timer = window.setTimeout(() => {
      handledRouteSection.current = requestedSection;
      setActiveSection(requestedSection);
      scrollToSection(requestedSection);
    }, 100);
    return () => window.clearTimeout(timer);
  });

  const ActivityCard = ({ item }) => (
    <div id={`record-${item.slug}`} className="flex flex-col gap-6 w-full cursor-pointer group" onClick={() => {
      rememberActivityListingUrl('kyaf', activeSection);
      onNavigate?.('activity-detail', item.slug);
    }}>
      {item.featuredImage && (
        <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
          <ImageWithFallback src={item.featuredImage} hoverSrc={item.gallery?.[0]} alt={item.title[language] || item.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" fetchPriority="low" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className={`text-xl md:text-2xl font-bold leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.title[language] || item.title.en}</h3>
        {(item.artist?.[language] || item.artist?.en) && (
          <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.artist[language] || item.artist.en}</p>
        )}
        {(item.dateDisplay?.[language] || item.dateDisplay?.en) && (
          <div className="flex flex-col mt-2">
            {(item.dateDisplay[language] || item.dateDisplay.en).split(',').map((d, i) => (
              <p key={i} className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{d.trim()}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen pb-24 font-sans text-black">
      <ParallaxHero image={covers.activities || `${PUBLIC_WP_ORIGIN}/wp-content/uploads/2026/03/Puma_Activity-People-Nawaphon-29.jpg`} height="h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">

          <aside className="w-full md:w-1/2 shrink-0 md:sticky md:top-32 md:self-start">
            <ListingAccordionNav
              sections={sections.map(s => ({
                id: s.id,
                label: s.label,
                records: (
                  s.id === 'upcoming-activities' ? upcomingActivities :
                  s.id === 'current-activities'  ? currentActivities  :
                  pastActivities
                ).map(a => ({ id: a.id, slug: a.slug, title: a.title[language] || a.title.en })),
              }))}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              onRecordClick={(slug) => {
                const el = document.getElementById(`record-${slug}`);
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
              }}
            />
            <div className="mt-8">
              <ActivityTagFilter language={language} site="kyaf" variant="sidebar" onChange={handleTagChange} />
            </div>
          </aside>

          <div className="w-full md:w-1/2 flex flex-col md:items-end">
            {vis.upcoming && upcomingActivities.length > 0 && (
              <section id="upcoming-activities" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">{upcomingActivities.map(item => <ActivityCard key={item.id} item={item} />)}</div>
              </section>
            )}
            {vis.current && currentActivities.length > 0 && (
              <section id="current-activities" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">{currentActivities.map(item => <ActivityCard key={item.id} item={item} />)}</div>
              </section>
            )}
            {vis.past && pastActivities.length > 0 && (
              <section id="past-activities" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">{pastActivities.map(item => <ActivityCard key={item.id} item={item} />)}</div>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
