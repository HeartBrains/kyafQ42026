import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/utils/languageContext';

const SITE_URL = (process.env.SITE_URL ?? 'https://dev.khaoyaiart.org').replace(/\/$/, '');
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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WQ7XV4Q7');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WQ7XV4Q7"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
