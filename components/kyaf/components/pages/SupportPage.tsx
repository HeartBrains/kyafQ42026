'use client';

import { HeroSlider } from '../ui/HeroSlider';
import { Reveal } from '../ui/Reveal';
import { useLanguage } from '@/utils/languageContext';
import { PUBLIC_WP_ORIGIN } from '@/lib/wp-origin';

const PARTNERS = [
    { name: 'The Fine Arts Department', nameTh: 'กรมศิลปากร', short: 'FAD', bgPos: '0% 0%' },
    { name: 'Ministry of Culture', nameTh: 'กระทรวงวัฒนธรรม', short: 'MOC', bgPos: '100% 0%' },
    { name: 'C.P. Group', nameTh: 'กลุ่มเครือเจริญโภคภัณฑ์', short: 'C.P.', bgPos: '0% 33.3333%' },
    { name: 'True Corporation', nameTh: 'ทรู คอร์ปอเรชั่น', short: 'true', bgPos: '100% 33.3333%' },
    { name: 'Tourism Authority of Thailand', nameTh: 'การท่องเที่ยวแห่งประเทศไทย', short: 'TAT', bgPos: '0% 66.6666%' },
    { name: 'Chef Cares', nameTh: 'เชฟแคร์ส', short: 'Chef Cares', bgPos: '100% 66.6666%' },
    { name: 'Thai Airways', nameTh: 'การบินไทย', short: 'THAI', bgPos: '0% 100%' },
    { name: 'Eden Estate', nameTh: 'อีเดน เอสเตท', short: 'EDEN', bgPos: '100% 100%' },
];

export function SupportPage() {
    const { language } = useLanguage();
    
    return (
        <div className="w-full bg-white pb-24 min-h-screen">
            {/* Hero Section */}
            <HeroSlider
                images={[
                    `${PUBLIC_WP_ORIGIN}/wp-content/uploads/2026/03/Puma_Z8A_8030-1.jpg`,
                    `${PUBLIC_WP_ORIGIN}/wp-content/uploads/2026/03/Puma_Z8A_8323-1.jpg`,
                ]}
                height="h-[80vh]"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
            </HeroSlider>

            {/* Content */}
            <div className="w-full px-[6vw] pt-[96px] pb-[0px]">
                <div className="flex flex-col md:flex-row mb-32 md:mb-40">

                    {/* Left — sticky heading */}
                    <div className="w-full md:w-1/2 mb-12 md:mb-0">
                        <h1 className="text-xl md:text-2xl font-normal sticky top-32">
                            {language === 'th' ? 'สนับสนุนเรา' : 'Support Us'}
                        </h1>
                    </div>

                    {/* Right — all content */}
                    <div className="w-full md:w-1/2 flex flex-col gap-8">
                        <Reveal>
                            <p className={`text-xl md:text-2xl font-normal text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                Cultivating Art. Connecting Worlds.
                            </p>
                            <p className={`text-xl md:text-2xl font-normal text-black mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                From forest to city, a living dialogue unfolds.
                            </p>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <p className={`text-xl md:text-2xl font-normal text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                We warmly invite you to support Khao Yai Art Social Enterprise, an institute for contemporary and experimental practices across Bangkok Kunsthalle and Khao Yai Art Forest, enriching Thailand's cultural landscape and extending its resonance beyond borders.
                            </p>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <p className={`text-xl md:text-2xl font-normal text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                If you wish to donate, please proceed via bank transfer using the QR code or bank details below and send proof of payment to:{' '}
                                <a href="mailto:membership@khaoyaiart.com" className="underline underline-offset-4 hover:opacity-60 transition-opacity">membership@khaoyaiart.com</a>
                            </p>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div className="flex flex-col gap-4">
                                <p className={`text-xl md:text-2xl font-normal text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                    Bank details:
                                </p>
                                <img
                                    src={`${PUBLIC_WP_ORIGIN}/wp-content/uploads/2026/03/Screenshot_20260322-195733.png`}
                                    alt="Donation QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                                <div className={`text-xl md:text-2xl font-normal text-black flex flex-col gap-1 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                    <p>Bank Name: Siam Commercial Bank Public Company Limited</p>
                                    <p>Account Name: Khaoyai Art Social Enterprise Co., Ltd</p>
                                    <p>Account Number: 168-231447-3</p>
                                    <p>Bank Branch: CP Tower (333 Silom Road, Bang Rak, Bangkok 10500, Thailand)</p>
                                    <p>SWIFT Code: SICOTHBK</p>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={0.25}>
                            <p className={`text-xl md:text-2xl font-normal text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                We are profoundly grateful for your generosity. It is through your belief in our mission that Khao Yai Art can continue to thrive as a lasting, vibrant cultural home for everyone.
                            </p>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <p className={`text-xl md:text-2xl font-normal text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                For any enquiries or to explore further involvement, please do not hesitate to contact us at{' '}
                                <a href="mailto:claudia.k@khaoyaiart.com" className="underline underline-offset-4 hover:opacity-60 transition-opacity">claudia.k@khaoyaiart.com</a>.
                            </p>
                        </Reveal>
                    </div>

                </div>
            </div>
        </div>
    );
}
