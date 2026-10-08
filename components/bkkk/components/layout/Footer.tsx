'use client';
import { Instagram, Facebook, AtSign, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/utils/languageContext';
import { Logo } from '../ui/Logo';
import { MailingListSignup } from '@/components/common/MailingListSignup';

export function Footer({ onNavigate, isSticky: _isSticky = false }: { onNavigate?: (page: string) => void; isSticky?: boolean }) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const socialLinks = [
    { href: 'https://www.instagram.com/bangkok_kunsthalle/', label: 'Instagram', icon: Instagram },
    { href: 'https://www.facebook.com/BangkokKunsthalle', label: 'Facebook', icon: Facebook },
    { href: 'mailto:info@bangkok-kunsthalle.org', label: 'Email', icon: AtSign },
  ];
  const mobileMailingListTriggerClassName = language === 'th'
    ? 'inline-block max-w-[72px] whitespace-normal text-[10px] leading-tight'
    : 'whitespace-nowrap text-[10px] leading-none';
  
  return (
    <>
    <footer className="hidden md:block w-full bg-black text-white md:px-12 p-[31px] pl-[24px] sm:p-[24px]">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-0 mr-[5%] md:pr-[2%]">
        
        {/* Left: Logo */}
        <div className="flex flex-col -ml-[10px] md:ml-0 md:pl-[24px]">
          <Logo 
            className="h-[40px] md:h-[41px] w-auto"
            white={true}
          />
        </div>

        {/* Right: Navigation, socials, mailing list, and copyright */}
        <div className="w-full lg:w-1/2 md:w-2/3 flex flex-col justify-between gap-6">
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
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={label} className="hover:text-gray-300 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="ml-auto flex flex-col items-end gap-2 text-right">
              <MailingListSignup site="bkkk" />
              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                ©2026 Bangkok Kunsthalle
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
            <span className="text-[10px] text-gray-500 whitespace-nowrap">©2026 Bangkok Kunsthalle</span>
          </div>
        </div>
      )}
      <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-3">
        <button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'} className="flex min-w-0 items-center justify-self-start">
          <Logo className="h-auto w-[52px]" white />
        </button>
        <div className="flex items-center justify-center gap-2">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={label} className="hover:text-gray-300">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <div className="flex min-w-0 items-center justify-self-end gap-1">
          <MailingListSignup site="bkkk" triggerClassName={mobileMailingListTriggerClassName} />
          <button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
