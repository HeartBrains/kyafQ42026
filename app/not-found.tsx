import { getBuildCovers } from '@/lib/build-covers';
import NotFoundClient from './not-found-client';

export default async function NotFound() {
  const initialConfig = await getBuildCovers();

  return (
    <NotFoundClient
      bkkkCovers={initialConfig.bkkk}
      bkkkCss={initialConfig.bkkkCss}
      kyafCovers={initialConfig.kyaf}
      kyafCss={initialConfig.kyafCss}
    />
  );
}
