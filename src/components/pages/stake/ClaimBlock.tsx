import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import FormatNumber from '@/components/Number/FormatNumber';
import { formatDate, formatNumber, getTxExplorer } from '@/utils';

import { ClaimHistoryExtended } from '../../../types';

const ClaimBlock: React.FC<{ claim: ClaimHistoryExtended }> = ({ claim }) => {


    interface DateDisplayProps {
        date: string | number | Date;
    }

    const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => (
        <p className="text-xs font-mono opacity-50">{formatDate(date)}</p>
    );

    return (
        <div className="w-full flex flex-col border rounded-lg bg-secondary overflow-hidden mb-2">
            <div className="flex flex-row justify-between items-center p-2 mx-2">

                <div className="flex flex-1 flex-col ">
                    <div className="flex w-full font-mono text-xxs ">
                        <Link
                            href={getTxExplorer(claim.signature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                        >
                            <span className="text-blue cursor-pointer hover:underline mr-1">
                                Claimed on
                            </span>
                            <Image
                                src={externalLinkLogo}
                                alt="External link"
                                width={12}
                                height={12}
                            />
                        </Link>
                    </div>
                    <DateDisplay date={claim.transaction_date} />
                </div>

                <div className="flex flex-1 flex-col items-center">
                    <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                        Source
                    </div>
                    <p
                        className={`text-xs font-mono opacity-50 ${claim.source === 'manual' ? 'text-orange' : 'text-blue'
                            }`}
                    >
                        {claim.source}
                    </p>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <FormatNumber
                        nb={claim.rewards_usdc}
                        format="number"
                        className="text-gray-400 text-xs mr-1"
                        minimumFractionDigits={2}
                        prefix="+ "
                        suffix=" USDC"
                    />
                    {/* <Image
                        src={usdcTokenLogo}
                        width={14}
                        height={14}
                        alt="USDC logo"
                    /> */}
                </div>

                <div className="flex flex-1 items-center justify-end">
                    <FormatNumber
                        nb={claim.rewards_adx + claim.rewards_adx_genesis}
                        format="number"
                        className={`text-gray-400 text-xs mr-1 ${claim.rewards_adx_genesis > 0 ? 'underline-dashed' : ''}`}
                        minimumFractionDigits={2}
                        prefix="+ "
                        suffix=" ADX"
                        info={claim.rewards_adx_genesis > 0 ? `${formatNumber(claim.rewards_adx, 2, 2)} + ${formatNumber(claim.rewards_adx_genesis, 2, 2)} (Genesis)` : undefined}
                    />
                    {/* <Image
                        src={adxTokenLogo}
                        width={14}
                        height={14}
                        alt="ADX logo"
                    /> */}
                </div>
            </div>
        </div >
    );
};

export default ClaimBlock;
