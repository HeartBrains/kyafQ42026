import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1.0,
      lastModified: new Date(),
    },
  ];
}
