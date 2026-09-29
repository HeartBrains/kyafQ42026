'use client';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useLanguage } from '@/utils/languageContext';
import { getTranslation } from '@/utils/translations';
import { useBkkkPressItems } from '@/lib/useWPData';
import { PRESS_ITEMS } from '@/utils/pressDataBilingual';

export function PressPage() {
  const { language } = useLanguage();
  const { data: wpItems, loading } = useBkkkPressItems();

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
        image="https://images.unsplash.com/photo-1557804506-e969d7b32a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzcyUyMGNvbmZlcmVuY2UlMjBtZWRpYXxlbnwxfHx8fDE3NzI5NjQ5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        height="h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      <div className="w-full px-6 py-12 md:py-20">
        <Reveal>
          <h1 className="text-3xl md:text-4xl font-sans font-bold mb-8 text-gray-900">{getTranslation(language, 'press.title')}</h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid gap-8">
            {loading ? (
              <p className="text-gray-400 font-sans">Loading...</p>
            ) : items.map((item) => (
              <div key={item.id} className="border-b border-gray-200 py-8">
                <p className={`text-gray-500 mb-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                  {language === 'th' ? item.dateTH : item.date}
                </p>
                <h2 className={`text-2xl font-sans font-bold text-black mb-4 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                  {language === 'th' ? item.titleTH : item.title}
                </h2>
                {item.link && item.link !== '#' ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-black underline underline-offset-4 hover:text-gray-600 transition-colors ${language === 'th' ? 'leading-[1.82em]' : ''}`}
                  >
                    {getTranslation(language, item.type === 'pdf' ? 'press.downloadPDF' : 'press.readArticle')}
                  </a>
                ) : (
                  <span className={`text-gray-400 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                    {getTranslation(language, item.type === 'pdf' ? 'press.downloadPDF' : 'press.readArticle')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
