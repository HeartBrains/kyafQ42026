import { MetadataRoute } from 'next';
import { fetchCPT } from '@/lib/wp-api';
import { KYAF_BASE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

const BASE = KYAF_BASE_URL;

const staticRoutes: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',               priority: 1.0, changeFreq: 'daily' },
  { path: '/exhibitions',   priority: 0.9, changeFreq: 'daily' },
  { path: '/activities',    priority: 0.9, changeFreq: 'daily' },
  { path: '/residency',     priority: 0.8, changeFreq: 'weekly' },
  { path: '/about',         priority: 0.8, changeFreq: 'monthly' },
  { path: '/about/history', priority: 0.6, changeFreq: 'monthly' },
  { path: '/about/vision',  priority: 0.6, changeFreq: 'monthly' },
  { path: '/team',          priority: 0.7, changeFreq: 'monthly' },
  { path: '/visit',         priority: 0.8, changeFreq: 'monthly' },
  { path: '/contact',       priority: 0.7, changeFreq: 'monthly' },
  { path: '/press',         priority: 0.6, changeFreq: 'weekly' },
  { path: '/blog',          priority: 0.7, changeFreq: 'weekly' },
  { path: '/archives',      priority: 0.6, changeFreq: 'monthly' },
  { path: '/support',       priority: 0.5, changeFreq: 'monthly' },
  { path: '/shop',          priority: 0.5, changeFreq: 'weekly' },
  { path: '/news',          priority: 0.6, changeFreq: 'weekly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority, changeFreq }) => ({
    url: `${BASE}${path}`,
    changeFrequency: changeFreq,
    priority,
    lastModified: new Date(),
  }));

  const [exhibitions, activities, residencyArtists, blogPosts] = await Promise.all([
    fetchCPT('exhibitions', 'kyaf').catch(() => []),
    fetchCPT('activities', 'kyaf').catch(() => []),
    fetchCPT('residency-artists', 'kyaf').catch(() => []),
    fetchCPT('blog-posts', 'kyaf').catch(() => []),
  ]);

  for (const p of exhibitions)      entries.push({ url: `${BASE}/exhibitions/${p.slug}`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() });
  for (const p of activities)       entries.push({ url: `${BASE}/activities/${p.slug}`,  changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() });
  for (const p of residencyArtists) entries.push({ url: `${BASE}/artists/${p.slug}`,     changeFrequency: 'monthly', priority: 0.6, lastModified: new Date() });
  for (const p of blogPosts)        entries.push({ url: `${BASE}/blog/${p.slug}`,         changeFrequency: 'monthly', priority: 0.6, lastModified: new Date() });

  return entries;
}
