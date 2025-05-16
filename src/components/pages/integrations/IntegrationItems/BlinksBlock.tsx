import '@dialectlabs/blinks/index.css';

import { Blink, useBlink } from '@dialectlabs/blinks';
import { useBlinkSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';

import Loader from '@/components/Loader/Loader';

export const BlinksBlock = ({ url }: { url: string }) => {
  const { blink, isLoading } = useBlink({
    url: `solana-action:${url}`,
  });
  const key = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;

  const { adapter } = useBlinkSolanaWalletAdapter(
    `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${key}`,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!blink) return <p className='opacity-50 text-center text-sm'>Enable Blinks to preview</p>;

  return <Blink blink={blink} adapter={adapter} stylePreset="x-dark" />;
};
