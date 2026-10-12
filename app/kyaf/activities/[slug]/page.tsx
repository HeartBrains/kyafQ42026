import type { Metadata } from 'next';
import { fetchCPT, fetchCPTBySlug } from '@/lib/wp-api';
import { mapActivity } from '@/lib/wp-mappers';
import { KYAF_BASE_URL, kyafMetadata } from '@/lib/seo';
import { JsonLd, exhibitionJsonLd, breadcrumbJsonLd } from '@/lib/JsonLd';
import { ActivityDetailClientPage } from '@/components/kyaf/ActivityDetailClientPage';
function str(v: string | { en: string; th: string } | undefined | null): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v.en ?? '';
}

export const dynamicParams = false;

const FALLBACK_SLUGS = ['forest-table','bamboo-journey','forest-table-dinner','bamboo-journey-lunch','forest-print','k-bar-experience'];

export async function generateStaticParams() {
  const posts = await fetchCPT('activities', 'kyaf');
  if (posts.length > 0) return posts.map(p => ({ slug: p.slug }));
  return FALLBACK_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchCPTBySlug('activities', slug);
  const data = post ? mapActivity(post) : null;
  return kyafMetadata(
    str(data?.title) ?? slug,
    str(data?.content)?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
    { path: `/kyaf/activities/${slug}`, image: data?.featuredImage, type: 'article' },
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchCPTBySlug('activities', slug);
  const data = post ? mapActivity(post) : null;
  const BASE = KYAF_BASE_URL;

  return (
    <>
      {data && (
        <>
          <JsonLd data={exhibitionJsonLd({
            name: str(data.title),
            description: str(data.content)?.replace(/<[^>]+>/g, '').slice(0, 300),
            image: data.featuredImage,
            url: `${BASE}/activities/${slug}`,
            location: { name: 'Khao Yai Art Forest', address: 'Khao Yai, Thailand' },
            organizer: { name: 'Khao Yai Art Forest', url: BASE },
          })} />
          <JsonLd data={breadcrumbJsonLd([
            { name: 'Khao Yai Art Forest', url: BASE },
            { name: 'Activities', url: `${BASE}/activities` },
            { name: str(data.title), url: `${BASE}/activities/${slug}` },
          ])} />
        </>
      )}
      <ActivityDetailClientPage site="kyaf" slug={slug} />
    </>
  );
}
