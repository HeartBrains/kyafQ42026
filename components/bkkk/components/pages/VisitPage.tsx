'use client';
import { ASSETS } from '@/utils/assets';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { VisitInfo } from './sections/VisitInfo';
import { useCovers } from '@/lib/coversContext';
import { BKKK_VISIT_HERO_IMAGE } from '@/utils/imageConstants';

export function VisitPage() {
    const covers = useCovers();
    return (
        <div className="w-full bg-white pb-24 min-h-screen">
            {/* Hero Section */}
            <ParallaxHero 
                image={covers.visit || BKKK_VISIT_HERO_IMAGE}
                height="h-[60vh] min-h-[60vh] max-h-[60vh] md:h-[80vh] md:min-h-[80vh] md:max-h-[80vh]"
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
