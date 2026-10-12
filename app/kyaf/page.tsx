import type { Metadata } from 'next';
import { KYAF_BASE_URL, kyafMetadata } from '@/lib/seo';
import { JsonLd, organizationJsonLd } from '@/lib/JsonLd';
import { ClientPage } from '@/components/kyaf/ClientPage';

export const metadata: Metadata = kyafMetadata('Khao Yai Art Forest', 'Khao Yai Art Forest is a contemporary art space set in the forests of Khao Yai, Thailand, presenting exhibitions, residencies, and public programmes.', { path: '/kyaf' });

export default function Page() {
  return (
    <>
      <JsonLd data={organizationJsonLd({
        name: 'Khao Yai Art Forest',
        url: KYAF_BASE_URL,
        description: 'Contemporary art space in the forests of Khao Yai, Thailand.',
        address: 'Khao Yai, Thailand',
        sameAs: ['https://www.instagram.com/khaoyaiartforest'],
      })} />
      <ClientPage site="kyaf" component="HomePage" />
    </>
  );
}
