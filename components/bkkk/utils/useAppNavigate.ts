'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const PAGE_TO_PATH: Record<string, string> = {
  home: '/bk',
  khaoyai: '/kyaf',
  about: '/bk/about',
  vision: '/bk/about/vision',
  history: '/bk/about/history',
  founder: '/bk/team',
  team: '/bk/team',
  support: '/bk/support',
  visit: '/bk/visit',
  news: '/bk/news',
  activities: '/bk/activities',
  'activity-detail': '/bk/activities/:slug',
  blog: '/bk/blog',
  'blog-detail': '/bk/blog/:slug',
  exhibitions: '/bk/exhibitions',
  'exhibition-detail': '/bk/exhibitions/:slug',
  archives: '/bk/archives',
  residency: '/bk/residency',
  'artist-detail': '/bk/artists/:slug',
  'moving-image': '/bk/moving-image',
  'moving-image-detail': '/bk/moving-image/:slug',
  shop: '/bk/shop',
  press: '/bk/press',
  contact: '/bk/contact',
  'hidden-assets': '/bk/hidden-assets',
};

function pageToPath(page: string, slug?: string): string {
  const template = PAGE_TO_PATH[page] || `/bk/${page}`;
  if (slug && template.includes(':slug')) {
    return template.replace(':slug', slug);
  }
  return template;
}

export function useAppNavigate() {
  const router = useRouter();
  return useCallback(
    (page: string, slug?: string, sectionId?: string) => {
      const path = page.startsWith('/') ? page : pageToPath(page, slug);
      router.push(path);
      if (!sectionId) window.scrollTo(0, 0);
    },
    [router]
  );
}
