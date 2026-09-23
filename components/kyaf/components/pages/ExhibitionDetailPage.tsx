// @ts-nocheck
'use client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RichContent } from '@/utils/richContent';
import { useLanguage } from '@/utils/languageContext';
import { useKyafExhibitionBySlug } from '@/lib/useWPData';
import { Reveal } from '../ui/Reveal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '../ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useScrollHide } from '@/utils/useScrollHide';
import { VideoPlayerEmbed } from '@/components/shared/VideoPlayerEmbed';
import { RelatedContentSection } from '@/components/shared/RelatedContentSection';

interface ExhibitionDetailPageProps {
  onNavigate: (page: string) => void;
  slug?: string;
  backPage?: string;
}

export function ExhibitionDetailPage({ onNavigate, slug, backPage }: ExhibitionDetailPageProps) {
  const { language, t } = useLanguage();
  const { data: exhibitionData, loading, error } = useKyafExhibitionBySlug(slug ?? '');
  const { isScrolling } = useScrollHide();

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  // Carousel logic
  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  const scrollTo = (index: number) => api?.scrollTo(index);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans">{t('common.loading')}</div>;
  if (error || !exhibitionData) return <div className="min-h-screen flex items-center justify-center font-sans text-red-500">{language === 'th' ? 'ไม่พบนิทรรศการ' : 'Exhibition not found.'}</div>;

  // Use gallery from exhibition data or fallback to featured image
  const galleryImages = exhibitionData?.gallery && exhibitionData.gallery.length > 0
    ? exhibitionData.gallery
    : exhibitionData?.featuredImage ? [exhibitionData.featuredImage] : [];

  // Content from WP
  const detailContent = language === 'th'
    ? (exhibitionData?.content?.th || exhibitionData?.content?.en)
    : exhibitionData?.content?.en;

  return (
    <div className="w-full bg-white pb-24 min-h-screen">
       {/* Hero Section */}
       <div className="w-full relative overflow-hidden group bg-black">
         {galleryImages.length > 0 ? (
             <Carousel
                setApi={setApi}
                plugins={[plugin.current]}
                className="w-full"
                opts={{ align: "start", loop: true }}
             >
                <CarouselContent className="-ml-0">
                   {galleryImages.map((src, index) => (
                      <CarouselItem key={index} className="pl-0">
                         <ImageWithFallback
                            src={src}
                            alt={`${exhibitionData.title} Gallery ${index + 1}`}
                            className="w-full h-auto min-h-[50vh] max-h-[80vh] block opacity-90 object-cover"
                         />
                      </CarouselItem>
                   ))}
                </CarouselContent>
                
                {galleryImages.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <CarouselPrevious className="pointer-events-auto static transform-none h-12 w-12 bg-black/30 hover:bg-black/50 border-none text-white" />
                        <CarouselNext className="pointer-events-auto static transform-none h-12 w-12 bg-black/30 hover:bg-black/50 border-none text-white" />
                    </div>
                )}
             </Carousel>
         ) : (
             <div className="w-full h-[50vh] bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">
                    {language === 'th' ? 'ไม่มีรูปภาพ' : 'No images available'}
                </span>
             </div>
         )}

         {/* Dot Navigation */}
         {galleryImages.length > 1 && (
             <div className="absolute bottom-8 right-6 md:right-[5%] z-20 flex gap-2">
                {galleryImages.map((_, index) => (
                   <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                         current === index 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                   />
                ))}
             </div>
         )}

         {/* Gradient Overlay */}
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

         {/* Back Button */}
         <div className="absolute bottom-8 left-6 md:left-12 z-20">
            <button 
                onClick={() => onNavigate(backPage || 'exhibitions')}
                className={`static flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm ${
                    isScrolling ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium font-sans">
                    {backPage === 'home'
                        ? (language === 'th' ? 'กลับสู่หน้าหลัก' : 'Back to Home')
                        : backPage === 'archives' 
                        ? (language === 'th' ? 'กลับสู่คลังข้อมูล' : 'Back to Archives') 
                        : (language === 'th' ? 'กลับสู่ผลงานศิลปะ' : 'Back to Artworks')
                    }
                </span>
            </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[6vw] pt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-16">
            
            {/* Left Column - Meta Data */}
            <div className="flex flex-col gap-4">
                <Reveal>
                    <div className="flex flex-col gap-1">
                        <h1 className={`text-xl md:text-2xl font-bold text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            {language === 'th' ? exhibitionData.title.th : exhibitionData.title.en}
                        </h1>
                        
                        {exhibitionData.artist && (
                            <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                {language === 'th' ? exhibitionData.artist.th : exhibitionData.artist.en}
                            </p>
                        )}

                        {exhibitionData.dateDisplay && (() => {
                            const d = language === 'th' ? exhibitionData.dateDisplay.th : exhibitionData.dateDisplay.en;
                            return d.split(',').map((part: string, i: number) => (
                                <p key={i} className={`text-xl md:text-2xl text-black font-normal leading-tight mt-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{part.trim()}</p>
                            ));
                        })()}
                    </div>
                </Reveal>

                {/* Additional Info (Specifications, Location, etc.) */}
                {exhibitionData.additionalInfo && (
                    <Reveal delay={0.1}>
                        <div className="text-base md:text-lg text-black font-normal leading-relaxed">
                            <RichContent content={exhibitionData.additionalInfo} />
                        </div>
                    </Reveal>
                )}

                {/* Curated by */}
                {exhibitionData.curator?.en && (
                    <Reveal delay={0.12}>
                        <p className={`text-xl md:text-2xl text-black font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                            Curated by {language === 'th' ? (exhibitionData.curator.th || exhibitionData.curator.en) : exhibitionData.curator.en}
                        </p>
                    </Reveal>
                )}

                {/* CTA Left — below additional info */}
                {exhibitionData.ctaLeft?.url && exhibitionData.ctaLeft?.label && (
                    <Reveal delay={0.13}>
                        <div className="mt-4">
                            <a href={exhibitionData.ctaLeft.url} target="_blank" rel="noopener noreferrer"
                                className="inline-block text-xl md:text-2xl text-black underline font-bold leading-tight">
                                {exhibitionData.ctaLeft.label}
                            </a>
                        </div>
                    </Reveal>
                )}

            </div>

            {/* Right Column - Text Content */}
            <div className={`text-xl md:text-2xl text-black font-normal leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                <Reveal delay={0.2}>
                    <RichContent content={detailContent || ''} />
                </Reveal>
                {exhibitionData.ctaRight?.url && exhibitionData.ctaRight?.label && (
                    <Reveal delay={0.25}>
                        <div className="mt-8">
                            <a href={exhibitionData.ctaRight.url} target="_blank" rel="noopener noreferrer"
                                className="inline-block text-xl md:text-2xl text-black underline font-bold leading-tight">
                                {exhibitionData.ctaRight.label}
                            </a>
                        </div>
                    </Reveal>
                )}
                {exhibitionData.imageCredits && (
                    <Reveal delay={0.3}>
                        <div className="mt-8">
                            {exhibitionData.imageCredits.split('\n').map((line, i) => {
                                const text = line.replace(/\|$/, '').trim();
                                return text ? <p key={i} className="text-gray-500 text-[12px]">{text}</p> : null;
                            })}
                        </div>
                    </Reveal>
                )}
            </div>
        </div>
        <VideoPlayerEmbed url={exhibitionData.videoEmbedUrl} title={`${language === 'th' ? exhibitionData.title.th : exhibitionData.title.en} video`} />
        <RelatedContentSection items={exhibitionData.relatedContent} currentId={exhibitionData.id} site="kyaf" language={language} />
      </div>
    </div>
  );
}
