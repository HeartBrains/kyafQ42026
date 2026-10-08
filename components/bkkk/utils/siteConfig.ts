/**
 * BKKK Site Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Toggle menu items and anchor sections here.
 * true  = visible / enabled
 * false = hidden / disabled
 */

export const siteConfig = {

  // ── Main navigation menu items ──────────────────────────────────────────────
  // Controls which items appear in the hamburger menu
  menu: {
    home:            true,
    visit:           true,
    exhibitions:     true,
    movingImage:     true,
    activities:      true,
    residency:       true,
    blog:            false,   // ← set true to show Blog in menu
    about:           true,
    team:            true,
    shop:            false,   // ← set true to show Shop in menu
    archives:        false,   // ← set true to show Archives in menu
    contact:         true,
    search:          true,
    languageSwitcher: false,  // ← set true to show EN/TH switcher
  },

  // ── Home page anchor sections (left-column sticky nav) ──────────────────────
  // Controls which sections appear as anchors on the home page
  homeAnchors: {
    currentExhibitions:       true,
    upcomingExhibitions:      true,
    currentMovingImageProgram: true,
    currentActivities:        false,  // ← set true to show Activities anchor
  },

  // ── Section / submenu visibility ────────────────────────────────────────────
  // Controls submenu items and listing page sections
  visibility: {
    exhibitions: {
      upcoming: true,
      current:  true,
      past:     true,
    },
    movingImage: {
      upcoming: true,
      current:  true,
      past:     true,
    },
    activities: {
      upcoming:      true,
      current:       true,
      past:          true,
      publicProgram: true,
      screenings:    true,
    },
    residency: {
      upcoming: false,
      current:  true,
      past:     true,
    },
    shop: {
      bookings: true,
      products: true,
    },
    archives: {
      pastExhibitions: true,
      pastActivities:  true,
    },
  },

  // ── Empty state messages ─────────────────────────────────────────────────────
  emptyStates: {
    comingSoon:             { th: 'เร็วๆ นี้',                              en: 'Coming soon' },
    noCurrentExhibitions:   { th: 'เร็วๆ นี้',                              en: 'Coming soon' },
    noUpcomingExhibitions:  { th: 'เร็วๆ นี้',                              en: 'Coming soon' },
    noPastExhibitions:      { th: 'เร็วๆ นี้',                              en: 'Coming soon' },
    noCurrentActivities:    { th: 'Coming soon',                              en: 'Coming soon' },
    noCurrentMovingImage:   { th: 'ไม่มีโปรแกรมภาพเคลื่อนไหวในขณะนี้',     en: 'No current moving image program' },
    noUpcomingMovingImage:  { th: 'ไม่มีโปรแกรมภาพเคลื่อนไหวที่กำลังจะมาถึง', en: 'No upcoming moving image program' },
    noPastMovingImage:      { th: 'ไม่มีโปรแกรมภาพเคลื่อนไหวที่ผ่านมา',    en: 'No past moving image program' },
    noCurrentResidency:     { th: 'ไม่มีโปรแกรมพำนักในขณะนี้',              en: 'No current residency program' },
  },

  // ── External links ───────────────────────────────────────────────────────────
  links: {
    booking:  'https://www.tickettailor.com/events/bangkokkunsthalle',
    location: 'https://maps.app.goo.gl/88XLQBeDFaC1wvuQA',
  },

};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getEmptyStateMessage(
  key: keyof typeof siteConfig.emptyStates,
  language: 'en' | 'th'
): string {
  return siteConfig.emptyStates[key][language];
}

export function isMenuVisible(key: keyof typeof siteConfig.menu): boolean {
  return siteConfig.menu[key];
}

export function isSectionVisible(
  category: keyof typeof siteConfig.visibility,
  section: string
): boolean {
  return (siteConfig.visibility[category] as Record<string, boolean>)?.[section] ?? false;
}

export function isHomeSectionVisible(
  section: keyof typeof siteConfig.homeAnchors
): boolean {
  return siteConfig.homeAnchors[section];
}
