'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const ACTIVITY_TAGS = [
  { slug: 'all', en: 'All', th: 'ดูทั้งหมด' },
  { slug: 'talks-lectures', en: 'Talks & Lectures', th: 'เสวนา' },
  { slug: 'performances', en: 'Performance', th: 'การแสดงสด' },
  { slug: 'screening', en: 'Screening', th: 'การฉายภาพยนตร์' },
  { slug: 'workshops', en: 'Workshop', th: 'เวิร์กชอป' },
  { slug: 'gastronomy', en: 'Gastronomy', th: 'อาหาร' },
  { slug: 'sound', en: 'Sound', th: 'งานเสียง' },
] as const;

export type ActivityTagSlug = (typeof ACTIVITY_TAGS)[number]['slug'];
export type ActivitySite = 'bkkk' | 'kyaf';

const SITE_ACTIVITY_TAGS: Record<ActivitySite, readonly ActivityTagSlug[]> = {
  kyaf: ['gastronomy', 'performances', 'screening', 'workshops'],
  bkkk: ['performances', 'screening', 'talks-lectures', 'workshops', 'sound'],
};

const validTags = new Set<string>(ACTIVITY_TAGS.map((tag) => tag.slug));

export function normalizeActivityTag(value: string): ActivityTagSlug | null {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const aliases: Record<string, ActivityTagSlug> = {
    all: 'all',
    talk: 'talks-lectures',
    talks: 'talks-lectures',
    lecture: 'talks-lectures',
    lectures: 'talks-lectures',
    'talks-and-lectures': 'talks-lectures',
    'talks-lectures': 'talks-lectures',
    performance: 'performances',
    performances: 'performances',
    screening: 'screening',
    screenings: 'screening',
    workshop: 'workshops',
    workshops: 'workshops',
    gastronomy: 'gastronomy',
    food: 'gastronomy',
    sound: 'sound',
  };

  return aliases[normalized] ?? null;
}

export function activityMatchesTag(
  categories: string[] | undefined,
  selectedTag: ActivityTagSlug,
): boolean {
  if (selectedTag === 'all') return true;
  return (categories ?? []).some((category) => normalizeActivityTag(category) === selectedTag);
}

interface ActivityTagFilterProps {
  language: 'en' | 'th';
  site: ActivitySite;
  onChange?: (tag: ActivityTagSlug) => void;
  variant?: 'pills' | 'sidebar';
  initialSelectedTag?: ActivityTagSlug;
  onNavigateToListing?: (tag: ActivityTagSlug) => void;
}

const sitePrefix = (site: ActivitySite) => site === 'bkkk' ? '/bk' : '/kyaf';
const returnUrlKey = (site: ActivitySite) => `activity-list-return:${site}`;

export function activityListingUrl(
  site: ActivitySite,
  tag: ActivityTagSlug = 'all',
  section?: 'upcoming' | 'current' | 'past',
): string {
  const params = new URLSearchParams();
  if (tag !== 'all') params.set('tag', tag);
  if (section) params.set('section', `${section}-activities`);
  const query = params.toString();
  const sectionHash = section ? `#${section}-activities` : '';
  return `${sitePrefix(site)}/activities${query ? `?${query}` : ''}${sectionHash}`;
}

export function rememberActivityListingUrl(site: ActivitySite, activeSection?: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (activeSection && ['upcoming-activities', 'current-activities', 'past-activities'].includes(activeSection)) {
    url.searchParams.set('section', activeSection);
  }
  window.sessionStorage.setItem(returnUrlKey(site), `${url.pathname}${url.search}${url.hash}`);
}

