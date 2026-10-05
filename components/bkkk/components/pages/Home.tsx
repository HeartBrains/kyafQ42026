'use client';
const homeHero = '/assets/0f2de5dba08e64ffdce936dae7d5cc24c7aeb07b.png';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const SECTIONS = [
  {
    title: "Exhibitions",
    items: [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1717758220144-aae8c59dbd7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHBhaW50aW5nJTIwY29sb3JmdWx8ZW58MXx8fHwxNzY0ODgxODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        title: "Lorem ipsum dolor sit amet consectetur",
        date: "22 Nov 2025"
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1642800672693-c9436bdfad36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jcmV0ZSUyMGZsb29yJTIwdGV4dHVyZSUyMGFydGlzdGljfGVufDF8fHx8MTc2NDg4MTg0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        title: "Lorem ipsum dolor sit amet consectetur",
        date: "22 Nov 2025"
      }
    ]
  },
  {
    title: "Activities",
    items: [
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1764103659005-b7f14d25ce1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwbGlnaHQlMjBhcnQlMjBpbnN0YWxsYXRpb24lMjBkYXJrfGVufDF8fHx8MTc2NDg4MTg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        title: "Lorem ipsum dolor sit amet consectetur",
        date: "22 Nov 2025"
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1764509091881-6c0ed39fc5c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFuZCUyMHdoaXRlJTIwc2lsaG91ZXR0ZSUyMHBlcmZvcm1hbmNlJTIwYXJ0fGVufDF8fHx8MTc2NDg4MTg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        title: "Lorem ipsum dolor sit amet consectetur",
        date: "22 Nov 2025"
      }
    ]
  },
  {
    title: "Blog",
    items: [
      {
        id: 5,
        image: "https://images.unsplash.com/photo-1720217260759-cafa6de4e46b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBjb25zZXJ2YXRpb24lMjByZXN0b3JhdGlvbiUyMHJlc3RvcmluZyUyMHBhaW50aW5nfGVufDF8fHx8MTc2NDg4MTg0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        title: "Lorem ipsum dolor sit amet consectetur",
        date: "22 Nov 2025"
      },
      {
        id: 6,
        image: "https://images.unsplash.com/photo-1760662400269-e7161cb48edf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwY3Jvd2QlMjBleGhpYml0aW9uJTIwb3JhbmdlJTIwbGlnaHR8ZW58MXx8fHwxNzY0ODgxODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        title: "Lorem ipsum dolor sit amet consectetur",
        date: "22 Nov 2025"
      }
    ]
  }
];

export function Home() {
  return (
    <div className="w-full bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] md:min-h-[80vh] md:max-h-[80vh]">
        <ImageWithFallback
          src={homeHero}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient if needed? The design looks like raw image */}
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-6 py-12 space-y-16">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-bold mb-6 tracking-wide">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {section.items.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-100">
                     <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 leading-tight max-w-[80%]">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 mt-1">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
