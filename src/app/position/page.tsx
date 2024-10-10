import type { Metadata, ResolvingMetadata } from 'next';
import { headers } from 'next/headers';

import Redirect from '../components/Redirect';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const data = searchParams.data as string | undefined;

  if (!data) {
    return {
      title: 'Adrena',
      description: 'Trade at the speed of light with up to 100x leverage',
    };
  }

  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(base64, 'base64').toString();

  const { symbol, pnl, side, size, collateral, price, mark, opened, opt } =
    JSON.parse(json);

  const heads = headers();

  const currentUrl = heads.get('host');

  const url = `https://${currentUrl}/api/og?opt=${opt}&pnl=${pnl ?? 0
    }&side=${side}&symbol=${symbol}&collateral=${collateral}&mark=${mark ?? 0
    }&price=${price}&opened=${opened}&size=${size}`;

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
