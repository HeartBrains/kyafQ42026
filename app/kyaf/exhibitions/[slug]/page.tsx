import { exhibitions } from '@/components/kyaf/utils/exhibitionsDataNew';
import type { Metadata } from 'next';
import { fetchCPT, fetchCPTBySlug } from '@/lib/wp-api';
import { mapKyafExhibition } from '@/lib/wp-mappers';
import { KYAF_BASE_URL, kyafMetadata } from '@/lib/seo';
import { JsonLd, exhibitionJsonLd, breadcrumbJsonLd } from '@/lib/JsonLd';
import { ExhibitionDetailClientPage } from '@/components/kyaf/ExhibitionDetailClientPage';


function str(v: string | { en: string; th: string } | undefined | null): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v.en ?? '';
}

export const dynamicParams = false;

const FALLBACK_SLUGS = ['maman','pilgrimage-to-eternity','k-bar','pulsus-vitae','two-planets-series','god','khao-yai-fog-forrest','madrid-circle'];

export async function generateStaticParams() {
  const posts = await fetchCPT('exhibitions', 'kyaf');
  if (posts.length > 0) return posts.map(p => ({ slug: p.slug }));
  return FALLBACK_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchCPTBySlug('exhibitions', slug);
  const data = post ? mapKyafExhibition(post) : null;
  return kyafMetadata(
    str(data?.title) ?? slug,
    str(data?.content)?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
    { path: `/kyaf/exhibitions/${slug}`, image: data?.featuredImage, type: 'article' },
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchCPTBySlug('exhibitions', slug);
  const data = post ? mapKyafExhibition(post) : null;
  const BASE = KYAF_BASE_URL;

  return (
    <>
      {data && (
        <>
          <JsonLd data={exhibitionJsonLd({
            name: str(data.title),
            description: str(data.content)?.replace(/<[^>]+>/g, '').slice(0, 300),
            image: data.featuredImage,
            startDate: data.fromDate,
            endDate: data.toDate,
            url: `${BASE}/exhibitions/${slug}`,
            location: { name: 'Khao Yai Art Forest', address: 'Khao Yai, Thailand' },
            organizer: { name: 'Khao Yai Art Forest', url: BASE },
          })} />
          <JsonLd data={breadcrumbJsonLd([
            { name: 'Khao Yai Art Forest', url: BASE },
            { name: 'Exhibitions', url: `${BASE}/exhibitions` },
            { name: str(data.title), url: `${BASE}/exhibitions/${slug}` },
          ])} />
        </>
      )}
      <ExhibitionDetailClientPage site="kyaf" slug={slug} />
    </>
  );
}
