'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface VideoPlayerEmbedProps {
  url?: string;
  title: string;
  previewUrl?: string;
  previewMimeType?: string;
}

function safeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      if (url.pathname.startsWith('/embed/')) return `https://www.youtube-nocookie.com${url.pathname}`;
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?dnt=1` : null;
    }
    if (url.hostname === 'player.vimeo.com' && url.pathname.startsWith('/video/')) return url.toString();
    return null;
  } catch {
    return null;
  }
}

export function VideoPlayerEmbed({ url, title, previewUrl, previewMimeType }: VideoPlayerEmbedProps) {
  const [consentedUrl, setConsentedUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const consented = consentedUrl === url;
  const embedUrl = useMemo(() => url ? safeEmbedUrl(url) : null, [url]);
  const previewKind = useMemo(() => {
    if (!previewUrl || !previewMimeType) return null;
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(previewMimeType)) return 'image';
    if (['video/mp4', 'video/webm'].includes(previewMimeType)) return 'video';
    return null;
  }, [previewUrl, previewMimeType]);

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || previewKind !== 'video') return;
    if (typeof IntersectionObserver === 'undefined') {
      setPreviewVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setPreviewVisible(entry.isIntersecting);
      if (entry.isIntersecting) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.15 });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [previewKind, previewUrl]);

  if (!url) return null;

  return (
    <section className="mt-12" aria-label={title}>
      <div className="relative aspect-video w-full overflow-hidden bg-black text-white">
        {embedUrl && consented ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : embedUrl ? (
          <button
            type="button"
            onClick={() => setConsentedUrl(url ?? null)}
            className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-white ${previewKind ? 'group bg-transparent' : 'bg-black'}`}
            aria-label={`Play ${title}`}
          >
            {previewKind === 'image' && (
              <img src={previewUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 z-0 h-full w-full object-cover" />
            )}
            {previewKind === 'video' && (
              <video
                ref={previewVideoRef}
                src={previewUrl}
                muted
                loop
                playsInline
                autoPlay={previewVisible}
                preload={previewVisible ? 'metadata' : 'none'}
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 z-0 h-full w-full object-cover"
              />
            )}
            {previewKind && <span className="absolute inset-0 z-0 bg-black/20 transition-colors group-hover:bg-black/40" aria-hidden="true" />}
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-2xl" aria-hidden="true">▶</span>
            <span className="relative z-10 rounded bg-black/70 px-3 py-1">Play video</span>
          </button>
        ) : (
          <a className="absolute inset-0 flex items-center justify-center p-6 text-center underline" href={url} target="_blank" rel="noreferrer">
            Open video in a new tab
          </a>
        )}
      </div>
    </section>
  );
}
