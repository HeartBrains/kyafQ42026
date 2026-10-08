import { fetchMenuConfig, type CoverConfigMap } from './wp-api';
import {
  ABOUT_HERO_IMAGE,
  VISIT_HERO_IMAGE,
  TEAM_HERO_IMAGE,
  EXHIBITIONS_HERO_IMAGE,
  ACTIVITY_HERO_IMAGE,
  IMG_FOG_SRC,
  CONTACT_HERO_IMAGE,
} from '@/utils/imageConstants';

const BKKK_TEAM_HERO = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&auto=format&fit=crop';
const BKKK_ABOUT_HERO = 'https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-history-34e22018.jpg';

export const BKKK_DEFAULT_COVERS: CoverConfigMap = {
  exhibitions: EXHIBITIONS_HERO_IMAGE,
  activities:  ACTIVITY_HERO_IMAGE,
  movingImage: IMG_FOG_SRC,
  residency:   IMG_FOG_SRC,
  blog:        IMG_FOG_SRC,
  press:       IMG_FOG_SRC,
  team:        BKKK_TEAM_HERO,
  about:       BKKK_ABOUT_HERO,
  visit:       VISIT_HERO_IMAGE,
  contact:     CONTACT_HERO_IMAGE,
  archives:    IMG_FOG_SRC,
};

export const KYAF_DEFAULT_COVERS: CoverConfigMap = {
  exhibitions: EXHIBITIONS_HERO_IMAGE,
  activities:  ACTIVITY_HERO_IMAGE,
  movingImage: IMG_FOG_SRC,
  residency:   IMG_FOG_SRC,
  blog:        IMG_FOG_SRC,
  press:       IMG_FOG_SRC,
  team:        TEAM_HERO_IMAGE,
  about:       ABOUT_HERO_IMAGE,
  visit:       VISIT_HERO_IMAGE,
  contact:     CONTACT_HERO_IMAGE,
  archives:    IMG_FOG_SRC,
};

interface BuildData {
  bkkk: CoverConfigMap;
  kyaf: CoverConfigMap;
  bkkkCss: string;
  kyafCss: string;
}

let _cache: BuildData | null = null;

export async function getBuildCovers(): Promise<BuildData> {
  if (_cache) return _cache;

  try {
    const config = await fetchMenuConfig();
    if (config) {
      const bkkk: CoverConfigMap = { ...BKKK_DEFAULT_COVERS };
      const kyaf: CoverConfigMap = { ...KYAF_DEFAULT_COVERS };
      for (const [k, v] of Object.entries(config.bkkkCovers ?? {})) {
        if (v) bkkk[k] = v;
      }
      for (const [k, v] of Object.entries(config.kyafCovers ?? {})) {
        if (v) kyaf[k] = v;
      }
      _cache = { bkkk, kyaf, bkkkCss: config.bkkkCss ?? '', kyafCss: config.kyafCss ?? '' };
    } else {
      _cache = { bkkk: BKKK_DEFAULT_COVERS, kyaf: KYAF_DEFAULT_COVERS, bkkkCss: '', kyafCss: '' };
    }
  } catch {
    _cache = { bkkk: BKKK_DEFAULT_COVERS, kyaf: KYAF_DEFAULT_COVERS, bkkkCss: '', kyafCss: '' };
  }

  return _cache;
}
