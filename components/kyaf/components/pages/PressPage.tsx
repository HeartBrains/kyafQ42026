'use client';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { ASSETS } from '@/utils/assets';
import { useLanguage } from '@/utils/languageContext';
import { getTranslation } from '@/utils/translations';
import { useKyafPressItems } from '@/lib/useWPData';
import { PRESS_ITEMS } from '@/utils/pressDataBilingual';

export function PressPage() {
  const { language } = useLanguage();
  const { data: wpItems, loading } = useKyafPressItems();

  const items = wpItems && wpItems.length > 0
    ? wpItems.map(item => ({
        id: item.id,
        date: item.date.en,
        dateTH: item.date.th,
        title: item.title.en,
        titleTH: item.title.th,
        link: item.link,
        type: item.type,
      }))
    : PRESS_ITEMS;

  return (
    <div className="w-full bg-white min-h-screen pb-12">
      {/* Hero Section */}
      <ParallaxHero 
        image={ASSETS.BUILDING} 
        height="h-[60vh] min-h-[60vh] max-h-[60vh] md:h-[80vh] md:min-h-[80vh] md:max-h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </ParallaxHero>

      <div className="w-full px-[6vw] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row mb-32 md:mb-40">
          {/* Left Column - Sticky Heading */}
          <div className="w-full md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold sticky top-32">{getTranslation(language, 'press.title')}</h1>
          </div>

          {/* Right Column - Content */}
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : items.map((item) => (
              <Reveal key={item.id}>
                <div className="border-b border-gray-200 pb-8">
                  <p className={`text-lg md:text-xl font-normal text-gray-500 mb-2 ${language === 'th' ? 'font-sans leading-[1.82em]' : ''}`}>
                    {language === 'th' ? item.dateTH : item.date}
                  </p>
                  <h2 className={`text-lg md:text-xl font-bold text-black mb-4 ${language === 'th' ? 'font-sans leading-[1.82em]' : ''}`}>
                    {language === 'th' ? item.titleTH : item.title}
                  </h2>
                  {item.link && item.link !== '#' ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-lg md:text-xl font-normal text-black underline underline-offset-4 hover:text-gray-600 transition-colors ${language === 'th' ? 'font-sans leading-[1.82em]' : ''}`}
                    >
                      {getTranslation(language, item.type === 'pdf' ? 'press.downloadPDF' : 'press.readArticle')}
                    </a>
                  ) : (
                    <span className={`text-lg md:text-xl font-normal text-gray-400 ${language === 'th' ? 'font-sans leading-[1.82em]' : ''}`}>
                      {getTranslation(language, item.type === 'pdf' ? 'press.downloadPDF' : 'press.readArticle')}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
