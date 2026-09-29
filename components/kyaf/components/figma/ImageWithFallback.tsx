'use client';
import React, { useState } from 'react'

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  hoverSrc?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [hoverDidError, setHoverDidError] = useState(false)
  const [hoverRequested, setHoverRequested] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, hoverSrc, onMouseEnter, loading, decoding, fetchPriority, ...rest } = props
  const showHoverImage = Boolean(hoverSrc && hoverSrc !== src && !hoverDidError)
  const requestHoverImage = () => {
    if (showHoverImage) {
      setHoverRequested(true)
      setIsHovered(true)
    }
  }
  const handleMouseEnter = (event: React.MouseEvent<HTMLImageElement>) => {
    requestHoverImage()
    onMouseEnter?.(event)
  }

  const featuredStyle = showHoverImage
    ? { ...style, opacity: isHovered ? 0 : 1, transition: 'opacity 500ms ease' }
    : style
  const featuredClassName = showHoverImage
    // Keep the primary image in normal flow so images without a fixed-ratio
    // parent (for example, team profile records) still define the wrapper size.
    ? `${className ?? ''} relative z-10`
    : className

  const featuredImage = didError ? (
    <div
      className={`inline-block bg-gray-400 text-center align-middle ${featuredClassName}`}
      style={featuredStyle}
      data-original-url={src}
      aria-label={alt || 'Image failed to load'}
      onMouseEnter={requestHoverImage}
    />
  ) : (
    <img src={src} alt={alt} className={featuredClassName} style={featuredStyle} {...rest}
      loading={hoverSrc ? loading ?? 'lazy' : loading}
      decoding={hoverSrc ? decoding ?? 'async' : decoding}
      fetchPriority={hoverSrc ? fetchPriority ?? 'low' : fetchPriority}
      onMouseEnter={handleMouseEnter}
      onError={handleError}
    />
  )

  if (!showHoverImage) return featuredImage

  return (
    <span
      className="relative block h-full w-full overflow-hidden"
      onMouseEnter={requestHoverImage}
      onMouseLeave={() => setIsHovered(false)}
    >
      {featuredImage}
      {hoverRequested && (
        <img
          src={hoverSrc}
          alt=""
          aria-hidden="true"
          className={`${className ?? ''} absolute inset-0 z-20`}
          style={{ ...style, opacity: isHovered ? 1 : 0, transition: 'opacity 500ms ease', pointerEvents: 'none' }}
          {...rest}
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onError={() => setHoverDidError(true)}
        />
      )}
    </span>
  )
}
