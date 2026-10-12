import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export const dynamic = 'force-static';

const INDEXING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: INDEXING_ENABLED ? '/' : undefined,
      disallow: INDEXING_ENABLED ? undefined : '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
