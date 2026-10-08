/**
 * Site Configuration
 * Centralized feature toggles and settings for Khao Yai Art Forest website
 */

export const siteConfig = {
  // Site metadata
  site: {
    name: 'Khao Yai Art Forest',
    nameEn: 'Khao Yai Art Forest',
    nameTh: 'Khao Yai Art Forest',
  },

  // Menu visibility
  menu: {
    home: true,
    exhibitions: true,
    activities: true,
    blog: false,
    press: false,
    team: true,
    archives: false,
    residency: true,
    visit: true,
    shop: false,
    about: true,
    contact: true,
    support: true,
    search: true,
    languageSwitcher: false,
  },

  // Section visibility (affects submenus AND listing pages)
  visibility: {
    exhibitions: {
      current: true,
      upcoming: false,
      past: true,
    },
    activities: {
      current: true,
      upcoming: true,
      past: false, // Hidden until content is ready
    },
    residency: {
      current: true,
      upcoming: true,
      past: true,
    },
    blog: {
      recent: true,
      archive: true,
    },
    shop: {
      booking: true,
      products: true,
    },
  },

  // Home page anchor sections visibility
  homeSections: {
    currentExhibitions: true,
    currentActivities: false,
  },

  // Editable messages
  emptyStates: {
    comingSoon: {
      th: 'เร็วๆ นี้',
      en: 'Coming Soon'
    },
    noContent: {
      th: 'ยังไม่มีเนื้อหา',
      en: 'No content available'
    },
    noResults: {
      th: 'ไม่พบผลลัพธ์',
      en: 'No results found'
    },
  },

  // External links
  links: {
    booking: 'https://www.tickettailor.com/events/khaoyaiart',
    bangkokKunsthalle: 'https://maps.app.goo.gl/88XLQBeDFaC1wvuQA',
    location: 'https://maps.app.goo.gl/du5SEK5sPfnQfydp8',
  },

  // Feature flags
  features: {
    search: true,
    backToTop: true,
    heroSlider: true,
    parallaxEffects: false,
  },
};

/**
 * Helper function to get empty state message
 */
export function getEmptyStateMessage(
  key: keyof typeof siteConfig.emptyStates,
  language: 'en' | 'th'
): string {
  return siteConfig.emptyStates[key][language];
}

/**
 * Helper function to check if a menu item should be visible
 */
export function isMenuVisible(menuKey: keyof typeof siteConfig.menu): boolean {
  return siteConfig.menu[menuKey];
}

/**
 * Helper function to check if a section should be visible
 */
export function isSectionVisible(
  category: keyof typeof siteConfig.visibility,
  section: string
): boolean {
  const categoryConfig = siteConfig.visibility[category];
  if (!categoryConfig) return false;
  return (categoryConfig as any)[section] ?? false;
}

/**
 * Helper function to check if a home section should be visible
 */
export function isHomeSectionVisible(
  section: keyof typeof siteConfig.homeSections
): boolean {
  return siteConfig.homeSections[section];
}