export function activityListingReturnUrl(site: ActivitySite): string {
  if (typeof window === 'undefined') return `${sitePrefix(site)}/activities`;
  const fallback = `${sitePrefix(site)}/activities`;
  const stored = window.sessionStorage.getItem(returnUrlKey(site));
  if (!stored) return fallback;

  try {
    const parsed = new URL(stored, window.location.origin);
    const expectedPath = `${sitePrefix(site)}/activities`;
    const normalizedPath = parsed.pathname.replace(/\/+$/, '') || '/';
    return parsed.origin === window.location.origin && normalizedPath === expectedPath
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export function rememberedActivityTag(site: ActivitySite): ActivityTagSlug {
  if (typeof window === 'undefined') return 'all';
  const stored = window.sessionStorage.getItem(returnUrlKey(site));
  if (!stored) return 'all';
  try {
    const parsed = new URL(stored, window.location.origin);
    return tagFromSearch(parsed.searchParams, SITE_ACTIVITY_TAGS[site]);
  } catch {
    return 'all';
  }
}

function tagFromSearch(params: URLSearchParams, visibleTags: readonly ActivityTagSlug[], fallback: ActivityTagSlug = 'all'): ActivityTagSlug {
  const requested = params.get('tag');
  return requested && validTags.has(requested) && (requested === 'all' || visibleTags.includes(requested as ActivityTagSlug))
    ? requested as ActivityTagSlug
    : fallback;
}

function tagFromLocation(visibleTags: readonly ActivityTagSlug[], fallback: ActivityTagSlug = 'all'): ActivityTagSlug {
  if (typeof window === 'undefined') return fallback;
  const requested = new URLSearchParams(window.location.search).get('tag');
  if (!requested) return fallback;
  return validTags.has(requested) && (requested === 'all' || visibleTags.includes(requested as ActivityTagSlug))
    ? requested as ActivityTagSlug
    : fallback;
}

export function ActivityTagFilter({
  language,
  site,
  onChange,
  variant = 'pills',
  initialSelectedTag = 'all',
  onNavigateToListing,
}: ActivityTagFilterProps) {
  const [selected, setSelected] = useState<ActivityTagSlug>(initialSelectedTag);
  const [isOpen, setIsOpen] = useState(true);
  const visibleTags = SITE_ACTIVITY_TAGS[site];
  const displayedTags = ACTIVITY_TAGS
    .filter((tag) => tag.slug === 'all' || visibleTags.includes(tag.slug))
    .sort((a, b) => {
      if (a.slug === 'all') return -1;
      if (b.slug === 'all') return 1;
      return visibleTags.indexOf(a.slug) - visibleTags.indexOf(b.slug);
    });

  const applyLocation = useCallback(() => {
    const next = tagFromLocation(visibleTags, initialSelectedTag);
    setSelected(next);
    onChange?.(next);
  }, [initialSelectedTag, onChange, visibleTags]);

  useEffect(() => {
    applyLocation();
    window.addEventListener('popstate', applyLocation);
    return () => window.removeEventListener('popstate', applyLocation);
  }, [applyLocation]);

  const select = (tag: ActivityTagSlug) => {
    setSelected(tag);
    if (onNavigateToListing) {
      onNavigateToListing(tag);
      return;
    }

    const url = new URL(window.location.href);
    if (tag === 'all') url.searchParams.delete('tag');
    else url.searchParams.set('tag', tag);
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    onChange?.(tag);
  };

  return (
    <div className={`activity-tag-filter${variant === 'sidebar' ? ' activity-tag-filter--sidebar' : ''}`} role="group" aria-label={language === 'th' ? 'กรองกิจกรรมตามหมวดหมู่' : 'Filter activities by category'}>
      {variant === 'sidebar' && (
        <button
          type="button"
          className="activity-tag-filter__heading"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{language === 'th' ? 'เรียงตามประเภท' : 'Sort by Tags'}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
      {isOpen && (
        <div className={variant === 'sidebar' ? 'activity-tag-filter__options' : 'contents'}>
          {displayedTags.map((tag) => {
            const active = selected === tag.slug;
            return (
              <button
                type="button"
                key={tag.slug}
                aria-pressed={active}
                className="activity-tag-filter__button"
                onClick={() => select(tag.slug)}
              >
                {language === 'th' ? tag.th : tag.en}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
