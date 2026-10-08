/**
 * Image Constants
 * Centralized location for all hero images and reusable image URLs
 */

const imgGodAsset = "/assets/333e45022861ad8d6b5f75dd9cb8b429f6dccc77.png";
const imgMusicOnTheMoveAsset = "/assets/3aee81884c982f6a3494a9f241977094c9d2ef0f.png";

// For backwards compatibility, export as string paths as well
export const IMG_GOD_ASSET = "figma:asset/333e45022861ad8d6b5f75dd9cb8b429f6dccc77.png";
export const IMG_MUSIC_ON_THE_MOVE_ASSET = "figma:asset/3aee81884c982f6a3494a9f241977094c9d2ef0f.png";

// Export imported modules for direct use
export { imgGodAsset, imgMusicOnTheMoveAsset };

// Hero Images for Pages
export const ABOUT_HERO_IMAGE = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-6.+About+Us--Madrid+Circle-+Krittawat+and+Puttisin+1-1920w.jpg";
export const CONTACT_HERO_IMAGE = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-11.+Contact+Us--Activity+-+People-+Puttisin+16-1920w.jpg";
export const CONTACT_HERO_IMAGE_2 = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-11.+Contact+Us--Activity+-+People-+Chittawan+Limcharoen+35-1920w.jpg";
export const BKKK_VISIT_HERO_IMAGE = "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_cover-for-about.jpg";
export const VISIT_HERO_IMAGE = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-2.+Visit--Activity+-+People-+Rungkit+-+Pongsakorn+3-1920w.jpg";
export const TEAM_HERO_IMAGE = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-7.+Team--Activity+-+People-+Nawaphon-+Film+41-1920w.jpg";
export const EXHIBITIONS_HERO_IMAGE = "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_kyaf-bg-exhibitions__Fog+Forest-+Andrea+Rossetti+5.jpg";
export const ACTIVITY_HERO_IMAGE = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-4.+Activities-Forest+Table--Activity+-+People-+Puttisin+5-d03dca9e-1920w.jpg";

// Home Page Hero Slider Images (All 6 images from CSV - Reversed Order)
export const HOME_HERO_IMAGES = [
  "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-6.+About+Us--Madrid+Circle-+Krittawat+and+Puttisin+1-1920w.jpg",
  "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-4.+Activities-Forest+Table--Activity+-+People-+Puttisin+5-d03dca9e-1920w.jpg",
  "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-11.+Contact+Us--Activity+-+People-+Puttisin+16-1920w.jpg",
  "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-2.+Visit--Activity+-+People-+Rungkit+-+Pongsakorn+3-1920w.jpg",
  "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-7.+Team--Activity+-+People-+Nawaphon-+Film+41-1920w.jpg",
  "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Puma_Khao+Yai+Art+Forest+Images+for+Website-11.+Contact+Us--Activity+-+People-+Chittawan+Limcharoen+35-1920w.jpg"
];

// Individual Exhibition/Activity Images
export const IMG_MADRID_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Z4XpjJbqstJ99aFF_Forest-Circle-II-01-1920w.jpg";
export const IMG_FOG_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/aGywKEMqNJQqHqM-_KYAF_03-1920w.jpg";
export const IMG_ARAYA_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Z44gkpbqstJ99oLq_Araya_1.2copy-1--1920w.jpg";
export const IMG_MAMAN_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Z44UMpbqstJ99oDB_03Maman_PhotobyAndreaRossetti-1920w.jpg";
export const IMG_KBAR_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Z44YyZbqstJ99oE8_03K-Bar_PhotobyAndreaRossetti-1920w.jpg";
export const IMG_ARABICA_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Z44iuJbqstJ99oM__CopyofDSC001792.885100-1--1920w.jpg";
export const IMG_PULSUS_SRC = "https://lirp.cdn-website.com/5516674f/dms3rep/multi/opt/Z39x8ZbqstJ99M5I_Walking-In-Nature-1920w.jpeg";
export const IMG_GOD_SRC = IMG_GOD_ASSET;
export const IMG_MUSIC_SRC = IMG_MUSIC_ON_THE_MOVE_ASSET;

/**
 * Image Gallery - Organized by Category and Tags
 * Source: /imports/kyaf-v3-images-list.csv
 */
export interface GalleryImage {
  url: string;
  category: string;
  tags: string;
}

export const IMAGE_GALLERY: GalleryImage[] = [
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.7+Madrid+Circle--Madrid+Circle-+Andrea+Rossetti+2.jpg",
    category: "Exhibitions",
    tags: "3.7 Madrid Circle"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.2+Two+Planets+Series--Two+Planets+Series-+Andrea+Rossetti+2-3dd84dc5.jpg",
    category: "Exhibitions",
    tags: "3.2 Two Planets Series"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.1+Maman--Maman-+Krittawat+and+Puttisin+1%281%29-e747e931.jpg",
    category: "Exhibitions",
    tags: "3.1 Maman"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.5+GOD--God-+Krittawat+Atthsis+and+Puttisin+Choojesroom+3-3f75a7fb.jpg",
    category: "Exhibitions",
    tags: "3.5 GOD"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.6+Pilgrimage+to+Eternity--Pilgrimage+to+Eternity-+Krittawat+-+Puttisin+25-55f3c7c1.jpg",
    category: "Exhibitions",
    tags: "3.6 Pilgrimage to Eternity"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.4+K-BAR--K-BAR-+Krittawat+and+Puttisin+15-a159cc93.jpg",
    category: "Exhibitions",
    tags: "3.4 K-BAR"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.8+Pulsus+Vitae--Pulsus+Vitae-+Ratsiree+Rattanawan+3-e99b8676.jpg",
    category: "Exhibitions",
    tags: "3.8 Pulsus Vitae"
  },
  {
    url: "https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_Khao+Yai+Art+Forest+Images+for+Website-3.+Exhibitions-3.3+Khao+Yai+Fog+Forest--Fog+Forest-+Nut+Fotofixed+8-fa797dad.jpg",
    category: "Exhibitions",
    tags: "3.3 Khao Yai Fog Forest"
  }
];

/**
 * Helper function to get images by category
 */
export function getImagesByCategory(category: string): GalleryImage[] {
  return IMAGE_GALLERY.filter(img => img.category === category);
}

/**
 * Helper function to get images by tag
 */
export function getImagesByTag(tag: string): GalleryImage[] {
  return IMAGE_GALLERY.filter(img => img.tags.includes(tag));
}

/**
 * Helper function to get all exhibition images
 */
export function getExhibitionImages(): GalleryImage[] {
  return getImagesByCategory("Exhibitions");
}
