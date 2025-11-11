import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { useDispatch } from '@/store/store';
import { addNotification } from '@/utils';

import refreshIcon from '../../../public/images/refresh.png';

export default function RefreshButton({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const handleReload = () => {
    dispatch(fetchWalletTokenBalances());
    addNotification({
      title: 'Wallet balances refreshed',
      type: 'success',
      duration: 'fast',
    });
  };

  return (
    <div
      onClick={handleReload}
      className={twMerge(
        'flex items-center justify-center w-6 h-6 p-1 rounded-full cursor-pointer opacity-50 hover:opacity-100 transition duration-300',
        className,
      )}
    >
      <Image
        src={refreshIcon}
        alt="Refresh"
        className="w-3"
        width={12}
        height={12}
      />
    </div>
  );
}
