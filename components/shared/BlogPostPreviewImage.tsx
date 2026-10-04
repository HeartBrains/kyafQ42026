'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchBlogVideoPreviewBySlug, type VideoPreviewMedia } from '@/lib/useWPData';

type BlogPostPreviewImageProps = {
  slug: string;
  site: 'bkkk' | 'kyaf';
  image: string;
  galleryImage?: string;
  alt: string;
  className?: string;
};

const previewRequests = new Map<string, Promise<VideoPreviewMedia | null>>();

function fetchPreview(slug: string, site: 'bkkk' | 'kyaf') {
  const key = `${site}:${slug}`;
  const cached = previewRequests.get(key);
  if (cached) return cached;

  const request = fetchBlogVideoPreviewBySlug(slug, site);
  previewRequests.set(key, request);
  return request;
}

export function BlogPostPreviewImage({
  slug,
  site,
  image,
  galleryImage,
  alt,
  className = 'h-full w-full object-cover',
}: BlogPostPreviewImageProps) {
  const [preview, setPreview] = useState<VideoPreviewMedia | null>(null);
  const [previewRequested, setPreviewRequested] = useState(false);
  const [previewResolved, setPreviewResolved] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const requestedRef = useRef(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const hasVideoPreview = Boolean(preview?.mimeType.startsWith('video/') && !previewFailed);
  const showFallbackGallery = previewRequested && previewResolved && (!preview || previewFailed) && Boolean(galleryImage && galleryImage !== image);

  const requestPreview = () => {
    setIsHovered(true);
    if (requestedRef.current) return;
    requestedRef.current = true;
    setPreviewRequested(true);
    void fetchPreview(slug, site).then((result) => {
      setPreview(result);
      setPreviewResolved(true);
    });
  };

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || !hasVideoPreview) return;

    if (isHovered) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      if (video.readyState > 0) video.currentTime = 0;
    }
  }, [hasVideoPreview, isHovered, preview]);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-gray-100"
      onPointerEnter={(event) => event.pointerType === 'mouse' && requestPreview()}
      onPointerLeave={() => setIsHovered(false)}
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className={`${className} transition-[opacity,transform] duration-500 ${isHovered && previewLoaded && !previewFailed ? 'opacity-0' : 'opacity-100'}`}
        />
      ) : null}

      {isHovered && preview && !hasVideoPreview && !previewFailed && (
        <img
          src={preview.url}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setPreviewLoaded(true)}
          onError={() => setPreviewFailed(true)}
          className={`${className} absolute inset-0 transition-[opacity,transform] duration-500 ${previewLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {hasVideoPreview && preview && (
        <video
          ref={previewVideoRef}
          src={preview.url}
          muted
          loop
          playsInline
          autoPlay={isHovered}
          preload={isHovered ? 'auto' : 'none'}
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={() => setPreviewLoaded(true)}
          onError={() => setPreviewFailed(true)}
          className={`${className} absolute inset-0 transition-[opacity,transform] duration-500 ${isHovered && previewLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {isHovered && showFallbackGallery && galleryImage && (
        <img
          src={galleryImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setGalleryLoaded(true)}
          className={`${className} absolute inset-0 transition-[opacity,transform] duration-500 ${galleryLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
