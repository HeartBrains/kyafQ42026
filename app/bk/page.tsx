import type { Metadata } from 'next';
import { BKKK_BASE_URL, bkkkMetadata } from '@/lib/seo';
import { JsonLd, organizationJsonLd } from '@/lib/JsonLd';
import { ClientPage } from '@/components/bkkk/ClientPage';

export const metadata: Metadata = bkkkMetadata('Bangkok Kunsthalle', 'Bangkok Kunsthalle is a contemporary art space in Bangkok, Thailand, presenting exhibitions, moving image programmes, and public activities.', { path: '/bk' });

export default function Page() {
  return (
    <>
      <JsonLd data={organizationJsonLd({
        name: 'Bangkok Kunsthalle',
        url: BKKK_BASE_URL,
        description: 'Contemporary art space in Bangkok, Thailand.',
        address: 'Bangkok, Thailand',
        sameAs: ['https://www.instagram.com/bangkokkunsthalle'],
      })} />
      <ClientPage site="bkkk" component="HomePage" />
    </>
  );
}
