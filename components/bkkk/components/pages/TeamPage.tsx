// @ts-nocheck
'use client';
import { useBkkkTeamMembers } from '@/lib/useWPData';
import { ParallaxHero } from '../ui/ParallaxHero';
import { Reveal } from '../ui/Reveal';
import { useLanguage } from '@/utils/languageContext';
import { useCovers } from '@/lib/coversContext';
import type { TeamMemberItem } from '@/lib/wp-mappers';
import { RichContent } from '@/utils/richContent';

import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';
const TEAM_HERO = `${PUBLIC_WP_ORIGIN}/wp-content/uploads/2026/03/bk_Description-Without-Place-Krittawat-Atthsis-Prapasiri-Kasemkijkajorn-82.jpg`;


interface TeamPageProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export function TeamPage({ activePage }: TeamPageProps) {
  const { language } = useLanguage();
  const covers = useCovers();
  const { data: rawMembers } = useBkkkTeamMembers();
  // Role override — update in WP when possible
  const members = rawMembers.map(m =>
    m.name === 'Thanchanok Benjajinda'
      ? { ...m, role: 'Assistant Curator of Public Programs', roleTH: 'ผู้ช่วยภัณฑารักษ์โปรแกรมสาธารณะ' }
      : m
  );

  // Group members by their 'group' field, sorted by 'order'
  const grouped = members
    .slice()
    .sort((a, b) => a.order - b.order)
    .reduce((acc, m) => {
      const key = m.group || 'Team';
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {} as Record<string, typeof members>);

  const FOUNDER = members.find(m => m.group?.toLowerCase() === 'founder');
  const DIRECTORS = grouped['Directors'] || grouped['directors'] || [];
  const ADVISORY = grouped['Advisory Board'] || grouped['advisory-board'] || [];
  const DONORS = grouped['Donors'] || grouped['donors'] || [];
  const teamGroups = Object.entries(grouped).filter(
    ([key]) => !['founder', 'Founder', 'Directors', 'directors', 'Advisory Board', 'advisory-board', 'Donors', 'donors'].includes(key)
  );

  return (
    <div className="relative w-full min-h-screen bg-white pb-24">
      <ParallaxHero image={covers.team || TEAM_HERO} height="h-[60vh] md:h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </ParallaxHero>

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">

        {/* Founder */}
        {FOUNDER && (
          <section id="founder" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className="text-xl md:text-2xl font-normal sticky top-32">
                {language === 'th' ? 'ผู้ก่อตั้ง' : 'Founder'}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-8">
              {FOUNDER.image && (
                <div className="w-full mb-4">
                  <img src={FOUNDER.image} alt={FOUNDER.name} className="w-full h-auto object-cover" />
                </div>
              )}
              <div className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                <div className="mb-2">{FOUNDER.name}</div>
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
              <h2 className="text-xl md:text-2xl font-normal sticky top-32">
                {language === 'th' ? 'ผู้อำนวยการ' : 'Directors'}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-12">
              {DIRECTORS.map((director, idx) => (
                <Reveal key={idx} delay={idx * 0.05}>
                  <div className="flex flex-col gap-4">
                    {director.image && (
                      <div className="w-full mb-4">
                        <img src={director.image} alt={director.name} className="w-full aspect-[3/4] object-cover object-center" />
                      </div>
                    )}
                    <div className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                      <div className="mb-2">{director.name}</div>
                      <div className="text-base md:text-lg text-gray-500">{language === 'th' ? (director.roleTH || director.role) : director.role}</div>
                      {director.bio && (
                        <div className="text-base md:text-lg text-gray-700 mt-2 [&>p]:mb-4">
                          <RichContent content={language === 'th' ? (director.bioTH || director.bio) : director.bio} />
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Advisory Board */}
        {ADVISORY.length > 0 && (
          <section id="advisory-board" className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className="text-xl md:text-2xl font-normal sticky top-32">
                {language === 'th' ? 'คณะกรรมการที่ปรึกษา' : 'Advisory Board'}
              </h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {ADVISORY.map((member, idx) => (
                <div key={idx} className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                  <div>{member.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Founder's Circle & Collector's Roundtable Donors */}
        <section id="donors" className="flex flex-col md:flex-row mb-24 md:mb-32">
          <div className="w-full md:w-1/2 mb-12 md:mb-0">
            <h2 className="text-xl md:text-2xl font-normal sticky top-32">
              {language === 'th' ? "ผู้บริจาค Founder's Circle & Collector's Roundtable" : "Founder's Circle & Collector's Roundtable Donors"}
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
              <div key={name} className="text-xl md:text-2xl font-sans text-black font-normal">{name}</div>
            ))}
          </div>
        </section>

        {/* Team groups */}
        {teamGroups.map(([groupName, groupMembers], gIdx) => (
          <section key={gIdx} id={groupName.toLowerCase().replace(/\s+/g, '-')} className="flex flex-col md:flex-row mb-24 md:mb-32">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <h2 className="text-xl md:text-2xl font-normal sticky top-32">{groupName.charAt(0).toUpperCase() + groupName.slice(1)}</h2>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {groupMembers.map((member, mIdx) => (
                <div key={mIdx} className="flex flex-col text-xl md:text-2xl font-sans text-black font-normal">
                  <div>{member.name}</div>
                  {member.role && <div className="text-base md:text-lg text-gray-500">{language === 'th' ? (member.roleTH || member.role) : member.role}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}
