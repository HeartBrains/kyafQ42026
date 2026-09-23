import { MOCK_POSTS } from './mockData';
import { WPPost } from './types';

import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';

const API_BASE_URL = `${PUBLIC_WP_ORIGIN}/wp-json/wp/v2`;
// For JetEngine CPTs, the endpoint might be different, e.g., /wp/v2/activities or /jet-cct/slug
// We'll assume standard WP REST API endpoints for Custom Post Types
// See /utils/mock-api.json for the expected JSON structure

export async function fetchPostBySlug(slug: string, type: 'activity' | 'exhibition' | 'post'): Promise<WPPost | null> {
  console.log(`Fetching ${type} with slug: ${slug}`);

  // 1. ATTEMPT REAL FETCH (Uncomment and configure when API is ready)
  /*
  try {
    const endpoint = type === 'post' ? 'posts' : type === 'activity' ? 'activities' : 'exhibitions';
    const response = await fetch(`${API_BASE_URL}/${endpoint}?slug=${slug}&_embed`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return mapWordPressResponseToWPPost(data[0], type);
    }
  } catch (error) {
    console.error("Failed to fetch from API:", error);
  }
  */

  // 2. FALLBACK TO MOCK DATA (Simulate network delay)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Look up in MOCK_POSTS
      const post = MOCK_POSTS[slug];
      // Optionally verify type matches, though slug collision should be rare
      if (post && post.type === type) {
          resolve(post);
      } else if (post) {
          // Fallback if type mismatch but slug matches (e.g. relaxed checking)
          console.warn(`Type mismatch for slug ${slug}: expected ${type}, got ${post.type}`);
          resolve(post);
      } else {
          resolve(null);
      }
    }, 500); // 500ms delay
  });
}

// Helper to map raw WP REST API response to our internal WPPost type
function mapWordPressResponseToWPPost(raw: any, type: string): WPPost {
  return {
    id: raw.id.toString(),
    slug: raw.slug,
    type: type as any,
    title: raw.title.rendered,
    content: raw.content.rendered,
    date: new Date(raw.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    featuredImage: raw._embedded?.['wp:featuredmedia']?.[0]?.source_url ? {
      sourceUrl: raw._embedded['wp:featuredmedia'][0].source_url,
      altText: raw._embedded['wp:featuredmedia'][0].alt_text || raw.title.rendered
    } : undefined,
    // JetEngine/ACF fields usually appear in 'acf' or specific meta keys
    acf: raw.acf || raw.meta_data || {}, 
    gallery: raw.acf?.gallery || [], // Example mapping
    categories: raw._embedded?.['wp:term']?.[0]?.map((term: any) => term.name) || []
  };
}

export function getAllPostSlugs(type: 'activity' | 'exhibition' | 'post'): string[] {
  return Object.values(MOCK_POSTS)
    .filter(p => p.type === type)
    .map(p => p.slug);
}
