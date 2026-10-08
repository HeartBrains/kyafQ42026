import { getTranslation } from '@/utils/translations';
import type { CoverConfigMap } from '@/lib/wp-api';
import { BKKK_VISIT_HERO_IMAGE, VISIT_HERO_IMAGE } from '@/utils/imageConstants';

export interface HomeHeroSlide {
  image: string;
  label: string;
  href: string;
}

export function getHomeHeroSlides(language: 'en' | 'th', covers: CoverConfigMap = {}) {
  return {
    kyaf: [
      {
        image: covers.visit || VISIT_HERO_IMAGE,
        label: getTranslation(language, 'nav.visit'),
        href: '/kyaf/visit/',
      },
      {
        image: covers.exhibitions || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_kyaf-bg-exhibitions__Fog+Forest-+Andrea+Rossetti+5.jpg',
        label: getTranslation(language, 'nav.artworks'),
        href: '/kyaf/exhibitions/',
      },
      {
        image: covers.activities || 'https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-4.+Activities-Forest+Table--Activity+-+People-+Puttisin+5-d03dca9e-1920w.jpg',
        label: getTranslation(language, 'nav.activities'),
        href: '/kyaf/activities/',
      },
      {
        image: covers.about || 'https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-6.+About+Us--Madrid+Circle-+Krittawat+and+Puttisin+1-1920w.jpg',
        label: getTranslation(language, 'nav.aboutUs'),
        href: '/kyaf/about/',
      },
      {
        image: covers.team || 'https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-7.+Team--Activity+-+People-+Nawaphon-+Film+41-1920w.jpg',
        label: getTranslation(language, 'nav.team'),
        href: '/kyaf/team/',
      },
      {
        image: covers.contact || 'https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-11.+Contact+Us--Activity+-+People-+Puttisin+16-1920w.jpg',
        label: getTranslation(language, 'nav.contact'),
        href: '/kyaf/contact/',
      },
    ] satisfies HomeHeroSlide[],
    bkkk: [
      {
        image: covers.visit || BKKK_VISIT_HERO_IMAGE,
        label: getTranslation(language, 'nav.visit'),
        href: '/bk/visit/',
      },
      {
        image: covers.exhibitions || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-Exhibitions-list-83b680a4.jpg',
        label: getTranslation(language, 'nav.exhibitions'),
        href: '/bk/exhibitions/',
      },
      {
        image: covers.movingImage || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Images+for+Website-Bangkok+Kunsthalle+Images+for+Website-4.+Moving+Image+Program-4.1+Infringes--Infringes+-Andrea+Rossetti+1+COVER.jpg',
        label: language === 'th' ? 'โปรแกรมภาพเคลื่อนไหว' : 'Moving Image Program',
        href: '/bk/moving-image/',
      },
      {
        image: covers.activities || 'https://content.khaoyaiart.org/wp-content/uploads/2026/03/bk_Listening-Session-of-Rushup-Edge-10.jpg',
        label: getTranslation(language, 'nav.activities'),
        href: '/bk/activities/',
      },
      {
        image: covers.residency || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/1000012646.jpg',
        label: getTranslation(language, 'nav.residency'),
        href: '/bk/residency/',
      },
      {
        image: covers.about || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-history-34e22018.jpg',
        label: getTranslation(language, 'nav.aboutUs'),
        href: '/bk/about/',
      },
      {
        image: covers.team || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-team-f51a7633.jpg',
        label: getTranslation(language, 'nav.team'),
        href: '/bk/team/',
      },
      {
        image: covers.contact || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-contact-1-89b6eddb.jpg',
        label: getTranslation(language, 'nav.contact'),
        href: '/bk/contact/',
      },
    ] satisfies HomeHeroSlide[],
  };
}
