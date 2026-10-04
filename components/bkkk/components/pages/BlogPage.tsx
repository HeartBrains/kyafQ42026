'use client';
import { useState, useMemo } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Reveal } from '../ui/Reveal';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useCovers } from '@/lib/coversContext';
import { useLanguage } from '@/utils/languageContext';
import { useBkkkBlogPosts } from '@/lib/useWPData';
import { IMG_FOG_SRC } from '@/utils/imageConstants';

interface BlogPageProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const { language, t } = useLanguage();
  const covers = useCovers();
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const { data: allBlogPosts } = useBkkkBlogPosts();

  // Group posts by year
  const blogsByYear = useMemo(() => {
    const grouped = allBlogPosts.reduce((acc, post) => {
      const year = post.year || '2025';
      
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    }, {} as Record<string, typeof allBlogPosts>);

    // Sort years descending
    const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));
    
    return sortedYears.map(year => ({
      year,
      posts: grouped[year].sort((a, b) => {
        // Sort posts within year by date (newest first)
        return b.date.localeCompare(a.date);
      })
    }));
  }, [allBlogPosts]);

  const years = ['all', ...blogsByYear.map(y => y.year)];

  const filteredBlogs = selectedYear === 'all' 
    ? blogsByYear 
    : blogsByYear.filter(y => y.year === selectedYear);

  return (
    <div className="w-full min-h-screen bg-white pb-24">
       {/* Hero Section */}
       <ParallaxHero 
          image={covers.blog || IMG_FOG_SRC}
          height="h-[50vh] min-h-[50vh] max-h-[50vh]"
       >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
       </ParallaxHero>

      {/* Content Section */}
      <div className="w-full mx-auto px-[6vw] pt-[96px] pb-[0px]">
        <div className="flex flex-col md:flex-row mb-32 md:mb-40">
            
            {/* Sidebar - Shows only years that are currently loaded/visible */}
            <aside className="w-full md:w-1/2 shrink-0 md:sticky md:top-32 h-fit mb-12 md:mb-0">
                <nav className="flex flex-col space-y-2">
                    <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Blog</h2>
                    {years.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`text-left text-xl md:text-2xl font-normal transition-all duration-300 cursor-pointer ${
                                selectedYear === year
                                ? 'text-black' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {year}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="w-full md:w-1/2 flex flex-col gap-12 md:gap-16">
                {filteredBlogs.map((yearGroup) => (
                    <div key={yearGroup.year} id={`year-${yearGroup.year}`} className="flex flex-col gap-12 md:gap-16">
                        {yearGroup.posts.map((post) => (
                            <Reveal key={post.id}>
                                <div 
                                    className="flex flex-col gap-6 cursor-pointer group w-full"
                                    onClick={() => onNavigate('blog-detail', post.slug)}
                                >
                                    {/* Image */}
                                    <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden relative">
                                        <ImageWithFallback 
                                            src={post.featuredImage} 
                                            hoverSrc={post.gallery?.[0]}
                                            alt={post.title[language] || post.title.en}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                            fetchPriority="low"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex flex-col gap-1">
                                        <h3 className={`text-lg md:text-xl font-bold text-black leading-tight ${language === 'th' ? 'font-sans leading-[1.82em]' : ''}`}>
                                            {post.title[language] || post.title.en}
                                        </h3>
                                        <p className={`text-lg md:text-xl font-normal text-black leading-tight ${language === 'th' ? 'font-sans leading-[1.82em]' : ''}`}>
                                            {post.date}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                ))}
            </main>

        </div>
      </div>
    </div>
  );
}
