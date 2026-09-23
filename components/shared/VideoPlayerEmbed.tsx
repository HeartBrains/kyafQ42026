'use client';

import { useMemo, useState } from 'react';

interface VideoPlayerEmbedProps {
  url?: string;
  title: string;
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

export function VideoPlayerEmbed({ url, title }: VideoPlayerEmbedProps) {
  const [consented, setConsented] = useState(false);
  const embedUrl = useMemo(() => url ? safeEmbedUrl(url) : null, [url]);
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
            onClick={() => setConsented(true)}
            className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 bg-black text-white"
            aria-label={`Play ${title}`}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white text-3xl" aria-hidden="true">▶</span>
            <span>Play video</span>
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
