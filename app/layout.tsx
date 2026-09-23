import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { LanguageProvider } from '@/utils/languageContext';

const SITE_URL = (process.env.SITE_URL ?? 'https://dev.khaoyaiart.org').replace(/\/$/, '');
const TRACKING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TRACKING === 'true';
const INDEXING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export const metadata: Metadata = {
  title: {
    default: 'Bangkok Kunsthalle / Khao Yai Art Forest',
    template: '%s | Bangkok Kunsthalle / Khao Yai Art Forest',
  },
  description: 'Two contemporary art spaces in Thailand — Bangkok Kunsthalle in Bangkok and Khao Yai Art Forest in Khao Yai.',
  metadataBase: new URL(SITE_URL),
  keywords: ['Bangkok Kunsthalle', 'Khao Yai Art Forest', 'contemporary art', 'Thailand', 'art gallery', 'exhibitions'],
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
  robots: { index: INDEXING_ENABLED, follow: INDEXING_ENABLED },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {TRACKING_ENABLED && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=AW-18039634862"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-18039634862');
              `}
            </Script>
          </>
        )}
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
