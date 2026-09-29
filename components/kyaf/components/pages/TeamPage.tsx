// @ts-nocheck
'use client';
import { useEffect } from 'react';
import { useKyafTeamMembers } from '@/lib/useWPData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ParallaxHero } from '../ui/ParallaxHero';
import { Reveal } from '../ui/Reveal';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import type { TeamMemberItem } from '@/lib/wp-mappers';
import { TEAM_HERO_IMAGE } from '@/utils/imageConstants';
import { RichContent } from '@/utils/richContent';

interface TeamPageProps {
  activePage?: 'team' | 'advisory-board';
  onNavigate?: (page: string) => void;
}

export function TeamPage({ activePage }: TeamPageProps) {
  const { language } = useLanguage();
  const covers = useCovers();
  const { data: members } = useKyafTeamMembers();

  const sorted = members.slice().sort((a, b) => a.order - b.order);
  const grouped = sorted.reduce((acc, m) => {
    const key = m.group || 'Team';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, typeof members>);

  const FOUNDER = sorted.find(m => m.group?.toLowerCase() === 'founder');
  const DIRECTORS = grouped['Directors'] || grouped['directors'] || [];
  const CULINARY = sorted.filter(m => m.role === 'Culinary Director' || m.name.includes('Wuttisak'));
  const ADVISORY = grouped['Advisory Board'] || grouped['advisory-board'] || [];
  const DONORS = grouped['Donors'] || grouped['donors'] || [];
  const culinaryNames = new Set(CULINARY.map(m => m.name));
  const teamGroups = Object.entries(grouped).filter(
    ([key]) => !['founder','Founder','Directors','directors','Advisory Board','advisory-board','Donors','donors'].includes(key)
  ).map(([key, members]) => [key, members.filter(m => !culinaryNames.has(m.name))] as [string, typeof members])
   .filter(([, members]) => members.length > 0);

  // Handle auto-scroll to section
  useEffect(() => {
    if (activePage) {
        const el = document.getElementById(activePage);
        if (el) {
            // Small delay to ensure rendering
            setTimeout(() => {
                const offset = 100; // Header height approx
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
            
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }, 100);
        }
    }
  }, [activePage]);

  return (
    <div className="relative w-full min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <ParallaxHero 
        image={covers.team || TEAM_HERO_IMAGE}
        height="h-[60vh] md:h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </ParallaxHero>

      <div className="w-full mx-auto px-[6vw] pt-[96px] pb-[0px]">
        
        {/* Founder */}
        {FOUNDER && (
          <section id="founder" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                {language === 'th' ? 'ผู้ก่อตั้ง' : 'Founder'}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-8">
              {FOUNDER.image && (
                <div className="w-full mb-4">
                  <img src={FOUNDER.image} alt={FOUNDER.name} className="w-full h-auto object-cover" loading="lazy" decoding="async" fetchPriority="low" />
                </div>
              )}
              <div className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                <div className="mb-2 font-bold">{FOUNDER.name}</div>
                {FOUNDER.bio && (
                  <div className="text-base md:text-lg text-gray-700 mt-2 [&>p]:mb-4">
                    <RichContent content={language === 'th' ? (FOUNDER.bioTH || FOUNDER.bio) : FOUNDER.bio} />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Directors */}
        {DIRECTORS.length > 0 && (
          <section id="directors" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                {language === 'th' ? 'ผู้อำนวยการ' : 'Directors'}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-12">
              {DIRECTORS.map((director, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  {director.image && (
                    <div className="w-full mb-4">
                      <img src={director.image} alt={director.name} className="w-full aspect-[3/4] object-cover object-center" loading="lazy" decoding="async" fetchPriority="low" />
                    </div>
                  )}
                  <div className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                    <div className="mb-2 font-bold">{director.name}</div>
                    <div className="text-base md:text-lg text-gray-500"><RichContent content={language === 'th' ? (director.roleTH || director.role) : director.role} /></div>
                    {director.bio && (
                      <div className="text-base md:text-lg text-gray-700 mt-2 [&>p]:mb-4">
                        <RichContent content={language === 'th' ? (director.bioTH || director.bio) : director.bio} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Culinary */}
        {CULINARY.length > 0 && (
          <section id="culinary" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                Culinary
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-12">
              {CULINARY.map((member, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  {member.image && (
                    <div className="w-full mb-4">
                      <img src={member.image} alt={member.name} className="w-full aspect-[3/4] object-cover object-center" loading="lazy" decoding="async" fetchPriority="low" />
                    </div>
                  )}
                  <div className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                    <div className="mb-2 font-bold">{member.name}</div>
                    <div className="text-base md:text-lg text-gray-500"><RichContent content={language === 'th' ? (member.roleTH || member.role) : member.role} /></div>
                    {member.bio && (
                      <div className="text-base md:text-lg text-gray-700 mt-2 [&>p]:mb-4">
                        <RichContent content={language === 'th' ? (member.bioTH || member.bio) : member.bio} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Advisory Board */}
        {ADVISORY.length > 0 && (
          <section id="advisory-board" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                {language === 'th' ? 'คณะกรรมการที่ปรึกษา' : 'Advisory Board'}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {ADVISORY.map((member, idx) => (
                <div key={idx} className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                  <div className="font-bold">{member.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Donors — WP-driven */}
        {DONORS.length > 0 && (
          <section id="donors" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                {language === 'th' ? 'วงผู้ก่อตั้งและโต๊ะกลมผู้สะสมผู้บริจาค' : "Founder's Circle & Collector's Roundtable Donors"}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {DONORS.map((donor, idx) => (
                <div key={idx} className="text-xl md:text-2xl font-sans text-black font-bold">{donor.name}</div>
              ))}
            </div>
          </section>
        )}

        {/* Founder's Circle — hardcoded */}
        <section id="founders-circle" className="flex flex-col md:flex-row mb-24 md:mb-32">
          <div className="w-full md:w-1/2 mb-12 md:mb-0">
            <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
              {language === 'th' ? "วงผู้ก่อตั้งและโต๊ะกลมผู้สะสมผู้บริจาค" : "Founder's Circle & Collector's Roundtable Donors"}
            </h2>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {[
              'Sangita Jindal',
              'Isabel Liu',
              'Takeo Obayashi',
              'Nunthinee Tanner',
              'Elisa Yu',
              'Lisa Zhang',
            ].map((name) => (
              <div key={name} className="text-xl md:text-2xl font-sans text-black font-bold">{name}</div>
            ))}
          </div>
        </section>

        {/* Team groups */}
        {teamGroups.map(([groupName, groupMembers], gIdx) => (
          <section key={gIdx} id={groupName.toLowerCase().replace(/\s+/g, '-')} className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className={`text-xl md:text-2xl font-bold sticky top-32 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {groupMembers.map((member, mIdx) => (
                <div key={mIdx} className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                  <div className="font-bold">{member.name}</div>
                  {member.role && <div className="text-base md:text-lg text-gray-500"><RichContent content={language === 'th' ? (member.roleTH || member.role) : member.role} /></div>}
                </div>
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}
