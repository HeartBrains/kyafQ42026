export const PUBLIC_WP_ORIGIN = (
  process.env.NEXT_PUBLIC_WP_BASE_URL ?? 'https://q42026.content.khaoyaiart.org'
).replace(/\/wp-json\/wp\/v2\/?$/, '').replace(/\/$/, '');
