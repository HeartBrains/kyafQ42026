const WP_ORIGIN = (process.env.WP_BASE_URL ?? 'https://q42026.content.khaoyaiart.org').replace(/\/$/, '');
const WP_BASE = WP_ORIGIN.endsWith('/wp-json/wp/v2')
  ? WP_ORIGIN
  : `${WP_ORIGIN}/wp-json/wp/v2`;

// Maps the keys used in useWPData calls to the actual WP REST API base paths
const REST_BASE: Record<string, string> = {
  // Plural aliases used in useWPData → actual WP REST base
  exhibitions:       'exhibition',
  activities:        'activity',
  'moving-images':   'moving_image',
  'residency-artists': 'residency_artist',
  'team-members':    'team-members',
  'blog-posts':      'blog_post',
  'blog_post':       'blog_post',
  'press-items':     'press-items',
  posts:             'posts',
  pages:             'pages',
};

function restBase(cpt: string): string {
  return REST_BASE[cpt] ?? cpt;
}

export type WPSite = 'bkkk' | 'kyaf';

export interface WPRawPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string } | null;
  date: string;
  modified: string;
  meta: Record<string, string | string[]>;
  featured_media?: number;
  // Custom taxonomies are returned as term IDs even when `_embed=wp:term`
  // is unavailable to the public REST context.
  activity_tag?: number[];
  // Resolved at fetch time — safe flat strings, no nested WP objects
  resolvedFeaturedImage?: string;
  resolvedGallery?: string[];
  _embedded?: {
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
  };
}

async function resolveActivityTerms(ids: number[]) {
  const unique = [...new Set(ids.filter((id) => id > 0))];
  if (unique.length === 0) return new Map<number, { id: number; name: string; slug: string; taxonomy: string }>();
  try {
    const url = `${WP_BASE}/activity_tag?include=${unique.join(',')}&per_page=100&_fields=id,name,slug,taxonomy`;
    const res = await fetchWithRetry(url);
    if (!res) return new Map();
    const terms: Array<{ id: number; name: string; slug: string; taxonomy: string }> = await res.json();
    return new Map(terms.map((term) => [term.id, term]));
  } catch {
    return new Map();
  }
}

// Batch-fetch media URLs for a set of IDs in one request
async function batchResolveMedia(ids: number[]): Promise<Map<number, string>> {
  const unique = [...new Set(ids.filter(id => id > 0))];
  if (unique.length === 0) return new Map();
  try {
    const url = `${WP_BASE}/media?include=${unique.join(',')}&per_page=100&_fields=id,source_url&_=${Date.now()}`;
    const res = await fetchWithRetry(url);
    if (!res) return new Map();
    const data: Array<{ id: number; source_url: string }> = await res.json();
    return new Map(data.map(m => [m.id, m.source_url]));
  } catch {
    return new Map();
  }
}

// Fetch a single URL with up to `retries` attempts, waiting `delayMs` between each
const WP_AUTH_USER = process.env.WP_AUTH_USER ?? '';
const WP_AUTH_PASS = process.env.WP_AUTH_PASS ?? '';
const WP_AUTH_HEADER: Record<string, string> = WP_AUTH_USER && WP_AUTH_PASS
  ? { Authorization: 'Basic ' + Buffer.from(`${WP_AUTH_USER}:${WP_AUTH_PASS}`).toString('base64') }
  : {};

async function fetchWithRetry(url: string, retries = 3, delayMs = 2000): Promise<Response | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, { cache: 'no-store', headers: WP_AUTH_HEADER });
    if (res.ok) return res;
    console.error(`[wp-api] HTTP ${res.status} on attempt ${attempt}/${retries}: ${url}`);
    if (attempt < retries) await new Promise(r => setTimeout(r, delayMs));
  }
  return null;
}

