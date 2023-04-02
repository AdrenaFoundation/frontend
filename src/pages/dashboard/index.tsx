import { twMerge } from 'tailwind-merge';

import ALPIndexComposition from '@/components/ALPIndexComposition/ALPIndexComposition';
import useAdrenaClient from '@/hooks/useAdrenaClient';
import useConnection from '@/hooks/useConnection';
import useCustodies from '@/hooks/useCustodies';
import useListenToPythTokenPricesChange from '@/hooks/useListenToPythTokenPricesChange';
import useMainPool from '@/hooks/useMainPool';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';

export default function Trade() {
  const client = useAdrenaClient();
  const connection = useConnection();
  const mainPool = useMainPool(client);
  const custodies = useCustodies(client, mainPool);

  useListenToPythTokenPricesChange(client, connection);
  useWatchWalletBalance(client, connection);

  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'p-4',
        'overflow-auto',
        'flex-col',
        'bg-main',
      )}
    >
      <ALPIndexComposition client={client} custodies={custodies} />
    </div>
  );
}
