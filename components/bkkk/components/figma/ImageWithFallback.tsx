'use client';
const image_33593f765d2a675d88ce409217db74d077b37979 = '/assets/33593f765d2a675d88ce409217db74d077b37979.png';
import React, { useState } from 'react'

const ERROR_IMG_SRC =
  image_33593f765d2a675d88ce409217db74d077b37979

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  hoverSrc?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [hoverDidError, setHoverDidError] = useState(false)
  const [hoverRequested, setHoverRequested] = useState(false)
  const [hoverLoaded, setHoverLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setDidError(true)
    // Call parent's onError handler if provided
    if (props.onError) {
      props.onError(e)
    }
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
    ? { ...style, opacity: isHovered && hoverLoaded ? 0 : 1, transition: 'opacity 500ms ease' }
    : style
  const featuredClassName = showHoverImage
    // Keep the primary image in normal flow so images without a fixed-ratio
    // parent (for example, team profile records) still define the wrapper size.
    ? `${className ?? ''} relative z-10`
    : className

  const featuredImage = didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${featuredClassName}`}
      style={featuredStyle}
      onMouseEnter={requestHoverImage}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" className="w-full h-full object-cover" {...rest} data-original-url={src} />
      </div>
    </div>
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
          style={{ ...style, opacity: isHovered && hoverLoaded ? 1 : 0, transition: 'opacity 500ms ease', pointerEvents: 'none' }}
          {...rest}
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setHoverLoaded(true)}
          onError={() => setHoverDidError(true)}
        />
      )}
    </span>
  )
}
