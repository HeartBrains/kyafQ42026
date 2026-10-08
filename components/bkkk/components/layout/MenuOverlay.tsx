'use client';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/utils/assets';
import { ExpandingSearch } from '../search/ExpandingSearch';
import { useLanguage } from '@/utils/languageContext';
import { siteConfig } from '@/utils/siteConfig';
import { useMenuConfig, useSectionVisibility } from '@/lib/useWPData';
import { useSiteSwitchPreview } from '@/components/shared/useSiteSwitchPreview';
import { MobileSiteSwitchPreview } from '@/components/shared/MobileSiteSwitchPreview';

const SITE_COVER_PREVIEWS = {
  bk: '/assets/c62c64ac454fd8fd1b5ba6a64e8e3a9305f2f778.png',
  kyaf: '/assets/cf64d0ac119d7726ae241c9d4cf05ce82a8d3c8c.png',
} as const;

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, slug?: string, sectionId?: string) => void;
  activePage: string;
}

interface MenuItem {
    label: string;
    page: string;
    sectionId?: string;
    children?: MenuItem[];
}

export function MenuOverlay({ isOpen, onClose, onNavigate, activePage }: MenuOverlayProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const {
    menuState,
    preview,
    triggerRef,
    previewLinkRef,
    showFromHover,
    showFromFocus,
    pinPreview,
    dismissPreview,
    cancelHoverDismiss,
    scheduleHoverDismiss,
  } = useSiteSwitchPreview({ isOpen, onClose });
  const siteCoverPreview = preview?.site ?? null;

  useEffect(() => {
    document.body.toggleAttribute('data-menu-open', isOpen);
    document.body.setAttribute('data-menu-state', menuState);
    return () => {
      document.body.removeAttribute('data-menu-open');
      document.body.removeAttribute('data-menu-state');
    };
  }, [isOpen, menuState]);
  
  // Safe hook call with fallback for HMR
  let language: 'en' | 'th' = 'en';
  let setLanguage: ((lang: 'en' | 'th') => void) | undefined;
  let t: (key: string) => string = (key) => key;
  
  try {
    const context = useLanguage();
    language = context.language;
    setLanguage = context.setLanguage;
    t = context.t;
  } catch (error) {
    // During HMR, context might not be available
    console.warn('LanguageContext not available, using defaults');
  }

  // WP-driven menu visibility — merges over siteConfig.menu; falls back to siteConfig while loading
  const wpMenu = useMenuConfig('bkkk');
  const wpSections = useSectionVisibility('bkkk');
  const secVis = {
    exhibitions: {
      upcoming: wpSections?.exhibitions?.upcoming ?? siteConfig.visibility.exhibitions.upcoming,
      current:  wpSections?.exhibitions?.current  ?? siteConfig.visibility.exhibitions.current,
      past:     wpSections?.exhibitions?.past     ?? siteConfig.visibility.exhibitions.past,
    },
    activities: {
      upcoming: wpSections?.activities?.upcoming ?? siteConfig.visibility.activities.upcoming,
      current:  wpSections?.activities?.current  ?? siteConfig.visibility.activities.current,
      past:     wpSections?.activities?.past     ?? siteConfig.visibility.activities.past,
    },
    movingImage: {
      upcoming: wpSections?.movingImage?.upcoming ?? siteConfig.visibility.movingImage.upcoming,
      current:  wpSections?.movingImage?.current  ?? siteConfig.visibility.movingImage.current,
      past:     wpSections?.movingImage?.past     ?? siteConfig.visibility.movingImage.past,
    },
    residency: {
      upcoming: wpSections?.residency?.upcoming ?? siteConfig.visibility.residency.upcoming,
      current:  wpSections?.residency?.current  ?? siteConfig.visibility.residency.current,
      past:     wpSections?.residency?.past     ?? siteConfig.visibility.residency.past,
    },
  };
  const menu = { ...siteConfig.menu, ...(wpMenu ?? {}) };

  const toggleExpand = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  // Dynamic sitemap based on current language
  const sitemap: MenuItem[] = [
    ...(menu.home ? [{ label: t('nav.home'), page: 'home' }] : []),
    ...(menu.visit ? [{ label: t('nav.visit'), page: 'visit' }] : []),
    ...(menu.exhibitions ? [{ 
      label: t('nav.exhibitions'), 
      page: 'exhibitions',
      children: [
          ...(secVis.exhibitions.upcoming ? [{ label: t('exhibitions.upcoming'), page: 'exhibitions', sectionId: 'upcoming-exhibitions' }] : []),
          ...(secVis.exhibitions.current ? [{ label: t('exhibitions.current'), page: 'exhibitions', sectionId: 'current-exhibitions' }] : []),
          ...(secVis.exhibitions.past ? [{ label: t('exhibitions.past'), page: 'exhibitions', sectionId: 'past-exhibitions' }] : []),
      ]
    }] : []),
    ...(menu.movingImage ? [{ 
      label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหว' : 'Moving Image Program', 
      page: 'moving-image',
      children: [
          ...(secVis.movingImage.upcoming ? [{ label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวที่กำลังจะมาถึง' : 'Upcoming Moving Image Program', page: 'moving-image', sectionId: 'upcoming-programs' }] : []),
          ...(secVis.movingImage.current ? [{ label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวปัจจุบัน' : 'Current Moving Image Program', page: 'moving-image', sectionId: 'current-programs' }] : []),
          ...(secVis.movingImage.past ? [{ label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหวที่ผ่านมา' : 'Past Moving Image Program', page: 'moving-image', sectionId: 'past-programs' }] : []),
      ]
    }] : []),
    ...(menu.activities ? [{
        label: t('nav.activities'),
        page: 'activities',
        children: [
            ...(secVis.activities.upcoming ? [{ label: t('activities.upcoming'), page: 'activities', sectionId: 'upcoming-activities' }] : []),
            ...(secVis.activities.current ? [{ label: t('activities.current'), page: 'activities', sectionId: 'current-activities' }] : []),
            ...(secVis.activities.past ? [{ label: t('activities.past'), page: 'activities', sectionId: 'past-activities' }] : []),
        ]
    }] : []),
    ...(menu.residency ? [{
        label: t('nav.residency'),
        page: 'residency',
        children: [
            ...(secVis.residency.upcoming ? [{ label: t('residency.upcomingResidency'), page: 'residency', sectionId: 'upcoming-residency' }] : []),
            ...(secVis.residency.current ? [{ label: t('residency.currentArtists'), page: 'residency', sectionId: 'current-artists' }] : []),
            ...(secVis.residency.past ? [{ label: t('residency.pastArtists'), page: 'residency', sectionId: 'past-artists' }] : []),
        ]
    }] : []),
    ...(menu.blog ? [{ label: t('nav.blog'), page: 'blog' }] : []),
    ...(menu.about ? [{ label: t('nav.aboutUs'), page: 'about' }] : []),
    ...(menu.team ? [{ label: t('nav.team'), page: 'team' }] : []),
    ...(menu.shop ? [{
        label: t('nav.shop'),
        page: 'shop',
        children: [
            ...(siteConfig.visibility.shop.bookings ? [{ label: 'Bookings', page: 'shop', sectionId: 'bookings' }] : []),
            ...(siteConfig.visibility.shop.products ? [{ label: 'Products', page: 'shop', sectionId: 'products' }] : []),
        ]
    }] : []),
    ...(menu.archives ? [{
        label: t('nav.archives'),
        page: 'archives',
        children: [
            ...(siteConfig.visibility.archives.pastExhibitions ? [{ label: t('exhibitions.past'), page: 'archives', sectionId: 'past-exhibitions' }] : []),
            ...(siteConfig.visibility.archives.pastActivities ? [{ label: 'Past Activities', page: 'archives', sectionId: 'past-activities' }] : []),
        ]
    }] : []),
    ...(menu.support ? [{ label: language === 'th' ? 'สนับสนุนเรา' : 'Support Us', page: 'support' }] : []),
    ...(menu.contact ? [{ label: t('nav.contact'), page: 'contact' }] : []),
  ];

  const isItemActive = (itemPage: string, currentPage: string) => {
    if (itemPage === currentPage) return true;
    if (itemPage === 'exhibitions' && currentPage === 'exhibition-detail') return true;
    if (itemPage === 'moving-image' && currentPage === 'moving-image-detail') return true;
    if (itemPage === 'activities' && currentPage === 'activity-detail') return true;
    if (itemPage === 'blog' && (currentPage === 'blog-detail' || currentPage === 'news' || currentPage === 'post')) return true;
    if (itemPage === 'residency' && currentPage === 'artist-detail') return true;
    if (itemPage === 'about' && (currentPage === 'vision' || currentPage === 'history')) return true;
    if (itemPage === 'team' && currentPage === 'founder') return true;
    return false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex text-white font-sans"
          data-menu-state={menuState}
          onBlurCapture={(event) => {
            const nextFocusedElement = event.relatedTarget;
            if (!(nextFocusedElement instanceof Node) || !event.currentTarget.contains(nextFocusedElement)) {
              dismissPreview();
            }
          }}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${siteCoverPreview ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: siteCoverPreview ? `url(${SITE_COVER_PREVIEWS[siteCoverPreview]})` : undefined }}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-[1] bg-black/35 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${siteCoverPreview ? 'opacity-100' : 'opacity-0'}`}
          />
          {siteCoverPreview === 'kyaf' && (
            <div
              id="bk-site-switch-preview"
              className="fixed inset-0 z-20 hidden cursor-default items-center justify-end pr-[6vw] md:flex"
              onClick={() => dismissPreview()}
              onPointerEnter={cancelHoverDismiss}
              onPointerLeave={scheduleHoverDismiss}
            >
              <a
                ref={previewLinkRef}
                href="/kyaf"
                aria-label="Open Khao Yai Art Forest"
                onClick={(event) => event.stopPropagation()}
                className="block w-[min(70vw,22rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:w-[min(31vw,22rem)]"
              >
                <Image
                  src="/assets/khao-yai-art-forest-wordmark.png"
                  alt=""
                  width={371}
                  height={159}
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                  className="block h-auto w-full object-contain"
                />
              </a>
            </div>
          )}
          {siteCoverPreview === 'kyaf' && (
            <MobileSiteSwitchPreview
              site="kyaf"
              href="/kyaf"
              logoSrc="/assets/khao-yai-art-forest-wordmark.png"
              logoAlt="Khao Yai Art Forest"
              width={371}
              height={159}
              linkRef={previewLinkRef}
              onDismiss={() => dismissPreview()}
            />
          )}
          {/* Left Image Side - Hidden on Mobile */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="relative z-10 hidden h-full w-1/2 overflow-hidden md:block"
            onClick={onClose}
          >
            <div 
              className={`absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${siteCoverPreview ? 'opacity-0' : 'opacity-100'}`}
              style={{ backgroundImage: `url(${ASSETS.BUILDING})`, filter: 'saturate(0) brightness(0.85)' }}
            />

          </motion.div>

          {/* Right Content Side */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden={Boolean(siteCoverPreview)}
            inert={Boolean(siteCoverPreview)}
            className={`relative z-10 flex h-full w-full flex-col overflow-y-auto transition-[background-color,opacity] duration-700 ease-in-out motion-reduce:transition-none md:w-1/2 ${siteCoverPreview ? 'pointer-events-none bg-transparent opacity-0' : 'bg-black opacity-100'}`}
          >
             {/* Close Button */}
             <div className="absolute top-[8vh] right-[6vw] z-20">
                <button onClick={onClose} className="hover:opacity-70 transition-opacity duration-300">
                    <X className="w-6 h-6 text-white" />
                </button>
             </div>

             {/* Navigation Links Container */}
             <motion.div 
                className="flex-1 flex flex-col px-[6vw] pt-[8vh] pb-[8vh] w-full"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.3
                        }
                    }
                }}
             >
                <div className="flex flex-col gap-1 w-full">
                    {sitemap.map((item) => {
                        const isExpanded = expandedItems.includes(item.label);
                        const hasChildren = item.children && item.children.length > 0;
                        const isActive = isItemActive(item.page, activePage);

                        return (
                            <motion.div 
                                key={item.label}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    show: { opacity: 1, x: 0 }
                                }}
                                className="flex flex-col"
                            >
                                <div className="flex items-center justify-between group">
                                    <button
                                        onClick={() => {
                                            onNavigate(item.page);
                                            onClose();
                                        }}
                                        className={`text-left text-[18px] font-normal transition-colors duration-300 tracking-wide ${
                                            isActive ? 'text-gray-300' : 'text-white group-hover:text-gray-300'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                    
                                    {hasChildren && (
                                        <button 
                                            onClick={(e) => toggleExpand(item.label, e)}
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {hasChildren && isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden pl-[4vw] mt-1 mb-2 space-y-2"
                                        >
                                            {item.children!.map((child) => {
                                                // Translate specific child labels
                                                let displayLabel = child.label;
                                                if (language === 'th') {
                                                    switch (child.label) {
                                                        case 'Bookings': displayLabel = 'การจอง'; break;
                                                        case 'Products': displayLabel = 'สินค้า'; break;
                                                        case 'Moving Image Program': displayLabel = 'โปรแกรมภาพเคลื่อนไหว'; break;
                                                        case 'Public Program': displayLabel = 'โปรแกรมสาธารณะ'; break;
                                                        case 'Past Activities': displayLabel = 'กิจกรรมที่ผ่านมา'; break;
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={child.label}
                                                        onClick={() => {
                                                            onNavigate(child.page, undefined, child.sectionId);
                                                            onClose();
                                                        }}
                                                        className={`block w-full text-left text-[18px] text-white hover:text-gray-300 transition-colors py-1 ${language === 'th' ? 'leading-[1.82em]' : 'leading-snug'}`}
                                                    >
                                                        {displayLabel}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    {siteConfig.menu.search && (
                      <div className="mt-3">
                        <ExpandingSearch
                          onNavigate={(page, slug) => {
                            onNavigate(page, slug);
                            onClose();
                          }}
                          className="gap-2"
                          iconClassName="w-6 h-6 text-white"
                          inputClassName="w-40 text-[18px] text-white placeholder:text-gray-500"
                        />
                      </div>
                    )}

                    {/* Footer Section */}
                </div>

                <motion.div 
                    className="mt-auto flex justify-between items-center w-full h-[10vh]"
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                >
                    <div className="ml-auto flex w-full flex-col items-end gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">Mobile · click</span>
                          <button
                              type="button"
                              aria-label="Mobile preview Khao Yai Art Forest"
                              aria-controls="bk-site-switch-preview"
                              aria-expanded={siteCoverPreview === 'kyaf'}
                              onClick={() => pinPreview('kyaf')}
                              className="inline-flex items-center transition-opacity hover:opacity-75"
                          >
                              <Image
                                src="/assets/khao-yai-art-forest-wordmark.png"
                                alt=""
                                width={371}
                                height={159}
                                aria-hidden="true"
                                loading="eager"
                                decoding="async"
                                className="h-auto w-36 object-contain md:w-40"
                              />
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">Desktop · hover</span>
                          <button
                              ref={triggerRef}
                              type="button"
                              aria-label="Desktop preview Khao Yai Art Forest"
                              aria-controls="bk-site-switch-preview"
                              aria-expanded={siteCoverPreview === 'kyaf'}
                              onClick={() => pinPreview('kyaf')}
                              onPointerEnter={(event) => {
                                if (event.pointerType === 'mouse') showFromHover('kyaf');
                              }}
                              onFocus={(event) => showFromFocus('kyaf', event.currentTarget.matches(':focus-visible'))}
                              className="inline-flex items-center transition-opacity hover:opacity-75"
                          >
                              <Image
                                src="/assets/khao-yai-art-forest-wordmark.png"
                                alt=""
                                width={371}
                                height={159}
                                aria-hidden="true"
                                loading="eager"
                                decoding="async"
                                className="h-auto w-36 object-contain md:w-40"
                              />
                          </button>
                        </div>
                    </div>

                    {siteConfig.menu.languageSwitcher && (
                      <div className="text-[18px] font-normal text-gray-500 select-none tracking-wide flex items-center">
                          <button 
                              className={`cursor-pointer transition-colors ${language === 'en' ? 'text-white' : 'hover:text-white'}`}
                              onClick={() => setLanguage && setLanguage('en')}
                          >
                              EN
                          </button>
                          <span className="mx-2">|</span>
                          <button 
                              className={`cursor-pointer transition-colors ${language === 'th' ? 'text-white' : 'hover:text-white'}`}
                              onClick={() => setLanguage && setLanguage('th')}
                          >
                              TH
                          </button>
                      </div>
                    )}
                </motion.div>

             </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
