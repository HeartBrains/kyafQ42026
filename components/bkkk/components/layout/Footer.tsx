'use client';
import { Instagram, Facebook, AtSign, Globe } from 'lucide-react';
import { useLanguage } from '@/utils/languageContext';
import { Logo } from '../ui/Logo';
import { MailingListSignup } from '@/components/common/MailingListSignup';

export function Footer({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { language } = useLanguage();
  
  return (
    <footer className="w-full bg-black text-white md:px-12 p-[48px] pl-[24px] sm:p-[24px]">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-0 mr-[5%] md:pr-[2%]">
        
        {/* Left: Logo */}
        <div className="flex flex-col -ml-[10px] md:ml-0 md:pl-[24px]">
          <Logo 
            className="h-[40px] md:h-[60px] w-auto"
            white={true}
          />
        </div>

        {/* Right: Mailing list, navigation, and socials */}
        <div className="w-full lg:w-1/2 md:w-2/3 flex flex-col justify-between gap-6">
          <div className="flex justify-start md:justify-end">
            <MailingListSignup site="bkkk" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-sm md:text-base font-normal tracking-wide">
              <button
                onClick={() => onNavigate?.('support')}
                className={`hover:text-gray-300 transition-colors text-left ${language === 'th' ? 'leading-[1.82em]' : ''}`}
              >
                {language === 'th' ? 'การสนับสนุน' : 'Support us'}
              </button>
              <button
                onClick={() => onNavigate?.('contact')}
                className={`hover:text-gray-300 transition-colors text-left ${language === 'th' ? 'leading-[1.82em]' : ''}`}
              >
                {language === 'th' ? 'สมัครรับข่าวสาร' : 'Contact us'}
              </button>
            </div>

            <div className="flex-1 flex justify-start md:justify-around items-center gap-6 w-[80%] sm:w-[40%] px-0 md:px-[29px] py-[0px]">
              <a href="https://www.instagram.com/bangkok_kunsthalle/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/BangkokKunsthalle" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="mailto:info@bangkok-kunsthalle.org" className="hover:text-gray-300 transition-colors">
                <AtSign className="w-5 h-5" />
              </a>
            </div>

            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
              ©2026 Bangkok Kunsthalle
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
