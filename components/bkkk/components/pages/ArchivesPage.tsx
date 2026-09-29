'use client';
import { useEffect, useState, useMemo } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { fetchRecords, RecordItem, RecordCategory } from '@/utils/records';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useLanguage } from '@/utils/languageContext';

// Helper to extract the relevant year from a date string
const getYearFromDate = (dateStr: string): string => {
    const matches = dateStr.match(/\b20\d{2}\b/g);
    if (matches && matches.length > 0) {
        return matches[matches.length - 1];
    }
    return '';
};

interface ArchivesPageProps {
  onNavigate: (page: string, slug?: string, backTo?: string) => void;
  targetSectionId?: string;
}

export function ArchivesPage({ onNavigate, targetSectionId }: ArchivesPageProps) {
  const { language, t } = useLanguage();
  const [allRecords, setAllRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<{
      category: RecordCategory | null;
      year: string | null | 'all';
  }>({ category: null, year: null });

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      try {
        const data = await fetchRecords({ status: 'past', category: 'all', language });
        setAllRecords(data);
        
        // Select 5 random images for hero slideshow
        const imagesWithData = data.filter(record => record.image);
        const shuffled = [...imagesWithData].sort(() => Math.random() - 0.5);
        const selectedImages = shuffled.slice(0, 5).map(record => record.image);
        setHeroImages(selectedImages);
      } catch (error) {
        console.error("Failed to fetch records", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [language]);

  // Handle section scrolling when navigating from menu
  useEffect(() => {
    if (targetSectionId) {
      // Map section IDs to categories
      const sectionMapping: Record<string, { category: RecordCategory; year: string | 'all' }> = {
        'past-exhibitions': { category: 'exhibition', year: 'all' },
        'past-activities': { category: 'activity', year: 'all' }
      };

      const mapping = sectionMapping[targetSectionId];
      if (mapping) {
        setActiveFilter(mapping);
      }

      // Scroll to top of content after filter is applied
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [targetSectionId]);

  const availableFilters = useMemo(() => {
      const exhibitions = new Set<string>();
      const activities = new Set<string>();
      const movingImages = new Set<string>();

      allRecords.forEach(record => {
          const year = getYearFromDate(record.date);
          if (year) {
              if (record.category === 'exhibition') {
                  exhibitions.add(year);
              } else if (record.category === 'activity') {
                  activities.add(year);
              } else if (record.category === 'moving-image') {
                  movingImages.add(year);
              }
          }
      });

      return {
          exhibitions: Array.from(exhibitions).sort((a, b) => b.localeCompare(a)), 
          activities: Array.from(activities).sort((a, b) => b.localeCompare(a)),
          movingImages: Array.from(movingImages).sort((a, b) => b.localeCompare(a))
      };
  }, [allRecords]);

  const displayedRecords = useMemo(() => {
      if (!activeFilter.category) {
          return allRecords;
      }
      return allRecords.filter(record => {
          if (record.category !== activeFilter.category) return false;
          if (activeFilter.year === 'all') return true;
          const recordYear = getYearFromDate(record.date);
          return recordYear === activeFilter.year;
      });
  }, [allRecords, activeFilter]);

  const handleFilterClick = (category: RecordCategory, year: string | 'all') => {
      if (activeFilter.category === category && activeFilter.year === year) {
          setActiveFilter({ category: null, year: null });
      } else {
          setActiveFilter({ category, year });
      }
  };

  const handleItemClick = (item: RecordItem) => {
      if (item.category === 'exhibition') {
          onNavigate('exhibition-detail', item.slug || item.id, 'archives');
      } else if (item.category === 'activity') {
          onNavigate('activity-detail', item.slug || item.id, 'archives');
      } else if (item.category === 'event') {
          onNavigate('activity-detail', item.slug || item.id, 'archives');
      } else if (item.category === 'moving-image') {
          onNavigate('moving-image-detail', item.slug || item.id, 'archives');
      }
  };

  return (
    <div className="w-full bg-white min-h-screen pb-24">
      <ParallaxHero 
        images={heroImages}
        height="h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
            
            {/* Sidebar */}
            <aside className="w-full md:w-1/2 shrink-0">
                <div className="md:sticky md:top-32 flex flex-col gap-8">
                    
                    {/* Past Exhibition */}
                    {availableFilters.exhibitions.length > 0 && <div className="flex flex-col gap-2">
                        <h3 
                            onClick={() => handleFilterClick('exhibition', 'all')}
                            className={`text-xl md:text-2xl font-sans font-bold cursor-pointer transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                activeFilter.category === 'exhibition' && activeFilter.year === 'all'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-black'
                            }`}
                        >
                            {t('archives.pastExhibition')}
                        </h3>
                        <div className="flex flex-col gap-2">
                                {availableFilters.exhibitions.map(year => (
                                    <button 
                                        key={`exh-${year}`}
                                        onClick={() => handleFilterClick('exhibition', year)}
                                        className={`text-xl md:text-2xl text-left font-sans font-normal transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                            activeFilter.category === 'exhibition' && activeFilter.year === year
                                            ? 'text-black'
                                            : 'text-gray-400 hover:text-black'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                        </div>
                    </div>}

                    {/* Past Activities */}
                    {availableFilters.activities.length > 0 && <div className="flex flex-col gap-2">
                        <h3 
                            onClick={() => handleFilterClick('activity', 'all')}
                            className={`text-xl md:text-2xl font-sans font-bold cursor-pointer transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                activeFilter.category === 'activity' && activeFilter.year === 'all'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-black'
                            }`}
                        >
                            {t('archives.pastActivities')}
                        </h3>
                        <div className="flex flex-col gap-2">
                                {availableFilters.activities.map(year => (
                                    <button 
                                        key={`act-${year}`}
                                        onClick={() => handleFilterClick('activity', year)}
                                        className={`text-xl md:text-2xl text-left font-sans font-normal transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                            activeFilter.category === 'activity' && activeFilter.year === year
                                            ? 'text-black'
                                            : 'text-gray-400 hover:text-black'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                        </div>
                    </div>}

                    {/* Past Moving Image Programs */}
                    {availableFilters.movingImages.length > 0 && <div className="flex flex-col gap-2">
                        <h3 
                            onClick={() => handleFilterClick('moving-image', 'all')}
                            className={`text-xl md:text-2xl font-sans font-bold cursor-pointer transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                activeFilter.category === 'moving-image' && activeFilter.year === 'all'
                                ? 'text-black'
                                : 'text-gray-400 hover:text-black'
                            }`}
                        >
                            {language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวที่ผ่านมา' : 'Past Moving Image Programs'}
                        </h3>
                        <div className="flex flex-col gap-2">
                                {availableFilters.movingImages.map(year => (
                                    <button 
                                        key={`mi-${year}`}
                                        onClick={() => handleFilterClick('moving-image', year)}
                                        className={`text-xl md:text-2xl text-left font-sans font-normal transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                            activeFilter.category === 'moving-image' && activeFilter.year === year
                                            ? 'text-black'
                                            : 'text-gray-400 hover:text-black'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                        </div>
                    </div>}

                </div>
            </aside>

            {/* Content */}
            <div className="w-full md:w-1/2 flex flex-col md:items-end">
                <div className="flex flex-col gap-12 md:gap-16 w-full">
                    {loading ? (
                        <div className="py-20 text-gray-400 font-sans text-xl md:text-2xl">Loading archives...</div>
                    ) : (
                        displayedRecords.map((item, index) => (
                            <Reveal key={item.id} delay={index * 0.1}>
                                <div 
                                    className="flex flex-col gap-6 w-full cursor-pointer group"
                                    onClick={() => handleItemClick(item)}
                                >
                                    {/* Image */}
                                    <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                                        {item.category === 'moving-image' ? (
                                            <ImageWithFallback 
                                                src={item.image} 
                                                hoverSrc={item.gallery?.[0]}
                                                alt={item.title}
                                                className="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                                fetchPriority="low"
                                            />
                                        ) : (
                                            <ImageWithFallback 
                                                src={item.image} 
                                                hoverSrc={item.gallery?.[0]}
                                                alt={item.title}
                                                className="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                                fetchPriority="low"
                                            />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col gap-1">
                                        <h3 className={`text-xl md:text-2xl font-bold leading-tight font-sans text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.title}</h3>
                                        {item.description && (
                                            <p className={`text-xl md:text-2xl font-normal text-black leading-tight font-sans ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.description}</p>
                                        )}
                                        <p className={`text-xl md:text-2xl font-normal text-black leading-tight mt-2 font-sans ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{item.date}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
