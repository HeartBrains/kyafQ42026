'use client';
import { ParallaxHero } from '../ui/ParallaxHero';
import { Reveal } from '../ui/Reveal';
import { useEffect, useRef, useState } from 'react';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import { ABOUT_HERO_IMAGE } from '@/utils/imageConstants';
import { useKyafAboutUs } from '@/lib/useWPData';
import { RichContent } from '@/utils/richContent';

export type AboutPageType = 'about' | 'vision' | 'history';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  activePage?: AboutPageType;
}

// Hardcoded fallback — used when WP CPT has no entries yet
const FALLBACK = [
  {
    section: 'About Us',
    detail: `<p>Khao Yai Art Forest is a new paradigm of institution whose name "Art Forest" reflects the institution's ambition: advancing, supporting, and realizing visionary proposals of artists in the natural environment.</p><p>Khao Yai Art Forest enables artists to realize visionary projects within nature that may be unattainable due to scale or scope. It achieves this through commissioning single-artist projects, organizing exhibitions, creating site-specific installations, and collecting the work of Thai and international artists focusing on healing nature.</p><p>From its inception, Khao Yai Art Forest has shown a commitment to following and supporting artists' ideas that contribute to challenging and enriching the relationship with Nature. Through the Research and Public Activities such as gastronomies, workshops, and symposiums, we share values, alter perspectives, and learn and unlearn together.</p><p>Since its establishment, Art Forest has been transforming the Khao Yai area into a vibrant arts destination for visitors from the region and internationally.</p>`,
  },
  {
    section: 'History',
    detail: `<p>Khao Yai Art Forest spans 36 hectares, bordering the Khao Yai National Park in Nakhon Ratchasima, a land notable for its reddish soil. Within this quiet, mountainous landscape remain traces of a twenty-year-old mango orchard and vacant plots once used for corn cultivation.</p><p>In 2022, Khao Yai Art Forest was established with a core mission focused on ecological restoration and the healing of nature. The site, which had been degraded by monoculture agriculture, is currently in a process of recovery through collaboration with PLandscape (PLA), a landscape architecture studio based in Bangkok.</p><p>After nearly two years of restoration, the former cassava field is now covered in lush greenery. Butterflies emerge during the summer months, while birds and cicadas enliven the forest with sound. The establishment of Khao Yai Art Forest not only provides visitors with an opportunity to reconnect with nature but also actively involves the on-site team—members of the local community—in the shared practice of restoring and nurturing the land.</p>`,
  },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function AboutPage({ onNavigate, activePage = 'about' }: AboutPageProps) {
  const { language } = useLanguage();
  const covers = useCovers();
  const didScroll = useRef(false);
  const { data: wpItems, loading } = useKyafAboutUs();

  const sections = (() => {
    if (!loading && wpItems.length > 0) {
      const sorted = [...wpItems].sort((a, b) => a.order - b.order);
      const map = new Map<string, string[]>();
      for (const item of sorted) {
        const key = item.section || 'About Us';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item.detail);
      }
      return Array.from(map.entries())
        .map(([section, details]) => ({ section, details }))
        .sort((a, b) => {
          if (a.section === 'About Us') return -1;
          if (b.section === 'About Us') return 1;
          return a.section.localeCompare(b.section);
        });
    }
    return FALLBACK.map(f => ({ section: f.section, details: [f.detail] }))
      .sort((a, b) => {
        if (a.section === 'About Us') return -1;
        if (b.section === 'About Us') return 1;
        return a.section.localeCompare(b.section);
      });
  })();

  const firstId = sections.length > 0 ? slugify(sections[0].section) : 'about';
  const [activeSection, setActiveSection] = useState<string>(
    activePage === 'history' ? 'history' : firstId
  );

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
  };

  useEffect(() => {
    if (didScroll.current) return;
    didScroll.current = true;
    const id = activePage === 'history' ? 'history' : firstId;
    setTimeout(() => scrollTo(id), 100);
  }, [activePage, firstId]);

  useEffect(() => {
    const ids = sections.map(s => slugify(s.section));
    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= scrollY) { setActiveSection(ids[i]); break; }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="w-full min-h-screen bg-white pb-24">
      <ParallaxHero image={covers.about || ABOUT_HERO_IMAGE} height="h-[60vh] min-h-[60vh] max-h-[60vh] md:h-[80vh] md:min-h-[80vh] md:max-h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </ParallaxHero>

      <div className="w-full px-[6vw] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row">

          <aside className="w-full md:w-1/2 shrink-0 mb-12 md:mb-0">
            <nav className="md:sticky md:top-32 flex flex-col items-start gap-2">
              {sections.map(s => {
                const id = slugify(s.section);
                return (
                  <button key={id} onClick={() => scrollTo(id)}
                    className={`text-left text-xl md:text-2xl font-sans font-normal transition-colors duration-300 ${language === 'th' ? 'leading-[1.82em]' : ''} ${activeSection === id ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
                    {s.section}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="w-full md:w-1/2">
            {sections.map((s, si) => {
              const id = slugify(s.section);
              return (
                <section key={id} id={id} className={`${si < sections.length - 1 ? 'mb-24 md:mb-32' : ''} scroll-mt-32`}>
                  <Reveal delay={0.1}>
                    <div className="flex flex-col gap-6 text-xl md:text-2xl font-normal leading-tight text-black">
                      {s.details.map((detail, di) => (
                        <RichContent key={di} content={detail} />
                      ))}
                    </div>
                  </Reveal>
                </section>
              );
            })}
          </main>

        </div>
      </div>
    </div>
  );
}
