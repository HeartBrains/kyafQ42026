'use client';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ASSETS as ROOT_ASSETS } from '@/utils/assets';
import { ASSETS } from '@/components/kyaf/utils/assets';
import { ExpandingSearch } from '../search/ExpandingSearch';
import { useLanguage } from '@/utils/languageContext';
import { siteConfig, isSectionVisible } from '@/utils/siteConfig';
import { useMenuConfig, useSectionVisibility } from '@/lib/useWPData';
import KyafWhite from '../../imports/KyafWhite';
import { Logo } from '../../../bkkk/components/ui/Logo';

const SITE_COVER_PREVIEWS = {
  bk: '/assets/c62c64ac454fd8fd1b5ba6a64e8e3a9305f2f778.png',
  kyaf: '/assets/cf64d0ac119d7726ae241c9d4cf05ce82a8d3c8c.png',
} as const;

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, slug?: string, backTo?: any, section?: string) => void;
  activePage: string;
}

interface MenuItem {
    label: string;
    page: string;
    section?: string;
    children?: MenuItem[];
    externalUrl?: string;
}

export function MenuOverlay({ isOpen, onClose, onNavigate, activePage }: MenuOverlayProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [siteCoverPreview, setSiteCoverPreview] = useState<keyof typeof SITE_COVER_PREVIEWS | null>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!isOpen) setSiteCoverPreview(null);
  }, [isOpen]);

  // WP-driven menu visibility — merges over siteConfig.kyafMenu; falls back to kyafMenu while loading
  const wpMenu = useMenuConfig('kyaf');
  const menu = { ...siteConfig.kyafMenu, ...(wpMenu ?? {}) };
  const isVisible = (key: string) => (menu as Record<string, boolean>)[key] ?? (siteConfig.kyafMenu as Record<string, boolean>)[key] ?? true;
  const wpSections = useSectionVisibility('kyaf');
  const sec = (cpt: string, section: string) => {
    const cptSec = wpSections?.[cpt as keyof typeof wpSections] as Record<string, boolean> | undefined;
    const fallback = (siteConfig.visibility as Record<string, Record<string, boolean>>)?.[cpt]?.[section] ?? true;
    return cptSec?.[section] ?? fallback;
  };

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
    { label: t('nav.home'), page: 'home' },
    { label: t('nav.visit'), page: 'visit' },
    { 
      label: t('nav.artworks'), 
      page: 'exhibitions',
      children: [
          ...(sec('exhibitions', 'upcoming') ? [{ label: t('artworks.upcoming'), page: 'exhibitions', section: 'upcoming' }] : []),
          ...(sec('exhibitions', 'current')  ? [{ label: t('artworks.current'),  page: 'exhibitions', section: 'current'  }] : []),
          ...(sec('exhibitions', 'past')     ? [{ label: t('artworks.past'),     page: 'exhibitions', section: 'past'     }] : []),
      ]
    },
    {
        label: t('nav.activities'),
        page: 'activities',
        children: [
            ...(sec('activities', 'upcoming') ? [{ label: t('activities.upcoming'), page: 'activities', section: 'upcoming' }] : []),
            ...(sec('activities', 'current')  ? [{ label: t('activities.current'),  page: 'activities', section: 'current'  }] : []),
            ...(sec('activities', 'past')     ? [{ label: t('activities.past'),     page: 'activities', section: 'past'     }] : []),
        ]
    },
    {
        label: t('nav.residency'),
        page: 'residency',
        children: [
            ...(sec('residency', 'upcoming') ? [{ label: language === 'th' ? t('residency.upcomingArtists') : 'Upcoming Residency', page: 'residency', section: 'upcoming' }] : []),
            ...(sec('residency', 'current')  ? [{ label: t('residency.currentArtists'),  page: 'residency', section: 'current'  }] : []),
            ...(sec('residency', 'past')     ? [{ label: t('residency.pastArtists'),      page: 'residency', section: 'past'     }] : []),
        ]
    },
    { label: t('nav.blog'), page: 'blog' },
    { label: t('nav.aboutUs'), page: 'about' },
    { label: t('nav.team'), page: 'team' },
    { label: t('nav.booking'), page: '', externalUrl: 'https://www.tickettailor.com/events/khaoyaiart' },
    {
        label: t('nav.shop'),
        page: 'shop',
        children: [
            { label: 'Bookings', page: 'shop' },
            { label: 'Products', page: 'shop' },
        ]
    },
    {
        label: t('nav.archives'),
        page: 'archives',
        children: [
            { label: t('exhibitions.past'), page: 'archives' },
            { label: 'Past Activities', page: 'archives' },
        ]
    },
    ...(isVisible('support') ? [{ label: language === 'th' ? 'สนับสนุนเรา' : 'Support Us', page: 'support' }] : []),
    { label: t('nav.contact'), page: 'contact' },
  ];

  // Map page names to menu config keys
  const pageToMenuKey: Record<string, keyof typeof siteConfig.menu | null> = {
    'home': 'home',
    'visit': 'visit',
    'exhibitions': 'exhibitions',
    'activities': 'activities',
    'residency': 'residency',
    'blog': 'blog',
    'about': 'about',
    'team': 'team',
    'shop': 'shop',
    'archives': 'archives',
    'contact': 'contact',
    '': null, // for external links like booking
  };

  // Filter sitemap based on visibility settings
  const visibleSitemap = sitemap.filter(item => {
    if (item.externalUrl && item.label === t('nav.booking')) {
      return isVisible('booking');
    }
    const menuKey = pageToMenuKey[item.page];
    if (menuKey === null) return true;
    return isVisible(menuKey);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex text-white font-sans"
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse' && event.clientX < event.currentTarget.clientWidth / 2) {
              setSiteCoverPreview(null);
            }
          }}
          onPointerLeave={() => setSiteCoverPreview(null)}
          onBlurCapture={(event) => {
            const nextFocusedElement = event.relatedTarget;
            if (!(nextFocusedElement instanceof Node) || !event.currentTarget.contains(nextFocusedElement)) {
              setSiteCoverPreview(null);
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
          {siteCoverPreview === 'bk' && (
            <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-end pr-[6vw]">
              <a
                href="/bk"
                aria-label="Open Bangkok Kunsthalle"
                className="pointer-events-auto block w-[40vw] max-w-[42rem]"
              >
                <span aria-hidden="true" className="block aspect-[355/133] w-full">
                  <Logo className="size-full" white />
                </span>
              </a>
            </div>
          )}
          {/* Left Image Side - Hidden on Mobile */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="relative z-10 hidden h-full w-1/2 overflow-hidden md:block"
          >
            <div 
              className={`absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${siteCoverPreview ? 'opacity-0' : 'opacity-100'}`}
              style={{ backgroundImage: `url(${ASSETS.LANDING_BUILDING})`, filter: 'saturate(0) brightness(0.85)' }}
              onClick={onClose}
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
            onClick={onClose}
          >
             {/* Close Button */}
             <div className="absolute top-[calc(8vh+15px)] right-[6vw] z-20">
                <button onClick={onClose} className="hover:opacity-70 transition-opacity duration-300">
                    <X className="w-6 h-6 text-white" />
                </button>
             </div>

             {/* Navigation Links Container */}
             <motion.div 
                className={`flex-1 flex flex-col px-[6vw] py-[8vh] transition-colors duration-700 ease-in-out motion-reduce:transition-none ${siteCoverPreview ? 'bg-transparent' : 'bg-black/60'}`}
                onClick={(e) => e.stopPropagation()}
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
                <div className="flex-1 flex flex-col gap-2 px-[0px] py-[0.18px] pt-[15px] pr-[0px] pb-[0px] pl-[0px]">
                    {visibleSitemap.map((item) => {
                        const isExpanded = expandedItems.includes(item.label);
                        const hasChildren = item.children && item.children.length > 0;
                        const isActive = activePage === item.page;

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
                                            if (item.externalUrl) {
                                                window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
                                                onClose();
                                            } else {
                                                onNavigate(item.page);
                                                onClose();
                                            }
                                        }}
                                        className={`text-left text-xl md:text-2xl font-normal transition-colors duration-300 tracking-wide ${
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
                                            className="overflow-hidden pl-4 md:pl-6  border-white/10 ml-2 mt-2 space-y-2"
                                        >
                                            {item.children!.map((child) => {
                                                // No additional translation needed - using t() function from menu structure
                                                let displayLabel = child.label;
                                                if (language === 'th') {
                                                    switch (child.label) {
                                                        case 'Bookings': displayLabel = 'การจอง'; break;
                                                        case 'Products': displayLabel = 'สินค้า'; break;
                                                        case 'Past Activities': displayLabel = 'กิจกรรมที่ผ่านมา'; break;
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={child.label}
                                                        onClick={() => {
                                                            onNavigate(child.page, undefined, undefined, child.section);
                                                            onClose();
                                                        }}
                                                        className="block w-full text-left text-xl md:text-2xl font-normal text-white hover:text-gray-300 transition-colors tracking-wide leading-relaxed py-1"
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

                    <div className="mt-3">
                      <ExpandingSearch
                        onNavigate={(page, slug) => {
                          onNavigate(page, slug);
                          onClose();
                        }}
                        className="gap-2"
                        iconClassName="w-6 h-6 text-white"
                        inputClassName="w-40 text-lg text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* Footer Section */}
                </div>

                <motion.div 
                    className="h-[10vh] flex justify-between items-end w-full"
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                >
                    <div className="flex w-full items-center gap-6">
                        <a 
                            href="/bk"
                            onPointerEnter={(event) => {
                                if (event.pointerType === 'mouse') setSiteCoverPreview('bk');
                            }}
                            className="ml-auto inline-flex items-center gap-3 text-xl md:text-2xl text-white font-normal hover:text-gray-300 transition-colors tracking-wide cursor-pointer"
                        >
                            <span>Bangkok Kunsthalle</span>
                        </a>
                    </div>

                    {isVisible('languageSwitcher') && (  
                        <div className="text-xl md:text-2xl font-normal text-gray-500 select-none tracking-wide flex items-center">
                            <button 
                                className={`cursor-pointer transition-colors ${language === 'en' ? 'text-white' : 'hover:text-white'}`}
                                onClick={() => setLanguage('en')}
                            >
                                EN
                            </button>
                            <span className="mx-2">|</span>
                            <button 
                                className={`cursor-pointer transition-colors ${language === 'th' ? 'text-white' : 'hover:text-white'}`}
                                onClick={() => setLanguage('th')}
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
