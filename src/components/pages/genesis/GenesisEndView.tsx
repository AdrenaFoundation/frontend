import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import { Congrats } from '@/components/Congrats/Congrats';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { LockedStakeExtended } from '@/types';
import { getAlpLockedStakes, nativeToUi } from '@/utils';

import adrenaMonsters from '../../../../public/images/adrena-monsters.png';
import xIcon from '../../../../public/images/x-black-bg.png';
import FormatNumber from '@/components/Number/FormatNumber';

export default function GenesisEndView({ connected }: { connected: boolean }) {
  const { stakingAccounts } = useWalletStakingAccounts();
  const [totalStakedAmount, setTotalStakedAmount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!stakingAccounts) {
      return;
    }
    const alpLockedStakes: LockedStakeExtended[] =
      getAlpLockedStakes(stakingAccounts) ?? [];

    const totalALP = alpLockedStakes.reduce((acc, stake) => {
      return (
        acc + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals)
      );
    }, 0);

    setTotalStakedAmount(totalALP);
  }, [stakingAccounts, connected]);

  const url = 'https://app.adrena.xyz/genesis';

  const text =
    totalStakedAmount !== null && totalStakedAmount > 0 && connected ? (
      <p className="text-center mt-1 text-base max-w-[400px] font-mono font-semibold">
        <span className="font-mono font-light text-base opacity-50">
          You have bought{' '}
        </span>
        <FormatNumber
          nb={totalStakedAmount}
          precision={2}
          suffix=" ALP"
          isDecimalDimmed={false}
          className="text-base"
        />
        ,{' '}
        <span className="font-mono font-light text-base opacity-50">
          they have been locked and staked for
        </span>{' '}
        180 days!
      </p>
    ) : (
      <p className="text-center mt-1 max-w-[400px] ont-mono font-light text-base opacity-50">
        Genesis Program has concluded, trading will go live soon!
      </p>
    );

  const twitterText =
    totalStakedAmount !== null && totalStakedAmount > 0 && connected
      ? `I just bought ${totalStakedAmount} ALP locked and staked for 180 days! @adrenaprotocol`
      : 'Check out Adrena \nThe new community owned, 100% rev share, perp dex on Solana!';

  return (
    <div className="relative p-3">
      <div className="absolute top-0 w-[300px]">
        <Congrats />
      </div>
      <div className="relative">
        <Image
          src={adrenaMonsters}
          alt="Adrena monsters"
          className="w-full max-w-[400px] m-auto"
        />
        <div className="absolute bottom-0 h-[120px] w-full bg-gradient-to-b from-secondary/0 to-secondary" />
      </div>

      <h1 className="text-center mt-6">Welcome to Adrena!</h1>
      {text}
      <Button
        size="lg"
        title="Share on"
        className="w-full mt-10 py-3 text-base"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          twitterText,
        )}&url=${encodeURIComponent(url)}`}
        isOpenLinkInNewTab
        rightIcon={xIcon}
        rightIconClassName="w-4 h-4"
      />
    </div>
  );
}
