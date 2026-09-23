import type { Metadata } from 'next';
import { LandingClient } from './landing-client';
import { GtagConversionEvent } from '@/components/GtagConversionEvent';

const SITE_URL = (process.env.SITE_URL ?? 'https://dev.khaoyaiart.org').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Bangkok Kunsthalle / Khao Yai Art Forest',
  description: 'Two contemporary art spaces in Thailand — Bangkok Kunsthalle in Bangkok and Khao Yai Art Forest in Khao Yai.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Bangkok Kunsthalle / Khao Yai Art Forest',
    description: 'Two contemporary art spaces in Thailand — Bangkok Kunsthalle in Bangkok and Khao Yai Art Forest in Khao Yai.',
    url: SITE_URL,
    siteName: 'Bangkok Kunsthalle / Khao Yai Art Forest',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/og-landing.jpg`, width: 1200, height: 630, alt: 'Bangkok Kunsthalle / Khao Yai Art Forest' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bangkok Kunsthalle / Khao Yai Art Forest',
    description: 'Two contemporary art spaces in Thailand — Bangkok Kunsthalle in Bangkok and Khao Yai Art Forest in Khao Yai.',
    images: [`${SITE_URL}/og-landing.jpg`],
  },
};

export default function Page() {
  return (
    <>
      <GtagConversionEvent />
      <LandingClient />
    </>
  );
}
