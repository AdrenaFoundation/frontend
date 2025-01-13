import type { Metadata, ResolvingMetadata } from 'next';
import { headers } from 'next/headers';

import Redirect from '../components/Redirect';

type Props = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const data = resolvedSearchParams.data as string | undefined;

  if (!data) {
    return {
      title: 'Adrena',
      description: 'Trade at the speed of light with up to 100x leverage',
    };
  }

  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(base64, 'base64').toString();

  const {
    symbol,
    pnl,
    side,
    size,
    collateral,
    price,
    mark,
    opened,
    opt,
    pnlUsd,
    isPnlUsd,
    exitPrice,
  } = JSON.parse(json);

  const heads = await headers();

  const currentUrl = heads.get('host');

  const url = `https://${currentUrl}/api/og?opt=${opt}&pnl=${pnl ?? 0
    }&pnlUsd=${pnlUsd}&isPnlUsd=${isPnlUsd}&side=${side}&symbol=${symbol}&collateral=${collateral}&mark=${mark ?? 0
    }&price=${price}&opened=${opened}&size=${size}&exitPrice=${exitPrice}`;

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: 'Adrena',
    openGraph: {
      images: [url, ...previousImages],
    },
    description: 'Trade at the speed of light with up to 100x leverage',
  };
}

export default function Page() {
  return <Redirect />;
}
