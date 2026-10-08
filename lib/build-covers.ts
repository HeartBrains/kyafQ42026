import { fetchMenuConfig, type CoverConfigMap } from './wp-api';
import { BKKK_DEFAULT_COVERS, KYAF_DEFAULT_COVERS } from './defaultCovers';

export { BKKK_DEFAULT_COVERS, KYAF_DEFAULT_COVERS } from './defaultCovers';

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
