import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import { formatNumber } from '@/utils';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';

interface TokenInfoHeaderProps {
    token: 'ADX' | 'ALP';
    totalStakeAmount: number;
}

export default function TokenInfoHeader({
    token,
    totalStakeAmount,
}: TokenInfoHeaderProps) {
    const isALP = token === 'ALP';
    const isBigStakeAmount = totalStakeAmount > 1000000;

    return (
        <div className="p-5 pb-0">
            <div className="flex flex-col sm:flex-row items-stretch h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-md shadow-lg">
                <div
                    className={twMerge(
                        'flex items-center w-full sm:w-auto sm:min-w-[200px] rounded-t-lg sm:rounded-r-none sm:rounded-l-lg p-3 flex-none sm:border-r',
                        isALP ? 'bg-gradient-to-r from-[#0284c7] via-[#1e40af] to-[#1a2a6a]' : 'bg-gradient-to-r from-red via-rose-600 to-pink-600',
                    )}
                >
                    <div className="flex flex-row items-center gap-6">
                        <div>
                            <p className="opacity-50 text-base">Total staked</p>
                            <FormatNumber
                                nb={totalStakeAmount}
                                minimumFractionDigits={totalStakeAmount < 1000 ? 2 : 0}
                                precision={totalStakeAmount < 1000 ? 2 : 0}
                                precisionIfPriceDecimalsBelow={
                                    totalStakeAmount < 1000 ? 2 : 0
                                }
                                isAbbreviate={isBigStakeAmount}
                                suffix={token}
                                className="text-2xl cursor-pointer"
                                info={
                                    isBigStakeAmount
                                        ? formatNumber(totalStakeAmount, 2, 2)
                                        : undefined
                                }
                            />
                        </div>

                        <Image
                            src={isALP ? alpLogo : adxLogo}
                            width={50}
                            height={50}
                            className="opacity-10"
                            alt={`${token} logo`}
                        />
                    </div>
                </div>

                <p className="m-auto opacity-75 text-base p-3">
                    {isALP
                        ? 'Provide liquidities: the longer the period, the higher the rewards. 70% of protocol fees are distributed to ALP holder and stakers.'
                        : 'Align with the protocol\'s long term success: the longer the period, the higher the rewards. 20% of protocol fees are distributed to ADX stakers.'}
                </p>
            </div>
        </div>
    );
}
