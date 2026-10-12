import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.SITE_URL ?? 'https://dev.khaoyaiart.org').replace(/\/$/, '');
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
