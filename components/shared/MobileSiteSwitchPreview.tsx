'use client';

import Image from 'next/image';
import type { RefObject } from 'react';
import type { SiteSwitchDestination } from './useSiteSwitchPreview';

interface MobileSiteSwitchPreviewProps {
  site: SiteSwitchDestination;
  href: string;
  logoSrc: string;
  logoAlt: string;
  width: number;
  height: number;
  linkRef: RefObject<HTMLAnchorElement | null>;
  onDismiss: () => void;
}

/**
 * Mobile-only site switch state. The menu trigger is a state toggle; tapping
 * anywhere outside the destination wordmark returns to the normal menu.
 */
export function MobileSiteSwitchPreview({
  site,
  href,
  logoSrc,
  logoAlt,
  width,
  height,
  linkRef,
  onDismiss,
}: MobileSiteSwitchPreviewProps) {
  return (
    <div
      id={`${site}-mobile-site-switch-preview`}
      className="fixed inset-0 z-20 flex cursor-default items-center justify-center md:hidden"
      role="dialog"
      aria-label={`${logoAlt} preview`}
      onClick={onDismiss}
    >
      <a
        ref={linkRef}
        href={href}
        aria-label={`Open ${logoAlt}`}
        onClick={(event) => event.stopPropagation()}
        className="block w-[min(78vw,22rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <Image
          src={logoSrc}
          alt=""
          width={width}
          height={height}
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="block h-auto w-full object-contain"
        />
      </a>
    </div>
  );
}
