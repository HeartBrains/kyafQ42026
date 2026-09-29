'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const PAGE_TO_PATH: Record<string, string> = {
  home: '/kyaf',
  khaoyai: '/kyaf',
  about: '/kyaf/about',
  vision: '/kyaf/about/vision',
  history: '/kyaf/about/history',
  founder: '/kyaf/team',
  team: '/kyaf/team',
  support: '/kyaf/support',
  visit: '/kyaf/visit',
  news: '/kyaf/news',
  activities: '/kyaf/activities',
  'activity-detail': '/kyaf/activities/:slug',
  blog: '/kyaf/blog',
  'blog-detail': '/kyaf/blog/:slug',
  exhibitions: '/kyaf/exhibitions',
  'exhibition-detail': '/kyaf/exhibitions/:slug',
  archives: '/kyaf/archives',
  residency: '/kyaf/residency',
  'artist-detail': '/kyaf/artists/:slug',
  shop: '/kyaf/shop',
  press: '/kyaf/press',
  contact: '/kyaf/contact',
  'hidden-assets': '/kyaf/hidden-assets',
};

function pageToPath(page: string, slug?: string): string {
  const template = PAGE_TO_PATH[page] || `/kyaf/${page}`;
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
