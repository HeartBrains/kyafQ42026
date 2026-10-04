'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchBlogVideoPreviewBySlug, fetchFirstGalleryImageBySlug, type VideoPreviewMedia } from '@/lib/useWPData';

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

const relatedRestTypes: Record<RelatedContentItem['type'], Parameters<typeof fetchFirstGalleryImageBySlug>[0]> = {
  exhibitions: 'exhibition',
  activities: 'activity',
  residency: 'residency_artist',
  blog: 'blog_post',
  'moving-image': 'moving_image',
};
const galleryPreviewRequests = new Map<string, Promise<string | null>>();
const blogVideoPreviewRequests = new Map<string, Promise<VideoPreviewMedia | null>>();

async function fetchFirstGalleryImage(item: RelatedContentItem, site: 'kyaf' | 'bkkk'): Promise<string | null> {
  const key = `${site}:${item.type}:${item.slug}`;
  const cached = galleryPreviewRequests.get(key);
  if (cached) return cached;

  const request = fetchFirstGalleryImageBySlug(relatedRestTypes[item.type], item.slug, site);

  galleryPreviewRequests.set(key, request);
  return request;
}

function fetchBlogVideoPreview(item: RelatedContentItem, site: 'kyaf' | 'bkkk'): Promise<VideoPreviewMedia | null> {
  const key = `${site}:blog:${item.slug}`;
  const cached = blogVideoPreviewRequests.get(key);
  if (cached) return cached;

  const request = fetchBlogVideoPreviewBySlug(item.slug, site);
  blogVideoPreviewRequests.set(key, request);
  return request;
}

function RelatedContentCard({
  item,
  prefix,
  site,
  language,
}: {
  item: RelatedContentItem;
  prefix: string;
  site: 'kyaf' | 'bkkk';
  language: 'en' | 'th';
}) {
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const [galleryImageLoaded, setGalleryImageLoaded] = useState(false);
  const [videoPreview, setVideoPreview] = useState<VideoPreviewMedia | null>(null);
  const [videoPreviewLoaded, setVideoPreviewLoaded] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const requestedGalleryImage = useRef(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const requestGalleryPreview = () => {
    setIsPreviewActive(true);
    if (requestedGalleryImage.current) return;
    requestedGalleryImage.current = true;

    const loadGalleryImage = () => fetchFirstGalleryImage(item, site).then((url) => {
      if (url && url !== item.image) setGalleryImage(url);
    });

    if (item.type === 'blog') {
      void fetchBlogVideoPreview(item, site).then((preview) => {
        if (preview) setVideoPreview(preview);
        else void loadGalleryImage();
      });
      return;
    }

    void loadGalleryImage();
  };

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;

    if (isPreviewActive) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      if (video.readyState > 0) video.currentTime = 0;
    }
  }, [isPreviewActive, videoPreview]);

  const title = language === 'th' ? (item.title.th || item.title.en) : item.title.en;

  return (
    <Link
      href={`${prefix}/${routeSegments[item.type]}/${item.slug}/`}
      className="group block w-[82%] shrink-0 snap-start focus-visible:outline-2 focus-visible:outline-offset-4 sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.333rem)]"
      onPointerEnter={(event) => event.pointerType === 'mouse' && requestGalleryPreview()}
      onPointerLeave={() => setIsPreviewActive(false)}
      onFocus={requestGalleryPreview}
      onBlur={() => setIsPreviewActive(false)}
    >
      <div data-related-carousel-image className="relative mb-4 aspect-[3/4] overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={title}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className={`h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${(galleryImage && galleryImageLoaded || videoPreview && videoPreviewLoaded) && isPreviewActive ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : null}
        {videoPreview?.mimeType.startsWith('video/') ? (
          <video
            ref={previewVideoRef}
            src={videoPreview.url}
            muted
            loop
            playsInline
            autoPlay={isPreviewActive}
            preload={isPreviewActive ? 'auto' : 'none'}
            aria-hidden="true"
            tabIndex={-1}
            onLoadedData={() => setVideoPreviewLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${isPreviewActive && videoPreviewLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : videoPreview ? (
          <img
            src={videoPreview.url}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            fetchPriority="low"
            onLoad={() => setVideoPreviewLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${isPreviewActive && videoPreviewLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : galleryImage && (
          <img
            src={galleryImage}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            fetchPriority="low"
            onLoad={() => setGalleryImageLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${isPreviewActive && galleryImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
      {item.type === 'blog' && item.category && <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{item.category}</p>}
      <h3 className="text-lg font-bold leading-tight">{title}</h3>
      {item.date && <p className="mt-1 text-sm text-gray-600">{item.date}</p>}
    </Link>
  );
}

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
}: {
  items: RelatedContentItem[];
  prefix: string;
  language: 'en' | 'th';
  label: string;
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
          <RelatedContentCard
            key={`${item.type}:${item.id}`}
            item={item}
            prefix={prefix}
            site={item.site ?? (prefix === '/bk' ? 'bkkk' : 'kyaf')}
            language={language}
          />
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
            <h2 id={`related-${currentId}-${group.key}`} className="mb-5 text-xl md:text-2xl font-bold">
              {groupLabels[group.key][language]}
            </h2>
            <RelatedContentCarousel
              items={group.items}
              prefix={prefix}
              language={language}
              label={groupLabels[group.key][language]}
            />
          </section>
        ))}
      </div>
    </section>
  );
}
