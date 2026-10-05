'use client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  EXHIBITIONS_HERO_IMAGE, 
  IMG_MADRID_SRC, 
  IMG_FOG_SRC, 
  IMG_MUSIC_SRC, 
  IMG_KBAR_SRC, 
  IMG_ARAYA_SRC, 
  IMG_GOD_SRC 
} from '@/utils/imageConstants';

const SECTIONS = [
  {
    title: "Exhibitions",
    items: [
      {
        id: 1,
        image: IMG_MADRID_SRC,
        title: "Madrid Circle",
        date: "Permanent"
      },
      {
        id: 2,
        image: IMG_FOG_SRC,
        title: "Khao Yai Fog Forest",
        date: "Permanent"
      }
    ]
  },
  {
    title: "Activities",
    items: [
      {
        id: 3,
        image: IMG_MUSIC_SRC,
        title: "Music on the Move",
        date: "July 19, 2025"
      },
      {
        id: 4,
        image: IMG_KBAR_SRC,
        title: "K-BAR Experience",
        date: "Every second Saturday"
      }
    ]
  },
  {
    title: "Blog",
    items: [
      {
        id: 5,
        image: IMG_ARAYA_SRC,
        title: "Two Planets Series",
        date: "Permanent"
      },
      {
        id: 6,
        image: IMG_GOD_SRC,
        title: "GOD",
        date: "Permanent"
      }
    ]
  }
];

export function Home() {
  return (
    <div className="w-full bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] md:min-h-[80vh] md:max-h-[80vh]">
        <ImageWithFallback
          src={EXHIBITIONS_HERO_IMAGE}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-6 py-12 space-y-16">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-bold mb-6 tracking-wide">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {section.items.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-100">
                     <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 leading-tight max-w-[80%]">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 mt-1">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
