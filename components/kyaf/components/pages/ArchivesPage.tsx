// @ts-nocheck
'use client';
import { useState, useMemo } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useLanguage } from '@/utils/languageContext';
import { useKyafExhibitions, useKyafActivities } from '@/lib/useWPData';
import { IMG_MADRID_SRC } from '@/utils/imageConstants';

// Helper to extract the relevant year from a date string
const getYearFromDate = (dateStr: string): string => {
    const matches = dateStr.match(/\b20\d{2}\b/g);
    if (matches && matches.length > 0) {
        return matches[matches.length - 1];
    }
    // Fallback if no year found? Or assume current year/specific default?
    return '2025'; 
};

interface ArchivesPageProps {
  onNavigate: (page: string, slug?: string, backTo?: string) => void;
}

export function ArchivesPage({ onNavigate }: ArchivesPageProps) {
  const { language, t } = useLanguage();
  const { data: wpExhibitions, loading: loadingEx } = useKyafExhibitions();
  const { data: wpActivities, loading: loadingAct } = useKyafActivities();
  const loading = loadingEx || loadingAct;

  // Filter state
  const [activeFilter, setActiveFilter] = useState<{
      category: 'exhibition' | 'activity' | null;
      year: string | null | 'all';
  }>({ category: null, year: null });

  // Normalise WP data into the flat shape the template uses
  const exhibitionsData = useMemo(() => (wpExhibitions ?? [])
    .filter(ex => ex.status === 'past')
    .map(ex => ({
      slug: ex.slug,
      type: 'exhibition',
      title: language === 'th' ? ex.title.th : ex.title.en,
      date: language === 'th' ? ex.dateDisplay.th : ex.dateDisplay.en,
      featuredImage: ex.featuredImage,
      gallery: ex.gallery,
      acf: { artist: language === 'th' ? ex.artist?.th : ex.artist?.en, status: ex.status },
    })), [wpExhibitions, language]);

  const activitiesData = useMemo(() => (wpActivities ?? [])
    .filter(act => act.status === 'past')
    .map(act => ({
      slug: act.slug,
      type: 'activity',
      title: language === 'th' ? act.title.th : act.title.en,
      date: language === 'th' ? act.dateDisplay.th : act.dateDisplay.en,
      featuredImage: act.featuredImage,
      gallery: act.gallery,
      acf: { artist: language === 'th' ? act.artist?.th : act.artist?.en, status: act.status },
    })), [wpActivities, language]);

  // Compute all available years from the loaded records
  const availableYears = useMemo(() => {
    const allItems = [...exhibitionsData, ...activitiesData];
    const yearSet = new Set<string>();
    allItems.forEach((item) => {
      if (item.date) {
        const yr = getYearFromDate(item.date);
        yearSet.add(yr);
      }
    });
    const sorted = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
    return sorted;
  }, [exhibitionsData, activitiesData]);

  // Filter the data
  const filteredData = useMemo(() => {
    let items = [...exhibitionsData, ...activitiesData];

    // Category filter
    if (activeFilter.category) {
      items = items.filter(item => item.type === activeFilter.category);
    }

    // Year filter
    if (activeFilter.year && activeFilter.year !== 'all') {
      items = items.filter(item => {
        if (!item.date) return false;
        const itemYear = getYearFromDate(item.date);
        return itemYear === activeFilter.year;
      });
    }

    return items;
  }, [exhibitionsData, activitiesData, activeFilter]);

  const handleCategoryClick = (category: 'exhibition' | 'activity' | null) => {
    setActiveFilter(prev => ({
      ...prev,
      category: prev.category === category ? null : category
    }));
  };

  const handleYearClick = (year: string | 'all') => {
    setActiveFilter(prev => ({
      ...prev,
      year: prev.year === year ? null : year
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500 font-sans">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen pb-24">
      {/* Hero */}
      <ParallaxHero 
        imageSrc={IMG_MADRID_SRC}
        imageAlt={language === 'th' ? 'คลังข้อมูล' : 'Archives'}
        height="h-[50vh] min-h-[50vh] max-h-[50vh]"
      />

      {/* Main Content */}
      <div className="w-full px-[6vw] pt-[96px]">
        {/* Header Row: Title + Filters */}
        <div className="mb-16 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-x-16">
          {/* Left: Sticky Title */}
          <div className="md:sticky md:top-32 md:self-start">
            <Reveal>
              <h1 className={`text-xl md:text-2xl font-bold text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                {language === 'th' ? 'คลังข้อมูล' : 'Archives'}
              </h1>
            </Reveal>
          </div>

          {/* Right: Filters */}
          <div className="flex flex-col gap-8">
            {/* Category Filter */}
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {language === 'th' ? 'ประเภท' : 'Type'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryClick('exhibition')}
                    className={`px-4 py-2 text-sm font-medium transition-all border ${
                      activeFilter.category === 'exhibition'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {language === 'th' ? 'นิทรรศการ' : 'Exhibitions'}
                  </button>
                  <button
                    onClick={() => handleCategoryClick('activity')}
                    className={`px-4 py-2 text-sm font-medium transition-all border ${
                      activeFilter.category === 'activity'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {language === 'th' ? 'กิจกรรม' : 'Activities'}
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Year Filter */}
            {availableYears.length > 0 && (
              <Reveal delay={0.2}>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">
                    {language === 'th' ? 'ปี' : 'Year'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleYearClick('all')}
                      className={`px-4 py-2 text-sm font-medium transition-all border ${
                        activeFilter.year === 'all'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:border-black'
                      }`}
                    >
                      {language === 'th' ? 'ทั้งหมด' : 'All'}
                    </button>
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearClick(year)}
                        className={`px-4 py-2 text-sm font-medium transition-all border ${
                          activeFilter.year === year
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-32">
          {filteredData.map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.05}>
                <div
                  className="group cursor-pointer"
                  onClick={() => onNavigate(item.type === 'exhibition' ? 'exhibition-detail' : 'activity-detail', item.slug, 'archives')}
                >
                  <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative mb-4">
                    <ImageWithFallback
                      src={item.featuredImage || ''}
                      hoverSrc={item.gallery?.[0]}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-black leading-tight mb-1 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                    {item.title}
                  </h3>
                  {item.acf?.artist && (
                    <p className={`text-xl md:text-2xl font-normal text-black leading-tight mb-1 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                      {item.acf.artist}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <p className="text-sm text-gray-400 uppercase mt-1">
                    {item.type === 'exhibition' 
                      ? (language === 'th' ? 'นิทรรศการ' : 'Exhibition')
                      : (language === 'th' ? 'กิจกรรม' : 'Activity')
                    }
                  </p>
                </div>
              </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
