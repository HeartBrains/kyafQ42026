'use client';
import { useLanguage } from '@/utils/languageContext';
import { useBkkkExhibitions, useBkkkActivities, useMovingImages } from '@/lib/useWPData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { HeroDualSwitcher } from '@/components/shared/HeroDualSwitcher';
import { useState, useEffect, useMemo } from 'react';
import { getEmptyStateMessage, siteConfig } from '@/utils/siteConfig';
import { useHomeAnchors } from '@/lib/useWPData';
import { ListingAccordionNav } from '@/components/shared/ListingAccordionNav';
import { RichContent, stripWrapperDivs } from '@/utils/richContent';

// Hero images from different pages
const heroImages = [
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_cover-for-about.jpg", // Visit
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-Exhibitions-list-83b680a4.jpg", // Exhibitions
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Images+for+Website-Bangkok+Kunsthalle+Images+for+Website-4.+Moving+Image+Program-4.1+Infringes--Infringes+-Andrea+Rossetti+1+COVER.jpg", // Moving Image Program
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/1000012646.jpg", // Residency
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-history-34e22018.jpg", // About
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-team-f51a7633.jpg", // Team
  "https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-contact-1-89b6eddb.jpg" // Contact
];

export function HomePage({ onNavigate }: { onNavigate?: (page: string, slug?: string) => void }) {
  const { language, t } = useLanguage();
  const [activeSection, setActiveSection] = useState('current-exhibitions');

  const { data: allExhibitions } = useBkkkExhibitions();
  const { data: allActivities }  = useBkkkActivities();
  const { data: allMovingImages } = useMovingImages();

  const currentExhibitions  = allExhibitions.filter(e => e.status === 'current');
  const upcomingExhibitions = allExhibitions.filter(e => e.status === 'upcoming');

  const currentMovingImageProgram = allMovingImages.find(m => m.status === 'current') ?? null;
  const wpAnchors = useHomeAnchors('bkkk');
  // Fall back to siteConfig while WP loads
  const anchors = {
    currentExhibitions:  wpAnchors ? wpAnchors.currentExhibitions  : siteConfig.homeAnchors.currentExhibitions,
    upcomingExhibitions: wpAnchors ? (wpAnchors.upcomingExhibitions ?? true) : siteConfig.homeAnchors.upcomingExhibitions,
    currentMovingImage:  wpAnchors ? (wpAnchors.currentMovingImage  ?? true) : siteConfig.homeAnchors.currentMovingImageProgram,

  };

  const sections = useMemo(() => [
    { id: 'current-exhibitions',   label: language === 'th' ? 'นิทรรศการปัจจุบัน' : 'Current Exhibitions',                   visible: anchors.currentExhibitions  && currentExhibitions.length > 0 },
    { id: 'upcoming-exhibitions',  label: language === 'th' ? 'นิทรรศการที่กำลังจะเริ่ม' : 'Upcoming Exhibitions',            visible: anchors.upcomingExhibitions && upcomingExhibitions.length > 0 },
    { id: 'moving-image-program',  label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวปัจจุบัน' : 'Current Moving Image Program', visible: anchors.currentMovingImage  && currentMovingImageProgram !== null },
  ].filter(s => s.visible), [language, anchors, currentExhibitions, upcomingExhibitions, currentMovingImageProgram]);

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Adjust for header
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

  return (
    <div className="w-full bg-white min-h-screen pb-24 font-sans text-black">
      <HeroDualSwitcher
        initialSite="bkkk"
        kyafImage="https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-6.+About+Us--Madrid+Circle-+Krittawat+and+Puttisin+1-1920w.jpg"
        bkkkImage={heroImages[0]}
      />

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
          {/* Sticky Anchor Menu */}
          <aside className="w-full md:w-1/2 shrink-0">
            <ListingAccordionNav
              sections={sections.map(s => ({
                id: s.id,
                label: s.label,
                records: (
                  s.id === 'current-exhibitions'  ? currentExhibitions.map(i => ({ id: i.id, slug: i.slug, title: i.title[language] || i.title.en })) :
                  s.id === 'upcoming-exhibitions' ? upcomingExhibitions.map(i => ({ id: i.id, slug: i.slug, title: i.title[language] || i.title.en })) :
                  s.id === 'moving-image-program' ? (currentMovingImageProgram ? [{ id: currentMovingImageProgram.id, slug: currentMovingImageProgram.slug, title: currentMovingImageProgram.title[language] || currentMovingImageProgram.title.en }] : []) :
                  []
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
          <div className="w-full md:w-1/2 flex flex-col md:items-end">
            {/* Current Exhibitions */}
            {anchors.currentExhibitions && (
              <section id="current-exhibitions" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:gap-16 md:items-end">
                  {currentExhibitions.length > 0 ? currentExhibitions.map((item) => (
                    <div id={`record-${item.slug}`} key={item.id} className="flex flex-col gap-6 w-full cursor-pointer group" onClick={() => onNavigate?.('exhibition-detail', item.slug)}>
                      {item.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                          <ImageWithFallback src={item.featuredImage} alt={item.title[language] || item.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.title[language] || item.title.en}</h3>
                        {(item.additionalInfo?.[language] || item.additionalInfo?.en) ? (
                          <div className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            <RichContent content={stripWrapperDivs(item.additionalInfo[language] || item.additionalInfo.en)} />
                          </div>
                        ) : (
                          <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.artist[language] || item.artist.en || item.curator?.[language] || item.curator?.en}</p>
                        )}
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.dateDisplay[language] || item.dateDisplay.en}</p>
                      </div>
                    </div>
                  )) : (
                    <p className={`text-xl md:text-2xl font-normal text-gray-400 text-left w-full ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{getEmptyStateMessage('noCurrentExhibitions', language)}</p>
                  )}
                </div>
              </section>
            )}

            {/* Upcoming Exhibitions */}
            {anchors.upcomingExhibitions && (
              <section id="upcoming-exhibitions" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:items-end">
                  {upcomingExhibitions.length > 0 ? upcomingExhibitions.map((item) => (
                    <div id={`record-${item.slug}`} key={item.id} className="flex flex-col gap-6 w-full cursor-pointer group" onClick={() => onNavigate?.('exhibition-detail', item.slug)}>
                      {item.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                          <ImageWithFallback src={item.featuredImage} alt={item.title[language] || item.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.title[language] || item.title.en}</h3>
                        {(item.additionalInfo?.[language] || item.additionalInfo?.en) ? (
                          <div className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            <RichContent content={stripWrapperDivs(item.additionalInfo[language] || item.additionalInfo.en)} />
                          </div>
                        ) : (
                          <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.artist[language] || item.artist.en || item.curator?.[language] || item.curator?.en}</p>
                        )}
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.dateDisplay[language] || item.dateDisplay.en}</p>
                      </div>
                    </div>
                  )) : (
                    <p className={`text-xl md:text-2xl font-normal text-gray-400 text-left w-full ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{getEmptyStateMessage('noUpcomingExhibitions', language)}</p>
                  )}
                </div>
              </section>
            )}

            {/* Moving Image Program */}
            {anchors.currentMovingImage && (
              <section id="moving-image-program" className="mb-32 md:mb-40 scroll-mt-32 w-full">
                <div className="flex flex-col gap-12 md:items-end">
                  {currentMovingImageProgram ? (
                    <div id={`record-${currentMovingImageProgram.slug}`} className="flex flex-col gap-6 w-full cursor-pointer group" onClick={() => onNavigate?.('moving-image-detail', currentMovingImageProgram.slug)}>
                      {currentMovingImageProgram.featuredImage && (
                        <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                          <ImageWithFallback src={currentMovingImageProgram.featuredImage} alt={currentMovingImageProgram.title[language] || currentMovingImageProgram.title.en} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className={`text-xl md:text-2xl font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{currentMovingImageProgram.title[language] || currentMovingImageProgram.title.en}</h3>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{currentMovingImageProgram.artist?.[language] || currentMovingImageProgram.artist?.en}</p>
                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{currentMovingImageProgram.dateDisplay?.[language] || currentMovingImageProgram.dateDisplay?.en}</p>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-xl md:text-2xl font-normal text-gray-400 text-left w-full ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{getEmptyStateMessage('noCurrentMovingImage', language)}</p>
                  )}
                </div>
              </section>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
