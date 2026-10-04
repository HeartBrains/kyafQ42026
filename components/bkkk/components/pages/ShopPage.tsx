'use client';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useState, useEffect } from 'react';
import { Reveal } from '../ui/Reveal';
import { useLanguage } from '@/utils/languageContext';
import { getTranslation } from '@/utils/translations';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

interface ShopPageProps {
  onNavigate?: (page: string) => void;
  targetSectionId?: string;
}

export function ShopPage({ onNavigate, targetSectionId }: ShopPageProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'products' | 'bookings'>('bookings');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Mock data for products
  const products = [
    { id: 1, name: 'Product 001', nameTH: 'สินค้า 001' },
    { id: 2, name: 'Product 002', nameTH: 'สินค้า 002' },
    { id: 3, name: 'Product 003', nameTH: 'สินค้า 003' },
  ];

  // Mock data for bookings
  const bookings = [
    { id: 1, name: 'Lorem Ipsum', nameTH: 'โลเร็ม อิปซัม', price: '฿0000' },
    { id: 2, name: 'Lorem Ipsum', nameTH: 'โลเร็ม อิปซัม', price: '฿0000' },
    { id: 3, name: 'Lorem Ipsum', nameTH: 'โลเร็ม อิปซัม', price: '฿0000' },
  ];

  const sortOptions: { labelKey: string; value: SortOption }[] = [
      { labelKey: 'shop.newest', value: 'newest' },
      { labelKey: 'shop.priceLowHigh', value: 'price-asc' },
      { labelKey: 'shop.priceHighLow', value: 'price-desc' },
  ];

  useEffect(() => {
    if (targetSectionId) {
      // Switch tab based on section ID
      if (targetSectionId === 'products') {
        setActiveTab('products');
      } else if (targetSectionId === 'bookings') {
        setActiveTab('bookings');
      }
      
      const element = document.getElementById(targetSectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [targetSectionId]);

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Hero Section */}
      <ParallaxHero 
        image="https://images.unsplash.com/photo-1770086962048-f42543a0ca9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBtdXNldW0lMjBzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcyOTc2NjkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
        height="h-[50vh] min-h-[50vh] max-h-[50vh]"
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
      </ParallaxHero>

      {/* Content */}
      <div className="w-full px-[5%] pt-[96px] pb-[0px]">
        <section id={activeTab === 'bookings' ? 'bookings' : 'products'} className="flex flex-col md:flex-row gap-12 md:gap-0 mb-32 md:mb-40">
            
            {/* Left Sidebar */}
            <aside className="w-full md:w-1/2 shrink-0 relative mb-12 md:mb-0">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h2 className={`text-xl md:text-2xl font-bold text-black mb-4 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{getTranslation(language, 'shop.title')}</h2>
                        <button 
                            onClick={() => setActiveTab('bookings')}
                            className={`text-xl md:text-2xl font-sans transition-colors text-left ${
                                activeTab === 'bookings' ? 'text-black font-medium' : 'text-gray-400 hover:text-black'
                            }`}
                        >
                            {getTranslation(language, 'shop.bookings')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`text-xl md:text-2xl font-sans transition-colors text-left ${
                                activeTab === 'products' ? 'text-black font-medium' : 'text-gray-400 hover:text-black'
                            }`}
                        >
                            {getTranslation(language, 'shop.products')}
                        </button>
                    </div>

                    {activeTab === 'products' && (
                        <div className="flex flex-col gap-2 items-start mt-4">
                            <h3 className={`text-xl md:text-2xl font-normal text-black text-left mb-2 ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{getTranslation(language, 'shop.sortBy')}</h3>
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value)}
                                    className={`text-left text-xl md:text-2xl font-normal leading-tight transition-colors duration-200 ${language === 'th' ? 'leading-[1.82em]' : ''} ${
                                        sortBy === option.value ? 'text-black font-medium' : 'text-gray-400 hover:text-black'
                                    }`}
                                >
                                    {getTranslation(language, option.labelKey)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="w-full md:w-1/2 flex flex-col gap-12 md:gap-16">
                    {activeTab === 'products' ? (
                        products.map((product, index) => (
                            <Reveal key={product.id} delay={index * 0.1}>
                                <div 
                                    className="flex flex-col gap-6 w-full cursor-pointer group"
                                    onClick={() => onNavigate?.('contact')}
                                >
                                    {/* Placeholder Image */}
                                    <div className="aspect-[3/4] w-full bg-gray-300" />
                                    
                                    {/* Info */}
                                    <h3 className={`text-xl md:text-2xl font-bold font-sans text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{language === 'th' ? product.nameTH : product.name}</h3>
                                </div>
                            </Reveal>
                        ))
                    ) : (
                        bookings.map((booking, index) => (
                            <Reveal key={booking.id} delay={index * 0.1}>
                                <div className="flex flex-col gap-6 w-full group">
                                    {/* Placeholder Image */}
                                    <div className="aspect-[3/4] w-full bg-gray-100" />
                                    
                                    {/* Info */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-xl md:text-2xl font-bold font-sans text-black leading-tight ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{language === 'th' ? booking.nameTH : booking.name}</h3>
                                            <span className="text-xl md:text-2xl font-normal font-sans text-black leading-tight">{booking.price}</span>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <button 
                                                className={`border border-black px-4 py-2 text-lg font-sans text-black hover:bg-black hover:text-white transition-colors cursor-pointer ${language === 'th' ? 'leading-[1.82em]' : ''}`}
                                                onClick={() => onNavigate?.('contact')}
                                            >
                                                {getTranslation(language, 'shop.bookTicket')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))
                    )}
            </main>

        </section>
      </div>
    </div>
  );
}
