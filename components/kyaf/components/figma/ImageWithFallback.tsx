'use client';
import React, { useState } from 'react'

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  hoverSrc?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [hoverDidError, setHoverDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, hoverSrc, ...rest } = props
  const showHoverImage = Boolean(hoverSrc && hoverSrc !== src && !hoverDidError)
  const featuredClassName = `${className ?? ''}${showHoverImage ? ' relative z-10 transition-opacity duration-500 group-hover:opacity-0' : ''}`

  const featuredImage = didError ? (
    <div
      className={`inline-block bg-gray-400 text-center align-middle ${featuredClassName}`}
      style={style}
      data-original-url={src}
      aria-label={alt || 'Image failed to load'}
    />
  ) : (
    <img src={src} alt={alt} className={featuredClassName} style={style} {...rest} onError={handleError} />
  )

  return showHoverImage ? (
    <>
      {featuredImage}
      <img
        src={hoverSrc}
        alt=""
        aria-hidden="true"
        className={`${className ?? ''} absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        style={style}
        {...rest}
        onError={() => setHoverDidError(true)}
      />
    </>
  ) : featuredImage
}
