'use client';

import { useEffect, useState } from 'react';
import { ExhibitionDetailClientPage as KyafExhibitionDetail } from '@/components/kyaf/ExhibitionDetailClientPage';
import { ActivityDetailClientPage as KyafActivityDetail } from '@/components/kyaf/ActivityDetailClientPage';
import { ArtistDetailClientPage as KyafArtistDetail } from '@/components/kyaf/ArtistDetailClientPage';
import { BlogDetailClientPage as KyafBlogDetail } from '@/components/kyaf/BlogDetailClientPage';
import { ExhibitionDetailClientPage as BkkkExhibitionDetail } from '@/components/bkkk/ExhibitionDetailClientPage';
import { ActivityDetailClientPage as BkkkActivityDetail } from '@/components/bkkk/ActivityDetailClientPage';
import { ArtistDetailClientPage as BkkkArtistDetail } from '@/components/bkkk/ArtistDetailClientPage';
import { BlogDetailClientPage as BkkkBlogDetail } from '@/components/bkkk/BlogDetailClientPage';
import { MovingImageDetailClientPage as BkkkMovingImageDetail } from '@/components/bkkk/MovingImageDetailClientPage';
import { BkkkShell } from '@/components/bkkk/layout/BkkkShell';
import { KyafShell } from '@/components/kyaf/layout/KyafShell';
import { GtagConversionEvent } from '@/components/GtagConversionEvent';
import type { CoverConfigMap } from '@/lib/wp-api';

type RouteMatch = {
  site: 'kyaf' | 'bkkk';
  cpt: string;
  slug: string;
} | null;

interface NotFoundClientProps {
  bkkkCovers: CoverConfigMap;
  bkkkCss: string;
  kyafCovers: CoverConfigMap;
  kyafCss: string;
}

function matchRoute(pathname: string): RouteMatch {
  const path = pathname.replace(/\/$/, '');
  const parts = path.split('/').filter(Boolean);
  if (parts.length !== 3) return null;

  const [site, cpt, slug] = parts;
  if (site !== 'kyaf' && site !== 'bkkk' && site !== 'bk') return null;
  const resolvedSite = site === 'bk' ? 'bkkk' : site as 'kyaf' | 'bkkk';
  const knownCpts = ['exhibitions', 'activities', 'moving-image', 'artists', 'blog'];
  if (!knownCpts.includes(cpt)) return null;

  return { site: resolvedSite, cpt, slug };
}

function DetailShell({
  site,
  cpt,
  slug,
  bkkkCovers,
  bkkkCss,
  kyafCovers,
  kyafCss,
}: {
  site: 'kyaf' | 'bkkk';
  cpt: string;
  slug: string;
  bkkkCovers: CoverConfigMap;
  bkkkCss: string;
  kyafCovers: CoverConfigMap;
  kyafCss: string;
}) {
  let detail: React.ReactNode = null;

  if (site === 'kyaf') {
    if (cpt === 'exhibitions') detail = <KyafExhibitionDetail slug={slug} site={site} />;
    if (cpt === 'activities') detail = <KyafActivityDetail slug={slug} site={site} />;
    if (cpt === 'artists') detail = <KyafArtistDetail slug={slug} site={site} />;
    if (cpt === 'blog') detail = <KyafBlogDetail slug={slug} site={site} />;
  } else {
    if (cpt === 'exhibitions') detail = <BkkkExhibitionDetail slug={slug} site={site} />;
    if (cpt === 'activities') detail = <BkkkActivityDetail slug={slug} site={site} />;
    if (cpt === 'moving-image') detail = <BkkkMovingImageDetail slug={slug} site={site} />;
    if (cpt === 'artists') detail = <BkkkArtistDetail slug={slug} site={site} />;
    if (cpt === 'blog') detail = <BkkkBlogDetail slug={slug} site={site} />;
  }

  if (!detail) return <NotFoundMessage />;

  // The root not-found route does not inherit /bk or /kyaf layouts. Recreate
  // the matching site shell for detail routes handled by the smart fallback.
  return site === 'kyaf' ? (
    <KyafShell initialCovers={kyafCovers} initialCss={kyafCss}>
      <GtagConversionEvent />
      {detail}
    </KyafShell>
  ) : (
    <BkkkShell initialCovers={bkkkCovers} initialCss={bkkkCss}>
      <GtagConversionEvent />
      {detail}
    </BkkkShell>
  );
}

function NotFoundMessage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-center px-6">
      <p className="text-6xl font-light mb-4">404</p>
      <p className="text-lg text-gray-500">Page not found</p>
    </div>
  );
}

export default function NotFoundClient(props: NotFoundClientProps) {
  const [route, setRoute] = useState<RouteMatch | 'loading'>('loading');

  useEffect(() => {
    setRoute(matchRoute(window.location.pathname));
  }, []);

  if (route === 'loading') return null;
  if (!route) return <NotFoundMessage />;

  return <DetailShell {...route} {...props} />;
}
