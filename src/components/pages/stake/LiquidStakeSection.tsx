import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { AdxLockPeriod, AlpLockPeriod } from '@/types';

import adxTokenLogo from '../../../../public/images/adx.svg';

interface LiquidStakeSectionProps {
    totalLiquidStaked: number | null;
    onRedeem?: () => void;
    onStake: (lockPeriod: AdxLockPeriod | AlpLockPeriod) => void;
    liquidStakeLockDuration: AdxLockPeriod | AlpLockPeriod;
}

export default function LiquidStakeSection({
    totalLiquidStaked,
    onRedeem,
    onStake,
    liquidStakeLockDuration,
}: LiquidStakeSectionProps) {
    return (
        <div className="pb-8">
            <div className="h-[1px] bg-bcolor w-full my-5" />
            <div className="px-5">
                <h3 className="text-lg font-semibold mb-2">Liquid stake</h3>
                <div className="flex flex-col sm:flex-row justify-between items-center border p-3 bg-secondary rounded-md mt-3 shadow-lg">
                    <div className="flex items-center">
                        <Image
                            src={adxTokenLogo}
                            width={16}
                            height={16}
                            className="opacity-50"
                            alt="adx token logo"
                        />
                        <FormatNumber
                            nb={totalLiquidStaked}
                            className="ml-2 text-xl"
                        />
                    </div>

                    <div className="flex gap-2 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto">
                        <Button
                            variant="primary"
                            size="sm"
                            title="Unstake"
                            className={twMerge(
                                'px-5',
                                (!totalLiquidStaked || totalLiquidStaked <= 0) &&
                                'opacity-50 cursor-not-allowed',
                            )}
                            onClick={onRedeem}
                            disabled={!totalLiquidStaked || totalLiquidStaked <= 0}
                        />

                        <Button
                            variant="danger"
                            size="sm"
                            title={
                                totalLiquidStaked && totalLiquidStaked > 0
                                    ? 'Add Stake'
                                    : 'Stake'
                            }
                            className="px-5"
                            onClick={() => onStake(liquidStakeLockDuration)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
