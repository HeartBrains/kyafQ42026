import type { Metadata } from 'next';

const BKKK_BASE_URL = (process.env.BKKK_BASE_URL ?? 'https://dev.khaoyaiart.org/bk').replace(/\/$/, '');
const KYAF_BASE_URL = (process.env.KYAF_BASE_URL ?? 'https://dev.khaoyaiart.org/kyaf').replace(/\/$/, '');

export const BKKK_DEFAULT_OG_IMAGE = `${BKKK_BASE_URL}/og-bkkk.jpg`;
export const KYAF_DEFAULT_OG_IMAGE = `${KYAF_BASE_URL}/og-kyaf.jpg`;

const BKKK_KEYWORDS = ['Bangkok Kunsthalle', 'contemporary art', 'Bangkok', 'Thailand', 'art gallery', 'exhibitions'];
const KYAF_KEYWORDS = ['Khao Yai Art Forest', 'contemporary art', 'Khao Yai', 'Thailand', 'art forest', 'exhibitions'];

interface SEOOpts {
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

export function bkkkMetadata(title: string, description: string, opts: SEOOpts = {}): Metadata {
  const url = opts.path ? `${BKKK_BASE_URL}${opts.path}` : BKKK_BASE_URL;
  const image = opts.image || BKKK_DEFAULT_OG_IMAGE;
  const fullTitle = `${title} | Bangkok Kunsthalle`;
  const keywords = [...BKKK_KEYWORDS, ...(opts.keywords ?? [])];
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Bangkok Kunsthalle',
      locale: 'en_US',
      type: opts.type ?? 'website',
      images: [{ url: image, width: 1200, height: 630, alt: opts.imageAlt ?? title }],
      ...(opts.type === 'article' && { publishedTime: opts.publishedTime, modifiedTime: opts.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [{ url: image, alt: opts.imageAlt ?? title }],
    },
  };
}

export function kyafMetadata(title: string, description: string, opts: SEOOpts = {}): Metadata {
  const url = opts.path ? `${KYAF_BASE_URL}${opts.path}` : KYAF_BASE_URL;
  const image = opts.image || KYAF_DEFAULT_OG_IMAGE;
  const fullTitle = `${title} | Khao Yai Art Forest`;
  const keywords = [...KYAF_KEYWORDS, ...(opts.keywords ?? [])];
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Khao Yai Art Forest',
      locale: 'en_US',
      type: opts.type ?? 'website',
      images: [{ url: image, width: 1200, height: 630, alt: opts.imageAlt ?? title }],
      ...(opts.type === 'article' && { publishedTime: opts.publishedTime, modifiedTime: opts.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [{ url: image, alt: opts.imageAlt ?? title }],
    },
  };
}
