'use client';
const imgProduct = '/assets/b602c6fcb8c0e0c94fac7732e44d0776b18060a0.png';
import { ASSETS } from '@/utils/assets';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useState } from 'react';
import { useLanguage } from '@/utils/languageContext';
import { getTranslation } from '@/utils/translations';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

interface ShopPageProps {
  onNavigate?: (page: string) => void;
}

export function ShopPage({ onNavigate }: ShopPageProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'products' | 'bookings'>('bookings');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Mock data for products with Unsplash images
  const products = [
    { id: 1, name: 'Ceramic Sculpture', nameTH: 'ประติมากรรมเซรามิก', image: 'https://images.unsplash.com/photo-1706821856764-4e85de5482d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNlcmFtaWMlMjBzY3VscHR1cmV8ZW58MXx8fHwxNzcwNDczNDcxfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 2, name: 'Minimalist Object', nameTH: 'วัตถุมินิมอล', image: 'https://images.unsplash.com/photo-1760716478620-2c2eb0570143?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0JTIwb2JqZWN0fGVufDF8fHx8MTc3MDQ3MzQ3MXww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 3, name: 'Modern Art Book', nameTH: 'หนังสือศิลปะร่วมสมัย', image: 'https://images.unsplash.com/photo-1652023532246-f0286471e805?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBib29rfGVufDF8fHx8MTc3MDQ3MzQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 4, name: 'Art Print', nameTH: 'ภาพพิมพ์ศิลปะ', image: 'https://images.unsplash.com/photo-1734549097855-9987c39ce651?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBwcmludHxlbnwxfHx8fDE3NzA0NzM0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 5, name: 'Wooden Sculpture', nameTH: 'งานแกะสลักไม้', image: 'https://images.unsplash.com/photo-1617326573844-9d5dfb13b864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBtaW5pbWFsaXN0JTIwc2N1bHB0dXJlfGVufDF8fHx8MTc3MDQ3MzQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 6, name: 'Metal Artifact', nameTH: 'งานโลหะ', image: 'https://images.unsplash.com/photo-1755547721520-22c2ea069bbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMGFydCUyMG9iamVjdHxlbnwxfHx8fDE3NzA0NzM0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 7, name: 'Glass Vase', nameTH: 'แจกันแก้ว', image: 'https://images.unsplash.com/photo-1759269105804-389844cc7fdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbGFzcyUyMGFydCUyMHZhc2V8ZW58MXx8fHwxNzcwNDczNDczfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 8, name: 'Geometric Wall Art', nameTH: 'ศิลปะผนังเรขาคณิต', image: 'https://images.unsplash.com/photo-1692530943891-589e88b780a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjB3YWxsJTIwYXJ0fGVufDF8fHx8MTc3MDQ3MzQ3M3ww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 9, name: 'Textile Art', nameTH: 'ศิลปะสิ่งทอ', image: 'https://images.unsplash.com/photo-1770117663224-85dd3e1b1af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRleHRpbGUlMjBhcnR8ZW58MXx8fHwxNzcwNDYyNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 10, name: 'Canvas Painting', nameTH: 'ภาพวาดบนผ้าใบ', image: 'https://images.unsplash.com/photo-1548685913-fe6678babe8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0dXJlZCUyMGNhbnZhcyUyMHBhaW50aW5nfGVufDF8fHx8MTc3MDQ3MzQ3M3ww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 11, name: 'Minimalist Pottery', nameTH: 'เครื่องปั้นดินเผา', image: 'https://images.unsplash.com/photo-1765329843964-5968a383fa4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcG90dGVyeXxlbnwxfHx8fDE3NzA0NzM0NzN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 12, name: 'Stone Object', nameTH: 'วัตถุหิน', image: 'https://images.unsplash.com/photo-1770413186060-1dca08a62e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9uZSUyMGFydCUyMG9iamVjdHxlbnwxfHx8fDE3NzA0NzM0NzN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 13, name: 'Bronze Sculpture', nameTH: 'ประติมากรรมสำริด', image: 'https://images.unsplash.com/photo-1699437110121-5b1ec9155868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9uemUlMjBzY3VscHR1cmUlMjBhcnR8ZW58MXx8fHwxNzcwNDczNDczfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  ];

  // Mock data for bookings
  const bookings = [
    { id: 1, name: 'Workshop Booking', nameTH: 'จองเวิร์กช็อป', price: '฿1500', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
    { id: 2, name: 'Private Tour', nameTH: 'ทัวร์ส่วนตัว', price: '฿2500', image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
    { id: 3, name: 'Art Class', nameTH: 'ชั้นเรียนิลปะ', price: '฿1200', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  ];

  const sortOptions: { labelKey: string; value: SortOption }[] = [
      { labelKey: 'shop.newest', value: 'newest' },
      { labelKey: 'shop.priceLowHigh', value: 'price-asc' },
      { labelKey: 'shop.priceHighLow', value: 'price-desc' },
  ];

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Hero Section */}
      <ParallaxHero 
        image={imgProduct} 
        height="h-[80vh]"
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      </ParallaxHero>

      {/* Content */}
      <div className="w-full px-6 py-12 md:py-16 min-h-[800px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-8">
            
            {/* Left Sidebar: Combined Navigation & Sort */}
            <div className="md:col-span-3">
                <div className="sticky top-32 flex flex-col gap-8">
                    {/* Shop Title */}
                    <h2 className="text-xl md:text-2xl font-bold font-sans text-black">
                        {getTranslation(language, 'shop.title')}
                    </h2>
                    
                    {/* Tab Navigation */}
                    <div className="flex flex-col gap-1">
                        <button 
                            onClick={() => setActiveTab('bookings')}
                            className={`text-xl md:text-2xl font-sans transition-colors text-left cursor-pointer ${
                                activeTab === 'bookings' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {getTranslation(language, 'shop.bookings')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`text-xl md:text-2xl font-sans transition-colors text-left cursor-pointer ${
                                activeTab === 'products' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {getTranslation(language, 'shop.products')}
                        </button>
                    </div>

                    {/* Sort By Section - Only show for Products */}
                    {activeTab === 'products' && (
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl md:text-2xl font-bold text-black mb-1">
                                {getTranslation(language, 'shop.sortBy')}
                            </h3>
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value)}
                                    className={`text-left text-xl md:text-2xl font-normal leading-tight transition-colors duration-200 cursor-pointer ${
                                        sortBy === option.value ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {getTranslation(language, option.labelKey)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="md:col-start-6 md:col-span-7 w-full flex flex-col gap-24 md:pr-[19px]">
                {activeTab === 'products' ? (
                    products.map((product, index) => (
                        <div 
                            key={product.id}
                            className="flex flex-col gap-6 w-full cursor-pointer group"
                            onClick={() => onNavigate?.('contact')}
                        >
                            {/* Image with hover effect */}
                            <div className="aspect-[3/4] w-full overflow-hidden">
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                    fetchPriority="low"
                                />
                            </div>
                            
                            {/* Info */}
                            <h3 className={`text-xl md:text-2xl font-bold font-sans text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>
                                {language === 'th' ? product.nameTH : product.name}
                            </h3>
                        </div>
                    ))
                ) : (
                    bookings.map((booking, index) => (
                        <div key={booking.id} className="flex flex-col gap-6 w-full group">
                            {/* Image */}
                            <div className="aspect-[3/4] w-full bg-gray-200 overflow-hidden">
                                 <img 
                                    src={booking.image} 
                                    alt={booking.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                    fetchPriority="low"
                                />
                            </div>
                            
                            {/* Info */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`text-xl md:text-2xl font-bold font-sans text-black ${language === 'th' ? 'leading-[1.82em]' : ''}`}>{language === 'th' ? booking.nameTH : booking.name}</h3>
                                <span className="text-xl md:text-2xl font-normal font-sans text-black">{booking.price}</span>
                            </div>
                            
                            <button 
                                className={`border border-black px-4 py-2 text-lg font-sans text-black hover:bg-black hover:text-white transition-colors cursor-pointer w-fit ${language === 'th' ? 'leading-[1.82em]' : ''}`}
                                onClick={() => onNavigate?.('contact')}
                            >
                                {getTranslation(language, 'shop.bookTicket')}
                            </button>
                        </div>
                    ))
                )}
            </div>

        </div>
      </div>
    </div>
  );
}
