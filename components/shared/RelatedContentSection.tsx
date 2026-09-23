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
  site?: 'kyaf' | 'bkkk';
}

interface RelatedContentSectionProps {
  items?: RelatedContentItem[];
  currentId: string;
  site: 'kyaf' | 'bkkk';
  language: 'en' | 'th';
}

export function RelatedContentSection({ items, currentId, site, language }: RelatedContentSectionProps) {
  const seen = new Set<string>();
  const visible = (items ?? [])
    .filter((item) => item.id !== currentId && (!item.site || item.site === site))
    .filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);

  if (visible.length === 0) return null;

  const prefix = site === 'bkkk' ? '/bk' : '/kyaf';
  return (
    <section className="mt-20 border-t border-black/20 pt-6" aria-labelledby={`related-${currentId}`}>
      <h2 id={`related-${currentId}`} className="mb-8 text-lg font-bold">
        {language === 'th' ? 'เนื้อหาที่เกี่ยวข้อง' : 'Related Content'}
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <Link key={`${item.type}:${item.id}`} href={`${prefix}/${item.type === 'residency' ? 'artists' : item.type}/${item.slug}/`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4">
            {item.image && (
              <div className="mb-4 aspect-[4/3] overflow-hidden bg-gray-100">
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]" />
              </div>
            )}
            {item.category && <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{item.category}</p>}
            <h3 className="text-lg font-bold leading-tight">{language === 'th' ? (item.title.th || item.title.en) : item.title.en}</h3>
            {item.date && <p className="mt-1 text-sm text-gray-600">{item.date}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
