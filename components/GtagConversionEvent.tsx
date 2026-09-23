'use client';
import { useEffect } from 'react';

declare function gtag(...args: unknown[]): void;

export function GtagConversionEvent() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_TRACKING === 'true' && typeof gtag !== 'undefined') {
      gtag('event', 'conversion', { send_to: 'AW-18039634862/atAUCJiQl48cEK73-5lD' });
    }
  }, []);
  return null;
}
