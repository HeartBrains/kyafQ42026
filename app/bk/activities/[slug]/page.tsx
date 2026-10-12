import type { Metadata } from 'next';
import { fetchCPT, fetchCPTBySlug } from '@/lib/wp-api';
import { mapActivity } from '@/lib/wp-mappers';
import { BKKK_BASE_URL, bkkkMetadata } from '@/lib/seo';
import { JsonLd, exhibitionJsonLd, breadcrumbJsonLd } from '@/lib/JsonLd';
import { ActivityDetailClientPage } from '@/components/bkkk/ActivityDetailClientPage';
function str(v: string | { en: string; th: string } | undefined | null): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v.en ?? '';
}

export const dynamicParams = false;

const FALLBACK_SLUGS = ['concrete-ghosts','tagteams-2026','club-pluto','concrete-ghosts-white-building','concrete-ghosts-becoming-human'];

export async function generateStaticParams() {
  const posts = await fetchCPT('activities', 'bkkk');
  if (posts.length > 0) return posts.map(p => ({ slug: p.slug }));
  return FALLBACK_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchCPTBySlug('activities', slug);
  const data = post ? mapActivity(post) : null;
  return bkkkMetadata(
    str(data?.title) ?? slug,
    str(data?.content)?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
    { path: `/bk/activities/${slug}`, image: data?.featuredImage, type: 'article' },
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchCPTBySlug('activities', slug);
  const data = post ? mapActivity(post) : null;
  const BASE = BKKK_BASE_URL;

  return (
    <>
      {data && (
        <>
          <JsonLd data={exhibitionJsonLd({
            name: str(data.title),
            description: str(data.content)?.replace(/<[^>]+>/g, '').slice(0, 300),
            image: data.featuredImage,
            url: `${BASE}/activities/${slug}`,
            location: { name: 'Bangkok Kunsthalle', address: 'Bangkok, Thailand' },
            organizer: { name: 'Bangkok Kunsthalle', url: BASE },
          })} />
          <JsonLd data={breadcrumbJsonLd([
            { name: 'Bangkok Kunsthalle', url: BASE },
            { name: 'Activities', url: `${BASE}/activities` },
            { name: str(data.title), url: `${BASE}/activities/${slug}` },
          ])} />
        </>
      )}
      <ActivityDetailClientPage site="bkkk" slug={slug} />
    </>
  );
}
