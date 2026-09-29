import { exhibitions } from './exhibitionsDataNew';
import { movingImagePrograms } from './movingImageData';
import { movingImageGalleries } from './movingImageGalleryData';

export type RecordCategory = 'exhibition' | 'activity' | 'event' | 'moving-image';
export type RecordStatus = 'current' | 'upcoming' | 'past';

export interface RecordItem {
  id: string;
  title: string;
  category: RecordCategory;
  status: RecordStatus;
  date: string; // Display date string
  startDate?: string; // ISO date for sorting if needed
  endDate?: string;
  image: string;
  gallery?: string[];
  description?: string; // Short description/artist name
  location?: string;
  slug?: string;
}

// Generate records from exhibitions data
const today = new Date(2026, 2, 10); // March 10, 2026 (reference date)

function getExhibitionStatus(fromDate: string, toDate: string, explicitStatus: RecordStatus): RecordStatus {
  // Priority 1: Use explicit status if provided
  if (explicitStatus) {
    return explicitStatus;
  }

  // Priority 2: Calculate from dates
  const startDate = new Date(fromDate);
  // Handle "Onwards" as ongoing exhibitions (no end date)
  const endDate = toDate === 'Onwards' 
    ? new Date(9999, 11, 31) 
    : new Date(toDate);

  if (today < startDate) {
    return 'upcoming';
  } else if (today > endDate) {
    return 'past';
  } else {
    return 'current';
  }
}

function getMovingImageStatus(fromDate: string, toDate: string, explicitStatus: RecordStatus): RecordStatus {
  // Priority 1: Use explicit status if provided
  if (explicitStatus) {
    return explicitStatus;
  }

  // Priority 2: Calculate from dates
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);

  if (today < startDate) {
    return 'upcoming';
  } else if (today > endDate) {
    return 'past';
  } else {
    return 'current';
  }
}

// Convert exhibitions to records (English version for base RECORDS array)
const exhibitionRecords: RecordItem[] = exhibitions.map(exhibition => {
  const status = getExhibitionStatus(exhibition.fromDate, exhibition.toDate, (exhibition.status as RecordStatus) ?? "past");
  
  return {
    id: `exh-${exhibition.id}`,
    title: exhibition.title?.en ?? '',
    category: 'exhibition',
    status,
    date: exhibition.dateDisplay?.en ?? '',
    startDate: exhibition.fromDate,
    endDate: exhibition.toDate,
    image: exhibition.featuredImage || (exhibition.gallery && exhibition.gallery.length > 0 ? exhibition.gallery[0] : ''),
    gallery: exhibition.gallery ?? [],
    description: exhibition.artist?.en ?? '',
    slug: exhibition.slug
  };
});

export const RECORDS: RecordItem[] = [...exhibitionRecords];

// Mock API function with bilingual support
export async function fetchRecords(params?: { 
  category?: RecordCategory | 'all', 
  status?: RecordStatus | 'all', 
  language?: 'en' | 'th' 
}): Promise<RecordItem[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const language = params?.language || 'en';
  let results: RecordItem[] = [];
  
  // Add exhibition records dynamically based on language
  const exhibitionRecordsLang: RecordItem[] = exhibitions.map(exhibition => {
    const status = getExhibitionStatus(exhibition.fromDate, exhibition.toDate, (exhibition.status as RecordStatus) ?? "past");
    
    return {
      id: `exh-${exhibition.id}`,
      title: exhibition.title[language],
      category: 'exhibition',
      status,
      date: exhibition.dateDisplay[language],
      startDate: exhibition.fromDate,
      endDate: exhibition.toDate,
      image: exhibition.featuredImage || (exhibition.gallery && exhibition.gallery.length > 0 ? exhibition.gallery[0] : ''),
      gallery: exhibition.gallery ?? [],
      description: exhibition.artist[language],
      slug: exhibition.slug
    };
  });
  
  results = [...exhibitionRecordsLang];
  
  // Add moving image programs dynamically
  const movingImageRecords: RecordItem[] = movingImagePrograms.map(program => {
    const status = getMovingImageStatus(program.fromDate, program.toDate, program.status);
    
    // Use featuredImage if available, otherwise fallback to first gallery image
    const gallery = program.gallery || movingImageGalleries[program.slug as keyof typeof movingImageGalleries];
    const featuredImage = program.featuredImage || (gallery && gallery.length > 0 ? gallery[0] : '');
    
    return {
      id: `moving-image-${program.id}`,
      title: program.title[language],
      category: 'moving-image' as RecordCategory,
      status,
      date: program.dateDisplay[language],
      startDate: program.fromDate,
      endDate: program.toDate,
      image: featuredImage,
      gallery: gallery ?? [],
      description: `${language === 'th' ? 'ภัณฑารักษ์: ' : 'Curated by '}${program.curator[language]}`,
      slug: program.slug
    };
  });
  
  results = [...results, ...movingImageRecords];

  if (params?.category && params.category !== 'all') {
    results = results.filter(r => r.category === params.category);
  }

  if (params?.status && params.status !== 'all') {
    results = results.filter(r => r.status === params.status);
  }

  return results;
}
