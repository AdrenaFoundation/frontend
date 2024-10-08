import type { Metadata, ResolvingMetadata } from 'next';

import Redirect from '../components/Redirect';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const symbol = searchParams.symbol;
  const pnl = searchParams.pnl;
  const side = searchParams.side;
  const sizeUsd = searchParams.size;
  const collateralUsd = searchParams.collateral;
  const price = searchParams.price;
  const mark = searchParams.mark;
  const openedOn = searchParams.opened;
  const opt = searchParams.opt;

  // fetch data
  const url = `https://frontend-devnet-git-pnlshare-adrena.vercel.app/api/og?opt=${opt}&pnl=${pnl ?? 0
    }&side=${side}&symbol=${symbol}&collateral=${collateralUsd}&mark=${mark ?? 0
    }&price=${price}&opened=${openedOn}&size=${sizeUsd}`;

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
