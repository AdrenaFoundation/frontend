import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { WalletStakingAccounts } from '@/hooks/useWalletStakingAccounts';
import { LockedStakeExtended } from '@/types';
import {
    getAdxLockedStakes,
    getAlpLockedStakes,
    nativeToUi,
} from '@/utils';

export default function TradingStats({
    stakingAccounts,
    className,
}: {
    className?: string;
    stakingAccounts: WalletStakingAccounts | null
}) {
    const [liquidStakedADX, setLiquidStakedADX] = useState<number | null>(null);
    const [lockedStakedADX, setLockedStakedADX] = useState<number | null>(null);
    const [lockedStakedALP, setLockedStakedALP] = useState<number | null>(null);

    useEffect(() => {
        if (!stakingAccounts) {
            return;
        }

        const adxLockedStakes: LockedStakeExtended[] =
            getAdxLockedStakes(stakingAccounts) ?? [];

        const alpLockedStakes: LockedStakeExtended[] =
            getAlpLockedStakes(stakingAccounts) ?? [];

        const liquidStakedADX =
            typeof stakingAccounts.ADX?.liquidStake.amount !== 'undefined'
                ? nativeToUi(
                    stakingAccounts.ADX.liquidStake.amount,
                    window.adrena.client.adxToken.decimals,
                )
                : null;

        const lockedStakedADX = adxLockedStakes.reduce((acc, stake) => {
            return (
                acc + nativeToUi(stake.amount, window.adrena.client.adxToken.decimals)
            );
        }, 0);

        const lockedStakedALP = alpLockedStakes.reduce((acc, stake) => {
            return (
                acc + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals)
            );
        }, 0);

        setLiquidStakedADX(liquidStakedADX);
        setLockedStakedADX(lockedStakedADX);
        setLockedStakedALP(lockedStakedALP);
    }, [stakingAccounts]);

    return <div className={twMerge("flex-wrap flex-row w-full flex gap-6 pl-4 pr-4", className)}>
        <NumberDisplay
            title="Liquid Staked ADX"
            nb={liquidStakedADX}
            precision={2}
            placeholder="0 ADX"
            suffix="ADX"
            className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
            headerClassName='pb-2'
            titleClassName='text-[0.7em] sm:text-[0.7em]'
            bodyClassName='text-base'
        />

        <NumberDisplay
            title="Locked Staked ADX"
            nb={lockedStakedADX}
            precision={2}
            placeholder="0 ADX"
            suffix="ADX"
            className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
            headerClassName='pb-2'
            titleClassName='text-[0.7em] sm:text-[0.7em]'
            bodyClassName='text-base'
        />

        <NumberDisplay
            title="Locked Staked ALP"
            nb={lockedStakedALP}
            precision={2}
            placeholder="0 ALP"
            suffix="ALP"
            className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
            headerClassName='pb-2'
            titleClassName='text-[0.7em] sm:text-[0.7em]'
            bodyClassName='text-base'
        />
    </div>;
}