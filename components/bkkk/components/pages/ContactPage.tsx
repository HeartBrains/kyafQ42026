'use client';
import { useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useLanguage } from '@/utils/languageContext';
import { Facebook, Instagram, Globe } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';
const WP_CONTACT_URL = `${PUBLIC_WP_ORIGIN}/wp-json/contact/email`;
const WP_USER = process.env.NEXT_PUBLIC_WP_CONTACT_USER ?? '';
const WP_PASS = process.env.NEXT_PUBLIC_WP_CONTACT_PASS ?? '';

export function ContactPage() {
  const { language } = useLanguage();
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
  
  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-black">
      {/* Hero Map */}
       <div className="w-full h-[60vh] md:h-[80vh] bg-[#D9D9D9] relative overflow-hidden">
          <ImageWithFallback 
              src="https://irp.cdn-website.com/5516674f/dms3rep/multi/cover-contact-1-89b6eddb.jpg"
              alt="Bangkok Kunsthalle"
              className="w-full h-full object-cover"
          />
      </div>

      <div className="w-full px-[5%] pt-24">
        
        {/* Contact Content */}
        <div className="flex flex-col md:flex-row mb-32 md:mb-40">
             {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
                <Reveal>
                    <h1 className={`text-xl md:text-2xl font-normal md:ml-[24px] ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                      {language === 'th' ? 'ติดต่อบางกอก คุนซ์ฮาลเล่' : 'Connect with Bangkok Kunsthalle'}
                    </h1>
                </Reveal>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2 flex flex-col gap-8">
                <Reveal delay={0.1}>
                    <div className="flex flex-col gap-4">
                        <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                            {language === 'th' ? (
                              <>
                                สำหรับข้อสอบถามเกี่ยวกับนิทรรศการ
                                สื่อมวลชน การเยี่ยมชมส่วนตัว
                                หรือวัตถุประสงค์ทางการศึกษา
                              </>
                            ) : (
                              <>
                                For inquiries regarding exhibitions,
                                press, private visits, or educational
                                purpose.
                              </>
                            )}
                        </p>
                        <p className={`text-xl md:text-2xl font-normal mt-4 ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                            {language === 'th' ? (
                              <>
                                กรุณาฝากข้อความด้านล่าง หรือติดต่อเราทางอีเมล:{' '}
                                <a href="mailto:info@bangkok-kunsthalle.org" className="underline hover:no-underline">
                                  info@bangkok-kunsthalle.org
                                </a>
                              </>
                            ) : (
                              <>
                                Please leave a message below, or contact us by email:{' '}
                                <a href="mailto:info@bangkok-kunsthalle.org" className="underline hover:no-underline">
                                  info@bangkok-kunsthalle.org
                                </a>
                              </>
                            )}
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
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
                            className={`rounded-none border-gray-300 min-h-[200px] text-[19px] placeholder:text-gray-400 resize-none font-sans ${language === 'th' ? 'leading-[1.82em]' : ''}`}
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
                            className="rounded-none bg-[#1A1A1A] hover:bg-black text-white px-8 py-6 text-lg w-fit font-sans disabled:opacity-50"
                        >
                            {status === 'sending'
                                ? (language === 'th' ? 'กำลังส่ง...' : 'Sending...')
                                : (language === 'th' ? 'ส่ง' : 'Submit')}
                        </Button>
                    </form>
                </Reveal>
            </div>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col md:flex-row mb-32 md:mb-40">
            {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
                <Reveal>
                    <h2 className={`text-xl md:text-2xl font-normal md:ml-[24px] ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                      {language === 'th' ? 'โซเชียลมีเดีย' : 'Social Media'}
                    </h2>
                </Reveal>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2">
                <Reveal delay={0.1}>
                    <div className="flex flex-col gap-2">
                        <a 
                          href="https://www.facebook.com/BangkokKunsthalle" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-xl md:text-2xl font-normal underline hover:no-underline ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}
                        >
                          <Facebook className="inline-block mr-6" size={16} />
                          BangkokKunsthalle
                        </a>
                        <a 
                          href="https://www.instagram.com/bangkok_kunsthalle/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-xl md:text-2xl font-normal underline hover:no-underline ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}
                        >
                          <Instagram className="inline-block mr-6" size={16} />
                          bangkok_kunsthalle
                        </a>
                        <a 
                          href="https://www.khaoyaiart.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-xl md:text-2xl font-normal underline hover:no-underline ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}
                        >
                          <Globe className="inline-block mr-6" size={16} />
                          www.khaoyaiart.org
                        </a>
                    </div>
                </Reveal>
            </div>
        </div>

        {/* Address Section */}
        <div className="flex flex-col md:flex-row mb-32 md:mb-40">
            {/* Left Column */}
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
                <Reveal>
                    <h2 className={`text-xl md:text-2xl font-normal md:ml-[24px] ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                      {language === 'th' ? 'ที่อยู่' : 'Address'}
                    </h2>
                </Reveal>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2">
                <Reveal delay={0.1}>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? 'บางกอก คุนซ์ฮาลเล่' : 'Bangkok Kunsthalle'}
                            </p>
                            <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? '599 ซอย พันธจิตต์ แขวงป้อมปราบ' : '599 Pantachit Alley, Pom Prap,'}
                            </p>
                            <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? 'เขตป้อมปราบศัตรูพาย กรุงเทพมหานคร 10100' : 'Pom Prap Sattru Phai, Bangkok,'}
                            </p>
                            <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? 'ประเทศไทย' : '10100 Thailand'}
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? 'เวลาทำการ' : 'Opening Hours:'}
                            </p>
                            <p className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? 'วันพุธ - วันอาทิตย์' : 'Wednesday - Sunday'}
                            </p>
                            <p className="text-xl md:text-2xl font-normal leading-tight">14:00 - 20:00</p>
                            <p className={`text-xl md:text-2xl font-normal mt-2 ${language === 'th' ? 'leading-[1.82em]' : 'leading-tight'}`}>
                              {language === 'th' ? 'ปิดทำการ: วันจันทร์ - วันอังคาร' : 'Closed: Monday - Tuesday'}
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>

      </div>
    </div>
  );
}
