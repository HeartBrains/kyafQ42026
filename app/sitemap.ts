import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE_URL = (process.env.SITE_URL ?? 'https://dev.khaoyaiart.org').replace(/\/$/, '');

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
