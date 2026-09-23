// @ts-nocheck
'use client';
import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Mail, MapPin, Phone, Facebook, Instagram, Globe } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { useLanguage } from '@/utils/languageContext';
import { HeroSlider } from '../ui/HeroSlider';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';
const WP_CONTACT_URL = `${PUBLIC_WP_ORIGIN}/wp-json/contact/email`;
const WP_USER = process.env.NEXT_PUBLIC_WP_CONTACT_USER ?? '';
const WP_PASS = process.env.NEXT_PUBLIC_WP_CONTACT_PASS ?? '';

import { CONTACT_HERO_IMAGE, CONTACT_HERO_IMAGE_2 } from '@/utils/imageConstants';

export function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(WP_CONTACT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa(`${WP_USER}:${WP_PASS}`),
        },
        body: JSON.stringify({ email, subject: null, message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('success');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };
  const { language } = useLanguage();
  
  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-black">
      {/* Hero Map - Using slideshow with 2 images */}
       <HeroSlider 
        images={[CONTACT_HERO_IMAGE, CONTACT_HERO_IMAGE_2]}
        height="h-[60vh] md:h-[80vh]"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </HeroSlider>

      <div className="w-full px-[6vw] pt-24">
        
        {/* Section 1: Connect with Khao Yai Art Forest */}
        <div className="flex flex-col md:flex-row mb-12 md:mb-16">
             {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0 md:ml-6">
                <h1 className="text-[19px] font-normal">
                  {language === 'th' ? 'เชื่อมต่อกับเขาใหญ่ อาร์ตฟอเรสต์' : 'Connect with Khao Yai Art Forest'}
                </h1>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2 flex flex-col gap-12">
                {/* Introduction */}
                <div className="flex flex-col gap-4">
                    <p className="text-[19px] font-normal">
                        {language === 'th' 
                            ? 'สำหรับการสอบถามเกี่ยวกับนิทรรศการ สื่อมวลชน การเยี่ยมชมส่วนตัว หรือวัตถุประสงค์ทางการศึกษา' 
                            : 'For inquiries regarding exhibitions, press, private visits, or educational purpose.'}
                    </p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                    <p className="text-[19px] font-normal">
                        {language === 'th' 
                            ? 'กรุณาฝากข้อความด้านล่าง หรือติดต่อเราทางอีเมล: ' 
                            : 'Please leave a message below, or contact us by email: '}
                        <a href="mailto:info@khaoyaiart.com" className="hover:text-gray-600 transition-colors">
                            info@khaoyaiart.com
                        </a>
                    </p>
                </div>

                {/* Contact Form */}
                <form className="flex flex-col gap-6 w-full max-w-lg" onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={language === 'th' ? 'อีเมล' : 'Email'}
                        className="rounded-none border-gray-300 h-12 text-[19px] placeholder:text-gray-400 font-sans"
                    />
                    <Textarea
                        required
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={language === 'th' ? 'ข้อความสอบถาม' : 'Inquiry Box'}
                        className="rounded-none border-gray-300 min-h-[200px] text-[19px] placeholder:text-gray-400 resize-none font-sans"
                    />
                    {status === 'success' && (
                        <p className="text-sm text-green-600">{language === 'th' ? 'ส่งข้อความเรียบร้อยแล้ว' : 'Message sent successfully.'}</p>
                    )}
                    {status === 'error' && (
                        <p className="text-sm text-red-500">{language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Something went wrong. Please try again.'}</p>
                    )}
                    <Button
                        type="submit"
                        disabled={status === 'sending'}
                        className="rounded-none bg-[#1A1A1A] hover:bg-black text-white px-8 py-6 text-[19px] w-fit font-sans disabled:opacity-50"
                    >
                        {status === 'sending'
                            ? (language === 'th' ? 'กำลังส่ง...' : 'Sending...')
                            : (language === 'th' ? 'ส่ง' : 'Submit')}
                    </Button>
                </form>
            </div>
        </div>

        {/* Section 2: Social Media */}
        <div className="flex flex-col md:flex-row mb-12 md:mb-16">
            {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0 md:ml-6">
                <h2 className="text-[19px] font-normal">
                    {language === 'th' ? 'โซเชียลมีเดีย' : 'Social Media'}
                </h2>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2 md:mr-6">
                <div className="flex flex-col gap-2">
                    <a 
                        href="https://www.facebook.com/profile.php?id=61569868164323" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-normal hover:text-gray-600 transition-colors flex items-center text-[19px]"
                    >
                        <Facebook className="mr-6" size={16} />
                        Khao Yai Art Forest
                    </a>
                    <a 
                        href="https://www.instagram.com/khaoyai_art_forest/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-normal hover:text-gray-600 transition-colors flex items-center text-[19px]"
                    >
                        <Instagram className="mr-6" size={16} />
                        khaoyai_art_forest
                    </a>
                    <a 
                        href="https://www.khaoyaiart.org" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-normal hover:text-gray-600 transition-colors flex items-center text-[19px]"
                    >
                        <Globe className="mr-6" size={16} />
                        www.khaoyaiart.org
                    </a>
                </div>
            </div>
        </div>

        {/* Section 3: Address */}
        <div className="flex flex-col md:flex-row mb-12 md:mb-16">
            {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0 md:ml-6">
                <h2 className="text-[19px] font-normal">
                    {language === 'th' ? 'ที่อยู่' : 'Address'}
                </h2>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2">
                <div className="text-[19px] font-normal">
                    <p className="text-[19px]">Khao Yai Art Forest</p>
                    <p className="text-[19px]">{language === 'th' 
                        ? 'โป่งตาลอง ปากช่อง นครราชสีมา 30130 ประเทศไทย' 
                        : 'Pong Ta Long, Pak Chong, Nakhon Ratchasima, 30130 Thailand'}
                    </p>
                </div>
            </div>
        </div>

        {/* Section 4: Opening Hours */}
        <div className="flex flex-col md:flex-row mb-12 md:mb-16">
            {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0 md:ml-6">
                <h2 className="text-[19px] font-normal">
                    {language === 'th' ? 'เวลาเปิดทำการ' : 'Opening Hours'}
                </h2>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2">
                <div className="text-[19px] font-normal">
                    <p className="text-[19px]">{language === 'th' ? 'พฤหัสบดี - ศุกร์: 12:30 - 18:00' : 'Thursday - Friday: 12:30 - 18:00'}</p>
                    <p className="text-[19px]">{language === 'th' ? 'เสาร์ - อาทิตย์: 10:00 - 18:00' : 'Saturday - Sunday: 10:00 - 18:00'}</p>
                    <p className="mt-2 text-[19px]">{language === 'th' ? 'ปิด: จันทร์ - พุธ' : 'Closed: Monday - Wednesday'}</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
