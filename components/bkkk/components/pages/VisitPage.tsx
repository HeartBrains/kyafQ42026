'use client';
import { ASSETS } from '@/utils/assets';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { VisitInfo } from './sections/VisitInfo';

export function VisitPage() {
    return (
        <div className="w-full bg-white pb-24 min-h-screen">
            {/* Hero Section */}
            <ParallaxHero 
                image="https://irp.cdn-website.com/5516674f/dms3rep/multi/Puma_cover-for-about.jpg"
                height="h-[60vh] min-h-[60vh] max-h-[60vh]"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
            </ParallaxHero>

            {/* Content */}
            <div className="w-full px-[5%] pt-[96px] pb-[0px]">
                <VisitInfo />
            </div>
        </div>
    );
}
