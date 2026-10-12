import type { Metadata } from 'next';
import { fetchCPT, fetchCPTBySlug } from '@/lib/wp-api';
import { exhibitions } from '@/components/bkkk/utils/exhibitionsDataNew';
import { mapBkkkExhibition } from '@/lib/wp-mappers';
import { BKKK_BASE_URL, bkkkMetadata } from '@/lib/seo';
import { JsonLd, exhibitionJsonLd, breadcrumbJsonLd } from '@/lib/JsonLd';
import { ExhibitionDetailClientPage } from '@/components/bkkk/ExhibitionDetailClientPage';


function str(v: string | { en: string; th: string } | undefined | null): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v.en ?? '';
}

export const dynamicParams = false;

const FALLBACK_SLUGS = ['dial-a-poem-thailand','a-bit-fountain-and-a-bit-not','splendor-in-the-city','soul-searching','blind-spots-panels-paravents-and-screens','forever-love-soul-engine','description-without-place','vernacular-objects','mitta-del-santi','this-page-is-intentionally-left-blank','poetics-of-horizontality','painting-as-event','calligraphic-abstraction','like-nouns-slipping-into-verbs','mend-piece','nostalgia-for-unity','nine-plus-five-works','inviting-you-to-die-with-me','seeds','we-gather','shapeshifting-spaces','search-for-life-i','infringes','upcoming-program-2026','weaving-matter-and-memory'];

export async function generateStaticParams() {
  const posts = await fetchCPT('exhibitions', 'bkkk');
  if (posts.length > 0) return posts.map(p => ({ slug: p.slug }));
  return FALLBACK_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchCPTBySlug('exhibitions', slug);
  const data = post ? mapBkkkExhibition(post) : null;
  return bkkkMetadata(
    str(data?.title) ?? slug,
    str(data?.content)?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
    { path: `/bk/exhibitions/${slug}`, image: data?.featuredImage, type: 'article' },
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchCPTBySlug('exhibitions', slug);
  const data = post ? mapBkkkExhibition(post) : null;
  const BASE = BKKK_BASE_URL;

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
            location: { name: 'Bangkok Kunsthalle', address: 'Bangkok, Thailand' },
            organizer: { name: 'Bangkok Kunsthalle', url: BASE },
          })} />
          <JsonLd data={breadcrumbJsonLd([
            { name: 'Bangkok Kunsthalle', url: BASE },
            { name: 'Exhibitions', url: `${BASE}/exhibitions` },
            { name: str(data.title), url: `${BASE}/exhibitions/${slug}` },
          ])} />
        </>
      )}
      <ExhibitionDetailClientPage site="bkkk" slug={slug} />
    </>
  );
}
