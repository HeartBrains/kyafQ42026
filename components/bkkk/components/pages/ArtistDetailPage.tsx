'use client';
import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ArrowLeft } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '../ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useLanguage } from '@/utils/languageContext';
import { useResidencyArtistBySlug } from '@/lib/useWPData';
import { RichContent } from '@/utils/richContent';
import { RelatedContentSection } from '@/components/shared/RelatedContentSection';

interface ArtistDetailPageProps {
  onNavigate: (page: string) => void;
  slug?: string;
}

export function ArtistDetailPage({ onNavigate, slug }: ArtistDetailPageProps) {
  const { language, t } = useLanguage();
  const { data, loading, error } = useResidencyArtistBySlug(slug ?? '');

  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans">{t('common.loading')}</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center font-sans text-red-500">{language === 'th' ? 'ไม่พบศิลปิน' : 'Artist not found.'}</div>;

  const name = language === 'th' ? data.nameTH : data.name;
  const period = language === 'th' ? (data.periodTH || data.period) : data.period;
  const bio = language === 'th' ? (data.bioTH || data.bio) : data.bio;
  const gallery = data.gallery?.length ? data.gallery : (data.featuredImage ? [data.featuredImage] : []);

  return (
    <div className="w-full bg-white pb-24 min-h-screen">
      <div className="w-full relative overflow-hidden group bg-black">
        {gallery.length > 0 ? (
          <Carousel setApi={setApi} plugins={[plugin.current]} className="w-full" opts={{ align: 'start', loop: true }}>
            <CarouselContent className="-ml-0">
              {gallery.map((src, index) => (
                <CarouselItem key={index} className="pl-0">
                  <img
                    src={src}
                    alt={`${data.name} ${index + 1}`}
                    className="w-full h-auto max-h-[80vh] object-cover block"
                    style={{ minHeight: '50vh' }}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {gallery.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <CarouselPrevious className="pointer-events-auto static transform-none h-12 w-12 bg-black/30 hover:bg-black/50 border-none text-white" />
                <CarouselNext className="pointer-events-auto static transform-none h-12 w-12 bg-black/30 hover:bg-black/50 border-none text-white" />
              </div>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">{language === 'th' ? 'ไม่มีรูปภาพ' : 'No images available'}</span>
          </div>
        )}

        {gallery.length > 1 && (
          <div className="absolute bottom-8 right-6 md:right-[5%] z-20 flex gap-2">
            {gallery.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${current === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-8 left-6 md:left-12 z-20">
          <button
            onClick={() => onNavigate('residency')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-normal font-sans whitespace-nowrap">
              {language === 'th' ? 'กลับสู่ศิลปินพำนัก' : 'Back to Residency'}
            </span>
          </button>
        </div>
      </div>

      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-8">
          <div className="md:col-span-6 flex flex-col gap-8">
            <div className="flex flex-col gap-0 px-0 md:px-[28px]">
              <h1 className={`text-xl md:text-2xl font-bold text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{name}</h1>
              {period && (
                <p className={`text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{period}</p>
              )}

              {/* CTA 1 */}
              {data.ctaLabel && data.ctaUrl && (
                <a
                  href={data.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-sm font-normal text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
                >
                  {data.ctaLabel}
                </a>
              )}

              {/* Additional Info */}
              {data.additionalInfo && (
                <div className={`text-sm font-normal text-gray-500 mt-6 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                  {data.additionalInfo}
                </div>
              )}


            </div>
          </div>
          <div className={`md:col-start-7 md:col-span-6 text-xl md:text-2xl font-normal text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
            {bio && <div className="[&>p]:mb-8"><RichContent content={bio} /></div>}

            {/* CTA 2 */}
            {data.cta2Label && data.cta2Url && (
              <a
                href={data.cta2Url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block text-sm font-normal text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
              >
                {data.cta2Label}
              </a>
            )}
            {data.imageCredits && (
              <div className="mt-8">
                {data.imageCredits.split('\n').map((line, i) => {
                  const text = line.replace(/\|$/, '').trim();
                  return text ? <p key={i} className="text-gray-500 text-[12px]">{text}</p> : null;
                })}
              </div>
            )}
          </div>
        </div>
        <RelatedContentSection items={data.relatedContent} currentId={String(data.id)} site="bkkk" language={language} />
      </div>
    </div>
  );
}
