'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface RelatedContentItem {
  id: string;
  slug: string;
  type: 'exhibitions' | 'activities' | 'residency' | 'blog' | 'moving-image';
  title: { en: string; th?: string };
  date?: string;
  image?: string;
  category?: string;
  status?: 'current' | 'upcoming' | 'past';
  site?: 'kyaf' | 'bkkk';
}

interface RelatedContentSectionProps {
  items?: RelatedContentItem[];
  currentId: string;
  currentType: RelatedContentItem['type'];
  site: 'kyaf' | 'bkkk';
  language: 'en' | 'th';
}

type RelatedGroupKey = RelatedContentItem['type'];

const routeSegments: Record<RelatedContentItem['type'], string> = {
  exhibitions: 'exhibitions',
  activities: 'activities',
  residency: 'artists',
  blog: 'blog',
  'moving-image': 'moving-image',
};

function RelatedContentCarousel({
  items,
  prefix,
  language,
  label,
  groupKey,
}: {
  items: RelatedContentItem[];
  prefix: string;
  language: 'en' | 'th';
  label: string;
  groupKey: RelatedGroupKey;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ hasOverflow: false, atStart: true, atEnd: true, imageCenterTop: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollState = () => {
      const carousel = carouselRef.current;
      const firstCardImage = track.firstElementChild?.querySelector<HTMLElement>('[data-related-carousel-image]');
      const carouselRect = carousel?.getBoundingClientRect();
      const imageRect = firstCardImage?.getBoundingClientRect();

      setScrollState({
        hasOverflow: track.scrollWidth > track.clientWidth + 1,
        atStart: track.scrollLeft <= 1,
        atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
        imageCenterTop: carouselRect && imageRect
          ? imageRect.top + imageRect.height / 2 - carouselRect.top
          : 0,
      });
    };

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(track);
    const firstCardImage = track.firstElementChild?.querySelector('[data-related-carousel-image]');
    if (firstCardImage) resizeObserver.observe(firstCardImage);
    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      resizeObserver.disconnect();
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [items.length]);

  const scroll = (direction: 'previous' | 'next') => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.children) as HTMLElement[];
    const firstCard = cards[0]?.getBoundingClientRect();
    const secondCard = cards[1]?.getBoundingClientRect();
    const step = firstCard && secondCard
      ? secondCard.left - firstCard.left
      : firstCard?.width ?? track.clientWidth * 0.8;

    track.scrollBy({ left: direction === 'previous' ? -step : step, behavior: 'smooth' });
  };

  return (
    <div ref={carouselRef} className="relative overflow-visible">
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory flex-nowrap gap-8 overflow-x-auto overscroll-x-contain pb-3 focus-visible:outline-2 focus-visible:outline-offset-4 [-webkit-overflow-scrolling:touch]"
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        tabIndex={0}
      >
        {items.map((item) => (
          <Link key={`${item.type}:${item.id}`} href={`${prefix}/${routeSegments[item.type]}/${item.slug}/`} className="group block w-[82%] shrink-0 snap-start focus-visible:outline-2 focus-visible:outline-offset-4 sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.333rem)]">
            <div data-related-carousel-image className="mb-4 aspect-[3/4] overflow-hidden bg-gray-100">
              {item.image ? (
                <img src={item.image} alt={language === 'th' ? (item.title.th || item.title.en) : item.title.en} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]" />
              ) : (
                <div className="h-full w-full" aria-hidden="true" />
              )}
            </div>
            {groupKey === 'blog' && item.category && <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{item.category}</p>}
            <h3 className="text-lg font-bold leading-tight">{language === 'th' ? (item.title.th || item.title.en) : item.title.en}</h3>
            {item.date && <p className="mt-1 text-sm text-gray-600">{item.date}</p>}
          </Link>
        ))}
      </div>
      {scrollState.hasOverflow && !scrollState.atStart && (
        <button
          type="button"
          onClick={() => scroll('previous')}
          aria-label={language === 'th' ? `เนื้อหาก่อนหน้า: ${label}` : `Previous ${label}`}
          style={{ top: scrollState.imageCenterTop }}
          className="absolute left-0 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
      {scrollState.hasOverflow && !scrollState.atEnd && (
        <button
          type="button"
          onClick={() => scroll('next')}
          aria-label={language === 'th' ? `เนื้อหาถัดไป: ${label}` : `Next ${label}`}
          style={{ top: scrollState.imageCenterTop }}
          className="absolute right-0 z-10 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function RelatedContentSection({ items, currentId, currentType, site, language }: RelatedContentSectionProps) {
  const seen = new Set<string>();
  const visible = (items ?? [])
    // Exhibition pages intentionally recommend other types, not another
    // exhibition. Other detail pages can show curated records of their own type
    // (for example, related Activities or Moving Image records).
    .filter((item) => item.id !== currentId && !(currentType === 'exhibitions' && item.type === 'exhibitions') && item.site === site && Boolean(routeSegments[item.type]))
    .filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (visible.length === 0) return null;

  const groupFor = (item: RelatedContentItem): RelatedGroupKey => item.type;
  // Activity recommendations lead the related-content area, including on
  // Exhibition details. The same order is shared by BK and KYAF.
  const groupOrder: RelatedGroupKey[] = ['activities', 'exhibitions', 'moving-image', 'residency', 'blog'];
  const groupLabels: Record<RelatedGroupKey, { en: string; th: string }> = {
    exhibitions: { en: 'Related Exhibitions', th: 'นิทรรศการที่เกี่ยวข้อง' },
    activities: { en: 'Related Activities', th: 'กิจกรรมที่เกี่ยวข้อง' },
    'moving-image': { en: 'Related Moving Image', th: 'ภาพเคลื่อนไหวที่เกี่ยวข้อง' },
    residency: { en: 'Related Artists / Residency', th: 'ศิลปิน / พำนักที่เกี่ยวข้อง' },
    blog: { en: 'Related Blogs', th: 'บล็อกที่เกี่ยวข้อง' },
  };
  const groups = groupOrder
    .map((key) => ({ key, items: visible.filter((item) => groupFor(item) === key) }))
    .filter((group) => group.items.length > 0);

  const prefix = site === 'bkkk' ? '/bk' : '/kyaf';
  return (
    <section
      className="mt-20 border-t border-black/20 pt-6"
      aria-label={language === 'th' ? 'เนื้อหาที่เกี่ยวข้อง' : 'Related Content'}
    >
      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`related-${currentId}-${group.key}`}>
            <h2 id={`related-${currentId}-${group.key}`} className="mb-5 text-base font-bold">
              {groupLabels[group.key][language]}
            </h2>
            <RelatedContentCarousel
              items={group.items}
              prefix={prefix}
              language={language}
              label={groupLabels[group.key][language]}
              groupKey={group.key}
            />
          </section>
        ))}
      </div>
    </section>
  );
}
