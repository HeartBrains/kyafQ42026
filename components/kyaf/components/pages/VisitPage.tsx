'use client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ParallaxHero } from '../ui/ParallaxHero';
import { Reveal } from '../ui/Reveal';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import { VISIT_HERO_IMAGE } from '@/utils/imageConstants';
import { siteConfig } from '@/utils/siteConfig';

export function VisitPage() {
    const { language } = useLanguage();
  const covers = useCovers();

    return (
        <div className="w-full bg-white pb-24 min-h-screen">
            {/* Hero Section */}
            <ParallaxHero 
                image={covers.visit || VISIT_HERO_IMAGE}
                height="h-[50vh] min-h-[50vh] max-h-[50vh] md:h-[60vh] md:min-h-[60vh] md:max-h-[60vh]"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
            </ParallaxHero>

            {/* Content Section with 2-Column Layout */}
            <div className="w-full px-[6vw] pt-[96px]">
                {/* Location Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
                    <div className="md:w-1/2">
                        <p id="location" className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? 'สถานที่' : 'Location'}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Reveal>
                            <div className="space-y-4">
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    Khao Yai Art Forest<br />
                                    Pong Ta Long, Pak Chong, Nakhon Ratchasima, 30130 Thailand
                                </p>
                                <a 
                                    href={siteConfig.links.location}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block text-xl md:text-2xl underline hover:no-underline"
                                >
                                    Google Maps
                                </a>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Opening Hours Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
                    <div className="md:w-1/2">
                        <p id="opening-hours" className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? 'เวลาทำการ' : 'Opening Hours'}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Reveal>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed font-normal">
                                            {language === 'th' ? 'พระหัสบดี - ศุกร์: 12:30 - 18:00' : 'Thursday - Friday: 12:30 - 18:00'}
                                        </p>
                                        <p className="text-xl md:text-2xl leading-relaxed text-gray-600">
                                            {language === 'th' ? 'Fog Forest Experience: 16:30 (10 นาที)' : 'Fog Forest Experience: 16:30 (10 minutes)'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed font-normal">
                                            {language === 'th' ? 'เสาร์ - อาทิตย์: 10:00 - 18:00' : 'Saturday - Sunday: 10:00 - 18:00'}
                                        </p>
                                        <p className="text-xl md:text-2xl leading-relaxed text-gray-600">
                                            {language === 'th' ? 'Fog Forest Experience: 11:30 และ 16:30 (10 นาที)' : 'Fog Forest Experience: 11:30 and 16:30 (10 minutes)'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed text-gray-600">
                                            {language === 'th' 
                                                ? 'K-BAR Experience: ทุกวันเสาร์ที่สองของเดือน เซสชันเริ่ม 16:00 - 22:00 เซสชันสุดท้าย 21:00 (45 นาทีต่อเซสชัน)'
                                                : 'K-BAR Experience: Every second Saturday of the month. Sessions run from 16:00 - 22:00, last session at 21:00 (45 minutes per session).'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed font-normal">
                                            {language === 'th' ? 'ปิดทำการ: จันทร์ - พุธ' : 'Closed: Monday - Wednesday'}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full h-[400px] bg-gray-100 rounded-sm overflow-hidden">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.5!2d101.510924!3d14.5701514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311c2f004a0ed5d7%3A0x7dc289d9bb712f51!2sKhao+Yai+Art+Forest!5e0!3m2!1sen!2sth!4v1710417600000!5m2!1sen!2sth"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={language === 'th' ? 'แผนที่ Khao Yai Art Forest' : 'Khao Yai Art Forest Map'}
                                    />
                                    <a
                                        href="https://maps.app.goo.gl/du5SEK5sPfnQfydp8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-block mt-3 text-base font-normal text-black underline underline-offset-4 hover:opacity-60 transition-opacity ${language === 'th' ? 'leading-[1.82em]' : ''}`}
                                    >
                                        {language === 'th' ? 'เปิดใน Google Maps' : 'Open in Google Maps'}
                                    </a>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Admission Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
                    <div className="md:w-1/2">
                        <p id="admission" className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? 'ค่าเข้าชม' : 'Admission'}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Reveal>
                            <div className="space-y-4">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed font-normal">
                                            {language === 'th' ? 'ค่าเข้าชมเต็มราคา' : 'Full Site Admission'}
                                        </p>
                                        <p className="text-xl md:text-2xl leading-relaxed">
                                            {language === 'th' ? 'ผู้ใหญ่ ฿500.00' : 'Adult ฿500.00'}
                                        </p>
                                        <p className="text-xl md:text-2xl leading-relaxed">
                                            {language === 'th' 
                                                ? 'นักเรียน/นักศึกษาเต็มเวลา และผู้สูงอายุ (65 ปีขึ้นไป) ฿250.00'
                                                : 'Full-time student and Senior (65+ years old) ฿250.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed">
                                            &quot;Afternoon Tea&quot; &amp; Full Site Admission ฿750.00
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed">
                                            {language === 'th' 
                                                ? '"Bamboo Journey" Tasting Experience (มื้อกลางวัน) & ค่าเข้าชมเต็มราคา ฿1,000.00'
                                                : '"Bamboo Journey" Tasting Experience (Lunch) & Full Site Admission ฿1,000.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xl md:text-2xl leading-relaxed">
                                            {language === 'th' 
                                                ? '"Forest Table" Tasting Experience (มื้อเย็น) & ค่าเข้าชมเต็มราคา ฿1,500.00'
                                                : '"Forest Table" Tasting Experience (Dinner) & Full Site Admission ฿1,500.00'}
                                        </p>
                                    </div>
                                </div>
                                <a 
                                    href={siteConfig.links.booking}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block text-xl md:text-2xl underline hover:no-underline mt-2 font-bold"
                                >
                                    {language === 'th' ? 'จองบัตร' : 'Get Ticket'}
                                </a>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Transportation Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
                    <div className="md:w-1/2">
                        <p id="transportation" className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? 'การเดินทาง' : 'Getting Here'}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Reveal>
                            <div className="space-y-3">
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? 'สามารถเดินทางได้โดยรถยนต์ส่วนตัวหรือบริการรถรับส่ง กรุณาดูรายละเอียดด้านล่าง'
                                        : 'Accessible by private car or shuttle service. Please see details below.'}
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Shuttle Service Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
                    <div className="md:w-1/2">
                        <p id="shuttle-service" className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? 'บริการรถรับส่ง' : 'Shuttle Service'}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Reveal>
                            <div className="space-y-3">
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? <>บริการรถรับส่งไป-กลับรายวัน ออกเดินทางจาก <a href={siteConfig.links.bangkokKunsthalle} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Bangkok Kunsthalle</a> เวลา 10:00 น. กลับจาก Khao Yai Art Forest เวลา 17:00 น.</>
                                        : <>Shuttle service departs daily round-trip. Departure from <a href={siteConfig.links.bangkokKunsthalle} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Bangkok Kunsthalle</a> at 10:00, return from Khao Yai Art Forest at 17:00.</>}
                                </p>
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? 'บริการทุกวันพฤหัสบดีถึงอาทิตย์'
                                        : 'Service available every Thursday to Sunday.'}
                                </p>
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? 'ค่าบริการเพิ่มเติม ฿500 / ท่าน สำหรับไป-กลับ (ไม่รวมค่าเข้าชม)'
                                        : 'Additional fee ฿500 / person for round-trip (Full Site Admission excluded).'}
                                </p>
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? 'ใช้ได้กับค่าเข้าชมเต็มราคาหรือ "Bamboo Journey" Tasting Experience (มื้อกลางวัน)'
                                        : 'Available for Full Site Admission or "Bamboo Journey" Tasting Experience (Lunch).'}
                                </p>
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? 'ที่นั่งจำกัด จำเป็นต้องจองล่วงหน้า กรุณาตรวจสอบตารางการเดินทางก่อนจอง'
                                        : 'Limited seats available. Advance reservation required. Kindly review the departure schedule prior to booking.'}
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Car & Parking Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
                    <div className="md:w-1/2">
                        <p id="car-parking" className={`text-xl md:text-2xl font-normal ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? 'รถยนต์และที่จอดรถ' : 'Car & Parking'}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Reveal>
                            <div className="space-y-3">
                                <p className="text-xl md:text-2xl leading-relaxed">
                                    {language === 'th' 
                                        ? <>ใช้เวลาเดินทางประมาณ 3 ชั่วโมงจากกรุงเทพฯ มีที่จอดรถในสถานที่: <a href={siteConfig.links.location} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Khao Yai Art Forest</a></>
                                        : <>Around 3 hours drive from Bangkok. On-site parking is provided: <a href={siteConfig.links.location} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Khao Yai Art Forest</a>.</>}
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </div>
    );
}