// Fetch all pages of a CPT, filter by site, and resolve media IDs to URLs
export async function fetchCPT(cpt: string, site: WPSite): Promise<WPRawPost[]> {
  try {
    const allPosts: WPRawPost[] = [];
    let page = 1;
    while (true) {
      const url = `${WP_BASE}/${restBase(cpt)}?per_page=100&page=${page}&_embed=wp:term&_fields=id,slug,title,content,date,modified,meta,featured_media,activity_tag,_embedded&_=${Date.now()}`;
      const res = await fetchWithRetry(url);
      if (!res) break;
      const data: WPRawPost[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      allPosts.push(...data);
      const total = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
      if (page >= total) break;
      page++;
    }

    // Filter by site meta — posts with no site field are shared
    const filtered = allPosts.filter(p => !p.meta?.site || p.meta.site === site);

    const activityTagIds = filtered.flatMap((post) => post.activity_tag ?? []);
    const activityTerms = await resolveActivityTerms(activityTagIds);

    // Collect all media IDs that need resolving
    const mediaIds: number[] = [];
    for (const post of filtered) {
      if (post.featured_media && post.featured_media > 0) {
        mediaIds.push(post.featured_media);
      }
      // featured_image_url may be an attachment ID from JetEngine image upload field
      const fiu = post.meta?.featured_image_url;
      if (typeof fiu === 'number' && fiu > 0) mediaIds.push(fiu);
      if (typeof fiu === 'string' && /^\d+$/.test(fiu)) mediaIds.push(Number(fiu));
      const galleryIds = post.meta?.gallery_media;
      if (Array.isArray(galleryIds)) {
        galleryIds.forEach(id => { const n = Number(id); if (n > 0) mediaIds.push(n); });
      }
    }

    // Batch-resolve all IDs in one request
    const mediaMap = await batchResolveMedia(mediaIds);

    // Attach resolved URLs to each post
    return filtered.map(post => {
      // Resolve featured_media (WP native) or featured_image_url if it's an ID
      const fiu = post.meta?.featured_image_url;
      const fiuId = typeof fiu === 'number' ? fiu : (typeof fiu === 'string' && /^\d+$/.test(fiu) ? Number(fiu) : 0);
      const featuredUrl = post.featured_media && post.featured_media > 0
        ? (mediaMap.get(post.featured_media) ?? '')
        : fiuId > 0 ? (mediaMap.get(fiuId) ?? '') : '';

      const galleryIds = post.meta?.gallery_media;
      const galleryUrls = Array.isArray(galleryIds)
        ? galleryIds.map(id => mediaMap.get(Number(id)) ?? '').filter(Boolean)
        : [];

      const taxonomyTerms = (post.activity_tag ?? [])
        .map((id) => activityTerms.get(Number(id)))
        .filter((term): term is { id: number; name: string; slug: string; taxonomy: string } => Boolean(term));
      return {
        ...post,
        _embedded: taxonomyTerms.length
          ? { ...post._embedded, 'wp:term': [taxonomyTerms] }
          : post._embedded,
        resolvedFeaturedImage: featuredUrl,
        resolvedGallery: galleryUrls,
      };
    });
  } catch {
    return [];
  }
}

// Resolve comma-separated WP attachment IDs to source URLs (client-side use)
export async function resolveMediaIds(ids: string): Promise<string[]> {
  const list = ids.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) return [];
  const results = await Promise.all(
    list.map(async id => {
      try {
        const res = await fetch(`${WP_BASE}/media/${id}?_fields=source_url`);
        if (!res.ok) return null;
        const data = await res.json();
        return (data.source_url as string) || null;
      } catch { return null; }
    })
  );
  return results.filter((u): u is string => u !== null);
}

// ─── Menu config ─────────────────────────────────────────────────────────────

export type MenuConfigMap = Partial<Record<string, boolean>>;
export type CoverConfigMap = Partial<Record<string, string>>;

export type SectionVisibility = {
  upcoming: boolean;
  current: boolean;
  past: boolean;
};
export type HomeAnchorsVisibility = {
  currentExhibitions: boolean;
  upcomingExhibitions?: boolean;
  currentMovingImage?: boolean;
  currentActivities: boolean;
};
export type SectionsConfigMap = Partial<Record<string, SectionVisibility>> & {
  homeAnchors?: HomeAnchorsVisibility;
};

export interface MenuConfig {
  bkkk: MenuConfigMap;
  kyaf: MenuConfigMap;
  bkkkCovers: CoverConfigMap;
  kyafCovers: CoverConfigMap;
  bkkkCss: string;
  kyafCss: string;
  bkkkSections: SectionsConfigMap;
  kyafSections: SectionsConfigMap;
}

const MENU_CONFIG_URL = `${WP_BASE.replace('/wp-json/wp/v2', '')}/wp-json/bkkk/v1/menu-config`;

export async function fetchMenuConfig(): Promise<MenuConfig | null> {
  try {
    const res = await fetch(MENU_CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json() as MenuConfig;
  } catch {
    return null;
  }
}

export async function fetchCPTBySlug(cpt: string, slug: string): Promise<WPRawPost | null> {
  try {
    const url = `${WP_BASE}/${restBase(cpt)}?slug=${slug}&_embed=wp:term&_fields=id,slug,title,content,date,modified,meta,featured_media,activity_tag,_embedded&_=${Date.now()}`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    const data: WPRawPost[] = await res.json();
    const post = data[0] ?? null;
    if (!post) return null;

    const activityTerms = await resolveActivityTerms(post.activity_tag ?? []);

    // Resolve featured_media and gallery_media IDs to URLs
    const mediaIds: number[] = [];
    if (post.featured_media && post.featured_media > 0) mediaIds.push(post.featured_media);
    const gm = post.meta?.gallery_media;
    if (Array.isArray(gm)) gm.forEach(id => { const n = Number(id); if (n > 0) mediaIds.push(n); });

    const mediaMap = await batchResolveMedia(mediaIds);

    const featuredUrl = post.featured_media && post.featured_media > 0
      ? (mediaMap.get(post.featured_media) ?? '') : '';
    const galleryUrls = Array.isArray(gm)
      ? gm.map(id => mediaMap.get(Number(id)) ?? '').filter(Boolean) : [];

    const taxonomyTerms = (post.activity_tag ?? [])
      .map((id) => activityTerms.get(Number(id)))
      .filter((term): term is { id: number; name: string; slug: string; taxonomy: string } => Boolean(term));
    return {
      ...post,
      _embedded: taxonomyTerms.length
        ? { ...post._embedded, 'wp:term': [taxonomyTerms] }
        : post._embedded,
      resolvedFeaturedImage: featuredUrl,
      resolvedGallery: galleryUrls,
    };
  } catch {
    return null;
  }
}
