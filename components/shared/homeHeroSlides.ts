import { getTranslation } from '@/utils/translations';
import { BKKK_DEFAULT_COVERS, KYAF_DEFAULT_COVERS } from '@/lib/defaultCovers';
import type { CoverConfigMap } from '@/lib/wp-api';

export interface HomeHeroSlide {
  image: string;
  label: string;
  href: string;
}

export function getHomeHeroSlides(language: 'en' | 'th', covers: CoverConfigMap = {}) {
  return {
    kyaf: [
      {
        image: covers.visit || KYAF_DEFAULT_COVERS.visit!,
        label: getTranslation(language, 'nav.visit'),
        href: '/kyaf/visit/',
      },
      {
        image: covers.exhibitions || KYAF_DEFAULT_COVERS.exhibitions!,
        label: getTranslation(language, 'nav.artworks'),
        href: '/kyaf/exhibitions/',
      },
      {
        image: covers.activities || KYAF_DEFAULT_COVERS.activities!,
        label: getTranslation(language, 'nav.activities'),
        href: '/kyaf/activities/',
      },
      {
        image: covers.about || KYAF_DEFAULT_COVERS.about!,
        label: getTranslation(language, 'nav.aboutUs'),
        href: '/kyaf/about/',
      },
      {
        image: covers.team || KYAF_DEFAULT_COVERS.team!,
        label: getTranslation(language, 'nav.team'),
        href: '/kyaf/team/',
      },
      {
        image: covers.contact || KYAF_DEFAULT_COVERS.contact!,
        label: getTranslation(language, 'nav.contact'),
        href: '/kyaf/contact/',
      },
    ] satisfies HomeHeroSlide[],
    bkkk: [
      {
        image: covers.visit || BKKK_DEFAULT_COVERS.visit!,
        label: getTranslation(language, 'nav.visit'),
        href: '/bk/visit/',
      },
      {
        image: covers.exhibitions || BKKK_DEFAULT_COVERS.exhibitions!,
        label: getTranslation(language, 'nav.exhibitions'),
        href: '/bk/exhibitions/',
      },
      {
        image: covers.movingImage || BKKK_DEFAULT_COVERS.movingImage!,
        label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหว' : 'Moving Image Program',
        href: '/bk/moving-image/',
      },
      {
        image: covers.activities || BKKK_DEFAULT_COVERS.activities!,
        label: getTranslation(language, 'nav.activities'),
        href: '/bk/activities/',
      },
      {
        image: covers.residency || BKKK_DEFAULT_COVERS.residency!,
        label: getTranslation(language, 'nav.residency'),
        href: '/bk/residency/',
      },
      {
        image: covers.about || BKKK_DEFAULT_COVERS.about!,
        label: getTranslation(language, 'nav.aboutUs'),
        href: '/bk/about/',
      },
      {
        image: covers.team || BKKK_DEFAULT_COVERS.team!,
        label: getTranslation(language, 'nav.team'),
        href: '/bk/team/',
      },
      {
        image: covers.contact || BKKK_DEFAULT_COVERS.contact!,
        label: getTranslation(language, 'nav.contact'),
        href: '/bk/contact/',
      },
    ] satisfies HomeHeroSlide[],
  };
}
