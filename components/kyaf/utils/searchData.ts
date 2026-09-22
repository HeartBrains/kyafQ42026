// @ts-nocheck
export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  keywords: string;
  page: string;
  slug?: string;
  lang: 'en' | 'th';
}

const WP_URL = (process.env.NEXT_PUBLIC_WP_BASE_URL ?? 'https://q42026.content.khaoyaiart.org').replace(/\/$/, '');
const WP_BASE = WP_URL.endsWith('/wp-json/wp/v2') ? WP_URL : `${WP_URL}/wp-json/wp/v2`;

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decode(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function fetchCPT(cpt: string): Promise<any[]> {
  try {
    const all: any[] = [];
    let page = 1;
    while (true) {
      const res = await fetch(`${WP_BASE}/${cpt}?per_page=100&page=${page}&_fields=id,slug,title,content,meta`);
      if (!res.ok) break;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data.filter((p: any) => !p.meta?.site || p.meta.site === 'kyaf'));
      const total = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
      if (page >= total) break;
      page++;
    }
    return all;
  } catch {
    return [];
  }
}

function m(post: any, key: string): string {
  return post.meta?.[key] ?? '';
}

export async function getFullSearchData(): Promise<SearchDocument[]> {
  const docs: SearchDocument[] = [];

  const [exhibitions, activities, artists] = await Promise.all([
    fetchCPT('exhibition'),
    fetchCPT('activity'),
    fetchCPT('residency_artist'),
  ]);

  for (const post of exhibitions) {
    const titleEn = decode(post.title?.rendered ?? '');
    const titleTh = decode((m(post, 'title_th') || post.title?.rendered) ?? '');
    const artistEn = m(post, 'artist_en');
    const artistTh = m(post, 'artist_th') || artistEn;
    const contentEn = stripHtml(m(post, 'content_en') || post.content?.rendered || '');
    const contentTh = stripHtml(m(post, 'content_th') || contentEn);
    docs.push({ id: `exhibition-${post.slug}-en`, title: titleEn, content: contentEn, keywords: `exhibition art show ${artistEn} นิทรรศการ`, page: 'exhibition-detail', slug: post.slug, lang: 'en' });
    docs.push({ id: `exhibition-${post.slug}-th`, title: titleTh, content: contentTh, keywords: `นิทรรศการ ศิลปะ ${artistTh} exhibition`, page: 'exhibition-detail', slug: post.slug, lang: 'th' });
  }

  for (const post of activities) {
    const titleEn = decode(post.title?.rendered ?? '');
    const titleTh = decode((m(post, 'title_th') || post.title?.rendered) ?? '');
    const contentEn = stripHtml(m(post, 'content_en') || post.content?.rendered || '');
    const contentTh = stripHtml(m(post, 'content_th') || contentEn);
    docs.push({ id: `activity-${post.slug}-en`, title: titleEn, content: contentEn, keywords: `activity event program workshop กิจกรรม`, page: 'activity-detail', slug: post.slug, lang: 'en' });
    docs.push({ id: `activity-${post.slug}-th`, title: titleTh, content: contentTh, keywords: `กิจกรรม โปรแกรม activity event`, page: 'activity-detail', slug: post.slug, lang: 'th' });
  }

  for (const post of artists) {
    const nameEn = decode(post.title?.rendered ?? '');
    const nameTh = decode((m(post, 'title_th') || post.title?.rendered) ?? '');
    const bioEn = stripHtml(m(post, 'bio_en') || post.content?.rendered || '');
    const bioTh = stripHtml(m(post, 'bio_th') || bioEn);
    docs.push({ id: `artist-${post.slug}-en`, title: nameEn, content: bioEn, keywords: `artist resident residency ศิลปิน`, page: 'artist-detail', slug: post.slug, lang: 'en' });
    docs.push({ id: `artist-${post.slug}-th`, title: nameTh, content: bioTh, keywords: `ศิลปิน ศิลปินพำนัก artist residency`, page: 'artist-detail', slug: post.slug, lang: 'th' });
  }

  const staticPages = [
    { id: 'home',        page: 'home',        en: 'Khao Yai Art Forest — contemporary art in nature',  th: 'เขาใหญ่อาร์ตฟอเรสต์ — ศิลปะร่วมสมัยในธรรมชาติ',      kw: 'art khao yai forest nature ศิลปะ เขาใหญ่' },
    { id: 'about',       page: 'about',       en: 'About Khao Yai Art Forest — mission and history',   th: 'เกี่ยวกับเขาใหญ่อาร์ตฟอเรสต์',                        kw: 'about mission history ประวัติ' },
    { id: 'visit',       page: 'visit',       en: 'Visit — location, hours, directions',               th: 'เยี่ยมชม — ที่ตั้ง เวลาทำการ',                         kw: 'visit location hours map ที่ตั้ง' },
    { id: 'exhibitions', page: 'exhibitions', en: 'Exhibitions — current, upcoming, past',             th: 'นิทรรศการ — ปัจจุบัน กำลังจะมา ที่ผ่านมา',            kw: 'exhibitions gallery นิทรรศการ' },
    { id: 'activities',  page: 'activities',  en: 'Activities — workshops, talks, events',             th: 'กิจกรรม — เวิร์กช็อป บรรยาย',                         kw: 'activities events workshops กิจกรรม' },
    { id: 'residency',   page: 'residency',   en: 'Artist in Residence program',                       th: 'โปรแกรมศิลปินพำนัก',                                   kw: 'residency artist ศิลปินพำนัก' },
    { id: 'team',        page: 'team',        en: 'Team — staff and curators',                         th: 'ทีมงาน',                                               kw: 'team staff curators ทีมงาน' },
    { id: 'support',     page: 'support',     en: 'Support Us — donate and become a patron',           th: 'สนับสนุนเรา — บริจาค',                                 kw: 'support donate patron สนับสนุน บริจาค' },
    { id: 'contact',     page: 'contact',     en: 'Contact — get in touch',                            th: 'ติดต่อ',                                               kw: 'contact email phone ติดต่อ' },
    { id: 'blog',        page: 'blog',        en: 'Blog — stories and updates',                        th: 'บล็อก — เรื่องราวและข่าวสาร',                         kw: 'blog stories news บล็อก' },
  ];

  for (const p of staticPages) {
    docs.push({ id: `${p.id}-en`, title: p.en, content: p.en, keywords: p.kw, page: p.page, lang: 'en' });
    docs.push({ id: `${p.id}-th`, title: p.th, content: p.th, keywords: p.kw, page: p.page, lang: 'th' });
  }

  return docs;
}
