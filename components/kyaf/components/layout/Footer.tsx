'use client';
import { Instagram, Facebook, AtSign, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/utils/languageContext';
import KyafWhite from '../../imports/KyafWhite';
import { MailingListSignup } from '@/components/common/MailingListSignup';

export function Footer({ onNavigate, isSticky: _isSticky = false }: { onNavigate?: (page: string) => void; isSticky?: boolean }) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const socialLinks = [
    { href: 'https://www.facebook.com/profile.php?id=61569868164323', label: 'Facebook', icon: Facebook },
    { href: 'https://www.instagram.com/khaoyai_art_forest/', label: 'Instagram', icon: Instagram },
    { href: 'mailto:info@khaoyaiart.com', label: 'Email', icon: AtSign },
  ];
  const mobileMailingListTriggerClassName = language === 'th'
    ? 'inline-block max-w-[72px] whitespace-normal text-[10px] leading-tight'
    : 'whitespace-nowrap text-[10px] leading-none';
  
  return (
    <>
    <footer className="hidden md:block w-full bg-black text-white px-[6vw] border-t border-white/10 py-[34px]">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-0">
        
        {/* Left: Logo */}
        <div className="flex flex-col w-[38vw] max-w-[160px] md:w-[8.1vw] md:max-w-none -ml-[20px] md:-ml-[15px]">
          <svg 
            className="w-full h-auto" 
            fill="none" 
            preserveAspectRatio="xMinYMin meet" 
            viewBox="0 0 371 159"
            aria-label="Khao Yai Art Forest"
          >
            <path 
              d="M71.3958 31.2188H60.2917L48.3125 48.625H47.1875V31.2188H31.5208V38.2865H37.3021V74.8958H47.1875V56.2135H48.599L60.9635 74.8958H72.099L56.4948 52.1042L71.3958 31.2292V31.2188ZM148.646 68.1771H143.833V52.6354C143.833 44.7083 138.729 40.7188 129.219 40.7188C120.391 40.7188 115.953 44.1875 115.063 49.9635L123.224 52.3073C123.703 49.1875 125.146 47.4583 128.974 47.4583C132.469 47.4583 134.401 48.974 134.401 52.6354V54.8854H127.078C120.281 54.8854 114.115 57.2969 114.115 65.5104C114.115 73.7188 120.146 75.5938 125.036 75.5938C127.406 75.5938 128.688 75.1406 130.198 74.4688L134.25 69.4583H134.578L135.792 74.9167H148.667V68.1667L148.646 68.1771ZM134.391 62.5208C134.391 66.9792 132.078 69.1094 128.135 69.1094C125.792 69.1094 123.094 68.375 123.094 64.9375C123.094 61.9792 125.115 61.1094 127.906 61.1094H134.391V62.5208ZM167.661 75.6615C178.089 75.6615 183.203 70.4896 183.203 59.9635V56.4375C183.203 45.9063 178.089 40.7396 167.661 40.7396C157.229 40.7396 152.115 45.9167 152.115 56.4375V59.9635C152.115 70.5 157.219 75.6615 167.661 75.6615ZM161.818 57.1927C161.818 50.5781 163.547 47.7865 167.672 47.7865C171.792 47.7865 173.51 50.5781 173.51 57.1927V59.1875C173.51 65.8073 171.781 68.599 167.672 68.599C163.557 68.599 161.818 65.8073 161.818 59.1875V57.1927ZM77.6823 74.8854H87.3177V55.4948C87.3177 50.2917 89.2083 47.9167 93.3542 47.9167C97.0729 47.9167 98.4219 49.8125 98.4219 54.2396V74.8854H108.057V53.3698C108.057 45.0573 104.62 40.8542 97.625 40.8542C95.3438 40.8542 93.6406 41.3021 92.1042 42.1302L87.6458 47.0781H87.3177V28.651H72.8698V35.3906H77.6823V74.8854ZM215.214 67.8281H209.464V74.8958H230.849V67.8281H225.104V58.4844L239.453 31.2188H229.021L220.438 49.6458H220.109L211.667 31.2188H200.979L215.203 58.4844V67.8281H215.214ZM257.99 69.4688H258.318L259.536 74.9271H272.411V68.1771H267.594V52.6354C267.594 44.7083 262.49 40.7188 252.979 40.7188C244.156 40.7188 239.719 44.1875 238.828 49.9635L246.99 52.3073C247.469 49.1875 248.911 47.4583 252.734 47.4583C256.234 47.4583 258.167 48.974 258.167 52.6354V54.8854H250.844C244.042 54.8854 237.875 57.2969 237.875 65.5104C237.875 73.7188 243.911 75.5938 248.786 75.5938C251.172 75.5938 252.448 75.1406 253.964 74.4688L258.01 69.4583L257.99 69.4688ZM246.844 64.9375C246.844 61.9792 248.87 61.1094 251.661 61.1094H258.146V62.5208C258.146 66.9792 255.833 69.1094 251.885 69.1094C249.547 69.1094 246.844 68.375 246.844 64.9375ZM288.844 74.8854V41.4948H273.75V48.2344H279.214V74.8854H288.844ZM283.714 37.5104C288.109 37.5104 290.073 36.1302 290.073 33.0781V32.4375C290.073 29.3802 288.109 28 283.714 28C279.313 28 277.349 29.3802 277.349 32.4375V33.0781C277.349 36.1302 279.302 37.5104 283.714 37.5104ZM36.1667 84.7656V91.8333H41.9844L31 128.432H40.6927L43.2917 119.219H58.9583L61.5573 128.432H71.4479L58.3438 84.7656H36.1563H36.1667ZM45.4219 111.578L50.974 91.8333H51.2917L56.8438 111.578H45.4115H45.4219ZM119.307 115.844V102.099H127.333V95.0313H119.307V85.401H110.318L109.672 95.0313H103.896V102.099H109.672V116.672C109.672 124.865 112.63 128.422 123.99 128.422H127.396V121.359H124.573C120.37 121.359 119.307 120.234 119.307 115.833V115.844ZM91.5625 98.6042L89.4063 102.109H89.0885L87.7969 95.0417H74.1563V101.781H79.6198V121.693H74.1563V128.432H95.3438V121.693H89.2396V111.036C89.2396 105.229 90.8177 103.401 95.7865 103.401H101.37V95.3073C100.406 95.0208 99.4167 94.7969 98.0677 94.7969C95.724 94.7969 93.474 95.474 91.5521 98.6146L91.5625 98.6042ZM144.547 91.8333H150.323V128.432H160.214V111.417H176.271V103.714H160.214V92.6094H179.479V84.7656H144.547V91.8333ZM198.167 94.2656C187.724 94.2656 182.62 99.4427 182.62 109.964V113.495C182.62 124.026 187.724 129.193 198.167 129.193C208.609 129.193 213.708 124.016 213.708 113.495V109.964C213.708 99.4323 208.599 94.2656 198.167 94.2656ZM204.016 112.734C204.016 119.354 202.286 122.146 198.177 122.146C194.063 122.146 192.328 119.354 192.328 112.734V110.74C192.328 104.125 194.063 101.333 198.177 101.333C202.286 101.333 204.016 104.125 204.016 110.74V112.734ZM235.677 98.6042L233.521 102.109H233.203L231.911 95.0417H218.271V101.781H223.734V121.693H218.271V128.432H239.458V121.693H233.354V111.036C233.354 105.229 234.932 103.401 239.901 103.401H245.484V95.3073C244.521 95.0208 243.531 94.7969 242.172 94.7969C239.828 94.7969 237.578 95.474 235.656 98.6146L235.677 98.6042ZM264.12 94.2656C253.839 94.2031 248.839 99.3073 248.839 109.964V113.495C248.839 124.151 253.849 129.193 264.281 129.193C272.536 129.193 277.063 126.115 278.641 119.781L271.286 117.276C270.521 120.292 268.719 122.453 264.802 122.453C260.885 122.453 258.802 120.068 258.484 114.646H279.099V109.953C279.099 99.3906 274.448 94.3177 264.135 94.2552L264.12 94.2656ZM258.474 108.432C258.859 103.255 260.693 101.005 264.385 101.005C268.073 101.005 269.651 103.224 269.714 108.432H258.474ZM299.859 108.073C296.484 107.563 293.573 106.99 293.573 104.063C293.573 101.979 295.01 101.078 298.089 101.078C302.172 101.078 305.156 102.651 307.214 104.646L311.161 99C308.234 96.3333 303.479 94.3385 297.479 94.3385C289.318 94.3385 284.599 97.9688 284.599 104.813C284.599 110.844 288.26 113.828 296.865 115.344C300.557 115.99 303.031 116.276 303.031 119.125C303.031 121.406 301.484 122.401 297.917 122.401C293.427 122.401 290.021 120.823 287.411 118.349L283.365 124.13C286.677 127.505 291.677 129.141 297.813 129.141C306.771 129.141 312.01 125.573 312.01 118.188C312.01 112.396 308.708 109.422 299.839 108.073H299.859ZM335.542 121.365C331.339 121.365 330.276 120.245 330.276 115.844V102.099H338.302V95.0313H330.276V85.401H321.286L320.641 95.0313H314.865V102.099H320.641V116.672C320.641 124.865 323.594 128.422 334.958 128.422H338.365V121.359H335.542V121.365Z" 
              fill="white" 
            />
          </svg>
        </div>

        {/* Right: Navigation, socials, mailing list, and copyright */}
        <div className="w-full lg:w-1/2 md:w-2/3 flex flex-col justify-between gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-sm md:text-base font-normal tracking-wide">
              <button
                onClick={() => onNavigate?.('support')}
                className={`hover:text-gray-300 transition-colors text-left cursor-pointer ${language === 'th' ? 'leading-[1.82em]' : ''}`}
              >
                {language === 'th' ? 'การสนับสนุน' : 'Support us'}
              </button>
              <button
                onClick={() => onNavigate?.('contact')}
                className={`hover:text-gray-300 transition-colors text-left cursor-pointer ${language === 'th' ? 'leading-[1.82em]' : ''}`}
              >
                {language === 'th' ? 'สมัครรับข่าวสาร' : 'Contact us'}
              </button>
            </div>

            <div className="flex-1 flex justify-start md:justify-around items-center gap-6 w-[80%] sm:w-[40%] px-0 md:px-[29px] py-[0px]">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={label} className="hover:text-gray-300 transition-colors cursor-pointer">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="ml-auto flex flex-col items-end gap-2 text-right">
              <MailingListSignup site="kyaf" />
              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                ©2026 Khao Yai Art Forest
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
    <div data-mobile-sticky-footer className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-black text-white shadow-[0_-4px_18px_rgba(0,0,0,0.2)]" role="contentinfo">
      {isExpanded && (
        <div className="border-b border-white/20 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => onNavigate?.('support')} className="text-left text-sm hover:text-gray-300">{language === 'th' ? 'การสนับสนุน' : 'Support us'}</button>
            <button type="button" onClick={() => onNavigate?.('contact')} className="text-left text-sm hover:text-gray-300">{language === 'th' ? 'สมัครรับข่าวสาร' : 'Contact us'}</button>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">©2026 Khao Yai Art Forest</span>
          </div>
        </div>
      )}
      <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-3">
        <button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'} className="flex min-w-0 items-center justify-self-start">
          <div className="h-[22px] w-[52px]"><KyafWhite /></div>
        </button>
        <div className="flex items-center justify-center gap-2">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={label} className="hover:text-gray-300">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <div className="flex min-w-0 items-center justify-self-end gap-1">
          <MailingListSignup site="kyaf" triggerClassName={mobileMailingListTriggerClassName} />
          <button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
