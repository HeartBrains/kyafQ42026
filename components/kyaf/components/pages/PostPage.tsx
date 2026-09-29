'use client';
import { ASSETS } from '@/utils/assets';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ArrowLeft } from 'lucide-react';
import { ParallaxHero } from '../ui/ParallaxHero';
import { useScrollHide } from '@/utils/useScrollHide';

interface PostPageProps {
  onNavigate: (page: string) => void;
}

export function PostPage({ onNavigate }: PostPageProps) {
    const { isScrolling } = useScrollHide();
    
    return (
        <div className="w-full bg-white pb-24 min-h-screen">
            {/* Hero Section */}
             <ParallaxHero 
                image={ASSETS.POST_HERO}
                height="h-[80vh]"
             >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-6 md:left-12 z-20">
                    <button 
                        onClick={() => onNavigate('home')}
                        className={`static flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm ${
                            isScrolling ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium font-sans">Back to Home</span>
                    </button>
                </div>
             </ParallaxHero>

            {/* Content */}
            <div className="w-full px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-8">
                     {/* Left Column - Meta */}
                     <div className="md:col-span-5 flex flex-col gap-8">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl md:text-2xl font-bold text-black leading-tight">
                                Which mirrors quality of artworks chosen to be exhibited there.
                            </h1>
                            <p className="text-xl md:text-2xl text-black font-normal leading-tight mt-2">Posted: 01 Oct 2025</p>
                        </div>
                     </div>

                     {/* Right Column - Body */}
                     <div className="md:col-start-6 md:col-span-7 text-xl md:text-2xl text-black font-normal leading-tight space-y-6">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus efficitur in est eu ullamcorper. Nam aliquet, ligula sit amet ullamcorper venenatis, leo dolor lacinia magna, sodales convallis tortor augue viverra est. Nulla facilisi. Phasellus id justo eu metus pretium posuere ut viverra nibh. Phasellus elementum nisl nec erat volutpat, id porta lacus iaculis. Phasellus et ullamcorper turpis, eget porttitor tellus.
                        </p>
                        <p>
                            Duis vitae nulla sed nunc euismod sollicitudin eu at nisl. Sed malesuada facilisis augue id imperdiet. Nulla vestibulum mollis mi, vel sollicitudin nisl congue nec. Praesent id augue eget enim viverra fermentum eget id diam. Etiam libero eros, rhoncus sed interdum in, commodo quis nulla. Nulla quis hendrerit ligula.
                        </p>
                        <p>
                            Nullam at massa pretium augue egestas vestibulum nec eu tellus. In hac habitasse platea dictumst. In et consequat magna. Integer rutrum, mauris non congue molestie, nisl felis volutpat lectus, eget posuere velit neque eu nunc. Nullam ut tortor vitae dui blandit laoreet. Integer vestibulum ex risus, vitae finibus sem sagittis quis. Maecenas semper tincidunt ex. Donec est magna, egestas non erat ac, sodales varius nunc. Donec tincidunt hendrerit bibendum. Aenean sit amet nisl lacus.
                        </p>
                        <p>
                            Cras ullamcorper suscipit turpis quis euismod. Vivamus suscipit sapien sit amet elit tincidunt tincidunt in at libero. Proin aliquet nec mauris sit amet dignissim. Ut felis nisi, viverra sed elementum quis, blandit eu felis. Suspendisse mollis augue eget bibendum laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec volutpat hendrerit tempus.
                        </p>
                        <p>
                            Proin quis ante a massa ultrices lobortis ac ac nibh. Morbi urna metus, interdum non egestas nec, tempor sed justo. Nullam id dui in erat porta tristique. Fusce dictum rutrum magna eget sollicitudin. Duis eleifend egestas felis et placerat. Donec auctor finibus vehicula. Fusce commodo risus vitae augue tincidunt, a accumsan nisl mollis.
                        </p>
                     </div>
                </div>
            </div>
        </div>
    );
}
