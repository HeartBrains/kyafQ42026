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

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setDidError(true)
    // Call parent's onError handler if provided
    if (props.onError) {
      props.onError(e)
    }
  }

  const { src, alt, style, className, hoverSrc, onMouseEnter, loading, decoding, fetchPriority, ...rest } = props
  const showHoverImage = Boolean(hoverSrc && hoverSrc !== src && !hoverDidError)
  const featuredClassName = `${className ?? ''}${showHoverImage ? ' relative z-10 transition-opacity duration-500 group-hover:opacity-0' : ''}`
  const requestHoverImage = () => {
    if (showHoverImage) setHoverRequested(true)
  }
  const handleMouseEnter = (event: React.MouseEvent<HTMLImageElement>) => {
    requestHoverImage()
    onMouseEnter?.(event)
  }

  const featuredImage = didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${featuredClassName}`}
      style={style}
      onMouseEnter={requestHoverImage}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" className="w-full h-full object-cover" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={featuredClassName} style={style} {...rest}
      loading={hoverSrc ? loading ?? 'lazy' : loading}
      decoding={hoverSrc ? decoding ?? 'async' : decoding}
      fetchPriority={hoverSrc ? fetchPriority ?? 'low' : fetchPriority}
      onMouseEnter={handleMouseEnter}
      onError={handleError}
    />
  )

  return showHoverImage ? (
    <>
      {featuredImage}
      {hoverRequested && (
        <img
          src={hoverSrc}
          alt=""
          aria-hidden="true"
          className={`${className ?? ''} absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
          style={style}
          {...rest}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={() => setHoverDidError(true)}
        />
      )}
    </>
  ) : featuredImage
}
