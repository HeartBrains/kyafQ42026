'use client';

import { useCallback, useEffect, useState } from 'react';

export const ACTIVITY_TAGS = [
  { slug: 'all', en: 'All', th: 'ดูทั้งหมด' },
  { slug: 'talks-lectures', en: 'Talks & Lectures', th: 'เสวนา' },
  { slug: 'performances', en: 'Performances', th: 'การแสดงสด' },
  { slug: 'screening', en: 'Screening', th: 'การฉายภาพยนตร์' },
  { slug: 'workshops', en: 'Workshops', th: 'เวิร์กชอป' },
  { slug: 'gastronomy', en: 'Gastronomy', th: 'อาหาร' },
  { slug: 'sound', en: 'Sound', th: 'งานเสียง' },
] as const;

export type ActivityTagSlug = (typeof ACTIVITY_TAGS)[number]['slug'];

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
  onChange: (tag: ActivityTagSlug) => void;
}

function tagFromLocation(): ActivityTagSlug {
  if (typeof window === 'undefined') return 'all';
  const requested = new URLSearchParams(window.location.search).get('tag') ?? 'all';
  return validTags.has(requested) ? requested as ActivityTagSlug : 'all';
}

export function ActivityTagFilter({ language, onChange }: ActivityTagFilterProps) {
  const [selected, setSelected] = useState<ActivityTagSlug>('all');

  const applyLocation = useCallback(() => {
    const next = tagFromLocation();
    setSelected(next);
    onChange(next);
  }, [onChange]);

  useEffect(() => {
    applyLocation();
    window.addEventListener('popstate', applyLocation);
    return () => window.removeEventListener('popstate', applyLocation);
  }, [applyLocation]);

  const select = (tag: ActivityTagSlug) => {
    const url = new URL(window.location.href);
    if (tag === 'all') url.searchParams.delete('tag');
    else url.searchParams.set('tag', tag);
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setSelected(tag);
    onChange(tag);
  };

  return (
    <div className="activity-tag-filter" role="group" aria-label={language === 'th' ? 'กรองกิจกรรมตามหมวดหมู่' : 'Filter activities by category'}>
      {ACTIVITY_TAGS.map((tag) => {
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
  );
}
