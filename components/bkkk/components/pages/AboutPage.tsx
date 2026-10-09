'use client';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useLanguage } from '@/utils/languageContext';
import { useCovers } from '@/lib/coversContext';
import { useBkkkAboutUs } from '@/lib/useWPData';
import { RichContent } from '@/utils/richContent';

export type AboutPageType = 'about' | 'history';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
  activePage?: AboutPageType;
}

// Hardcoded fallback — used when WP CPT has no entries yet
const FALLBACK = [
  {
    section: 'About Us',
    detail: `<p>Bangkok Kunsthalle is a dynamic, rigorous and accessible cultural institution devoted to art, cinema, music, dance, literature, architecture and other creative languages. Bangkok Kunsthalle represents a new model of art museum. This alternative institution occupies the abandoned Thai Wattana Panich building, a leading printing house that was razed by fire in 2001. The raw, industrial space presents a novel and pioneering platform which mirrors the quality of artworks chosen to be exhibited there.</p><p>Bangkok Kunsthalle is an artist driven institution, where each new exhibition activates a new space in the brutalist complex. Architectural interventions are informed by the artists, their vision and artworks. Artists invited to exhibit at Bangkok Kunsthalle are commissioned to make site-specific works addressing the building and surrounding area's rich visual language and cultural history.</p><p>The institution prides itself in its experimental nature, pushing the boundaries of contemporary art through novel exhibitions and public programs. At its core, Bangkok Kunsthalle strives to be the focal point of creative dialogue for not only Thailand but South-East Asia as a whole.</p><p>The institution organizes exhibitions featuring international and Thai artists. Throughout the year it also presents a moving image program and a dynamic public program which includes artists' talks, lectures, workshops, screenings and readings.</p>`,
  },
  {
    section: 'History',
    detail: `<p>Bangkok Kunsthalle occupies the former Thai Watana Panich building complex, situated on the periphery of Bangkok's Chinatown. The site straddles the border of "old" and "new" Bangkok, delineated by the Phadung Krung Kasem canal—the last outer moat of the historical city to be dug in 1851.</p><p>Thai Watana Panich was founded in 1935 as a publisher of textbooks. In the following decades the business expanded significantly. By 1970, through a partnership with the Ministry of Education, the company had become one of the sole distributors of educational materials throughout Thailand. By the 1990s, the company was in decline and in 2001 a conflagration razed the building to an ashen husk. Since then the company has downscaled and moved its headquarters to a smaller site in the city. After laying dormant for 23 years, Bangkok Kunsthalle revitalized the building, inaugurating it as an art space in January 2024.</p>`,
  },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function AboutPage({ activePage = 'about' }: AboutPageProps) {
  const { language } = useLanguage();
  const covers = useCovers();
  const didScroll = useRef(false);
  const { data: wpItems, loading } = useBkkkAboutUs();

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
      <ParallaxHero
        image={covers.about || 'https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-for-history-34e22018.jpg'}
        height="h-[60vh] min-h-[60vh] max-h-[60vh] md:h-[80vh] md:min-h-[80vh] md:max-h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
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
