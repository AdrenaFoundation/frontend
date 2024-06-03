import Image from 'next/image';
import React from 'react';

import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import { addNotification } from '@/utils';

import refreshIcon from '../../../public/images/refresh.png';

export default function RefreshButton() {
  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance();

  const handleReload = () => {
    triggerWalletTokenBalancesReload();
    addNotification({
      title: 'Wallet balances refreshed',
      type: 'success',
      duration: 'fast',
    });
  };

  return (
    <div
      onClick={handleReload}
      className="flex items-center justify-center w-6 h-6 p-1 rounded-full border border-fourth cursor-pointer hover:bg-white hover:bg-opacity-10 transition duration-300"
    >
      <Image src={refreshIcon} alt="Refresh" className="w-3" />
    </div>
  );
}
