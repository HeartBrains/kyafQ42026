'use client';

import Link from 'next/link';

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

type RelatedGroupKey = Exclude<RelatedContentItem['type'], 'blog'> | 'blogs-archives';

export function RelatedContentSection({ items, currentId, currentType, site, language }: RelatedContentSectionProps) {
  const routeSegments: Record<RelatedContentItem['type'], string> = {
    exhibitions: 'exhibitions',
    activities: 'activities',
    residency: 'artists',
    blog: 'blog',
    'moving-image': 'moving-image',
  };
  const seen = new Set<string>();
  const visible = (items ?? [])
    .filter((item) => item.id !== currentId && item.type !== currentType && item.site === site && Boolean(routeSegments[item.type]))
    .filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (visible.length === 0) return null;

  const archiveTypes = new Set<RelatedContentItem['type']>(['exhibitions', 'activities', 'moving-image']);
  const groupFor = (item: RelatedContentItem): RelatedGroupKey =>
    item.type === 'blog' || (archiveTypes.has(item.type) && item.status === 'past') ? 'blogs-archives' : item.type;
  const groupOrder: RelatedGroupKey[] = ['exhibitions', 'activities', 'moving-image', 'residency', 'blogs-archives'];
  const groupLabels: Record<RelatedGroupKey, { en: string; th: string }> = {
    exhibitions: { en: 'Exhibitions', th: 'นิทรรศการ' },
    activities: { en: 'Activities', th: 'กิจกรรม' },
    'moving-image': { en: 'Moving Image', th: 'ภาพเคลื่อนไหว' },
    residency: { en: 'Artists / Residency', th: 'ศิลปิน / พำนัก' },
    'blogs-archives': { en: 'Blogs & Archives', th: 'บล็อกและคลังข้อมูล' },
  };
  const groups = groupOrder
    .map((key) => ({ key, items: visible.filter((item) => groupFor(item) === key) }))
    .filter((group) => group.items.length > 0);

  const prefix = site === 'bkkk' ? '/bk' : '/kyaf';
  return (
    <section className="mt-20 border-t border-black/20 pt-6" aria-labelledby={`related-${currentId}`}>
      <h2 id={`related-${currentId}`} className="mb-8 text-lg font-bold">
        {language === 'th' ? 'เนื้อหาที่เกี่ยวข้อง' : 'Related Content'}
      </h2>
      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`related-${currentId}-${group.key}`}>
            <h3 id={`related-${currentId}-${group.key}`} className="mb-5 text-base font-bold">
              {groupLabels[group.key][language]}
            </h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link key={`${item.type}:${item.id}`} href={`${prefix}/${routeSegments[item.type]}/${item.slug}/`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4">
                  <div className="mb-4 aspect-[3/4] overflow-hidden bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={language === 'th' ? (item.title.th || item.title.en) : item.title.en} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]" />
                    ) : (
                      <div className="h-full w-full" aria-hidden="true" />
                    )}
                  </div>
                  {group.key === 'blogs-archives' && item.category && <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{item.category}</p>}
                  <h4 className="text-lg font-bold leading-tight">{language === 'th' ? (item.title.th || item.title.en) : item.title.en}</h4>
                  {item.date && <p className="mt-1 text-sm text-gray-600">{item.date}</p>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
