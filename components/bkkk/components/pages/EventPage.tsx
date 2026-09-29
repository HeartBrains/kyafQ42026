'use client';
import { ASSETS } from '@/utils/assets';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ParallaxHero } from '../ui/ParallaxHero';

export function EventPage() {
  return (
    <div className="w-full bg-white pb-24 min-h-screen">
       {/* Hero Section */}
       <ParallaxHero 
         image={ASSETS.EVENT_HERO} 
         height="h-[80vh]"
       >
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none md:hidden" />
       </ParallaxHero>

      {/* Content Section */}
      <div className="w-full px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
            
            {/* Left Column - Header Info */}
            <div className="md:w-1/3">
                <h1 className="text-3xl md:text-4xl font-sans font-bold mb-2 text-black">
                    Neon Reveries
                </h1>
                <div className="text-2xl md:text-3xl font-sans text-gray-300 leading-tight mb-4">
                    Wong Kar-Wai<br/>
                    Screening Series<br/>
                    Screenings
                </div>
                <div className="text-2xl md:text-3xl font-sans text-gray-300">
                    01 Oct – 01 Nov 2025
                </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:w-2/3 flex flex-col gap-8 text-xs md:text-sm text-black leading-relaxed">
                <p>
                    This August and September, Bangkok Kunsthalle screens four Wong Kar Wai classics on Saturday nights, beginning with 'In the Mood for Love' (2000) on August 22—filmed partly in the Yaowarat neighborhood of the Kunsthalle. The series continues with 'Happy Together' (1997) on August 23, 'Chungking Express' (1994) on August 30, and 'Fallen Angels' (1995) on September 6. Moving from quiet longing to restless encounters and neon-lit nights, the films capture Wong's unforgettable vision of love, loneliness, and fleeting connection.
                </p>

                <div>
                    <h3 className="mb-4 font-normal">Filming Schedule</h3>
                    <div className="space-y-4">
                        <p>
                            'In the Mood for Love' (2000) on August 22 19.00 (one round only)<br/>
                            'Happy Together' (1997) on August 23 Round 1 at 17.00 Round 2 at 19.00<br/>
                            'Chungking Express' (1994) on August 30 Round 1 at 17.00 Round 2 at 19.00<br/>
                            'Fallen Angels' (1995) on September 6 Round 1 at 17.00 Round 2 at 19.00
                        </p>
                        <p>
                            Screenings are free! Please book in advance as there is limited seating. The program will be in Original Voice with Thai subtitles. (No English Subtitles)
                        </p>
                    </div>
                </div>

                <p className="max-w-prose">
                    We encourage you to arrive at Bangkok Kunsthalle 15-30 minutes before the screening begins. Seats not claimed by the start of the film may be released to visitors in the standby line.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
