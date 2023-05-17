import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import { useSelector } from '@/store/store';

export default function ALPSwap({
  className,
  client,
}: {
  className?: string;
  client: AdrenaClient | null;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  return <div className={twMerge(className)}></div>;
}
