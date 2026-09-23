// @ts-nocheck
'use client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { HeroDualSwitcher } from '@/components/shared/HeroDualSwitcher';
import { useLanguage } from '@/utils/languageContext';
import { useKyafExhibitions, useKyafActivities } from '@/lib/useWPData';
import { HOME_HERO_IMAGES } from '@/utils/imageConstants';
import { isHomeSectionVisible } from '@/utils/siteConfig';
import { useHomeAnchors } from '@/lib/useWPData';
import { ListingAccordionNav } from '@/components/shared/ListingAccordionNav';
import { useState } from 'react';

export function HomePage({ onNavigate }: { onNavigate?: (page: string, slug?: string) => void }) {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('current-exhibitions');

  const { data: allExhibitions } = useKyafExhibitions();
  const { data: allActivities }  = useKyafActivities();

  const currentExhibitions = allExhibitions.filter(ex => ex.status === 'current');
  const currentActivities  = allActivities.filter(act => act.status === 'current');

  const wpAnchors = useHomeAnchors('kyaf');
  const showCurrentExhibitions = wpAnchors ? wpAnchors.currentExhibitions : isHomeSectionVisible('currentExhibitions');
  const showCurrentActivities  = wpAnchors ? wpAnchors.currentActivities  : isHomeSectionVisible('currentActivities');

  const sections = [
    ...(showCurrentExhibitions ? [{ id: 'current-exhibitions', label: language === 'th' ? 'ผลงานศิลปะปัจจุบัน' : 'Current Artworks' }] : []),
    ...(showCurrentActivities  ? [{ id: 'current-activities',  label: language === 'th' ? 'กิจกรรมปัจจุบัน'    : 'Current Activities' }] : []),
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white min-h-screen pb-24 font-sans text-black">
      <HeroDualSwitcher
        initialSite="kyaf"
        kyafImage={HOME_HERO_IMAGES[0]}
        bkkkImage="https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_cover-for-about.jpg"
      />

      <div className="w-full px-[6vw] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">

          {/* Accordion Anchor Nav */}
          <aside className="w-full md:w-1/2 shrink-0">
            <ListingAccordionNav
              sections={sections.map(s => ({
                id: s.id,
                label: s.label,
                records: (
                  s.id === 'current-exhibitions'
                    ? currentExhibitions.map(i => ({ id: i.id, slug: i.slug, title: i.title[language] || i.title.en }))
                    : currentActivities.map(i => ({ id: i.id, slug: i.slug, title: i.title[language] || i.title.en }))
                ),
              }))}
              activeSection={activeSection}
              onSectionClick={(id) => {
                setActiveSection(id);
                setTimeout(() => scrollToSection(id), 50);
              }}
              onRecordClick={(slug) => {
                const el = document.getElementById(`record-${slug}`);
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
              }}
            />
          </aside>

          {/* Content Sections */}
          <div className="w-full md:w-1/2 flex flex-col">

            {/* Current Exhibitions */}
            {showCurrentExhibitions && currentExhibitions.length > 0 && (
              <section id="current-exhibitions" className="mb-32 md:mb-40 scroll-mt-32">
                <div className="flex flex-col gap-12 md:gap-16">
                  {currentExhibitions.map((exhibition) => (
                    <div id={`record-${exhibition.slug}`} key={exhibition.id} className="flex flex-col gap-6 w-full cursor-pointer group" onClick={() => onNavigate?.('exhibition-detail', exhibition.slug)}>
                      {exhibition.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                          <ImageWithFallback src={exhibition.featuredImage} alt={exhibition.title[language] || exhibition.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{exhibition.title[language] || exhibition.title.en}</h3>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{exhibition.artist[language] || exhibition.artist.en}</p>
                        {exhibition.listingSummary && (
                          <p className={`text-xl md:text-2xl font-normal text-gray-600 leading-tight mt-1 line-clamp-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {exhibition.listingSummary[language] || exhibition.listingSummary.en}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Current Activities */}
            {showCurrentActivities && currentActivities.length > 0 && (
              <section id="current-activities" className="mb-32 md:mb-40 scroll-mt-32">
                <div className="flex flex-col gap-12">
                  {currentActivities.map((activity) => (
                    <div id={`record-${activity.slug}`} key={activity.id} className="flex flex-col gap-6 w-full cursor-pointer group" onClick={() => onNavigate?.('activity-detail', activity.slug)}>
                      {activity.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                          <ImageWithFallback src={activity.featuredImage} alt={activity.title[language] || activity.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{activity.title[language] || activity.title.en}</h3>
                        {activity.listingSummary && (
                          <p className={`text-xl md:text-2xl font-normal text-gray-600 leading-tight mt-1 line-clamp-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {activity.listingSummary[language] || activity.listingSummary.en}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
