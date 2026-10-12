const DEFAULT_STAGING_WP_URL = 'https://q42026.content.khaoyaiart.org';
const configuredWpUrl = process.env.WP_BASE_URL ?? process.env.NEXT_PUBLIC_WP_BASE_URL ?? DEFAULT_STAGING_WP_URL;
const configuredSiteUrl = process.env.SITE_URL?.replace(/\/$/, '');
const isStagingSite = configuredSiteUrl
  ? configuredSiteUrl.includes('dev.khaoyaiart.org')
  : configuredWpUrl.includes('q42026.content.khaoyaiart.org');

export const WP_BASE_URL = configuredWpUrl.replace(/\/$/, '');
export const SITE_URL = configuredSiteUrl ?? (isStagingSite ? 'https://dev.khaoyaiart.org' : 'https://khaoyaiart.org');
export const BKKK_BASE_URL = (process.env.BKKK_BASE_URL ?? `${SITE_URL}/bk`).replace(/\/$/, '');
export const KYAF_BASE_URL = (process.env.KYAF_BASE_URL ?? `${SITE_URL}/kyaf`).replace(/\/$/, '');
