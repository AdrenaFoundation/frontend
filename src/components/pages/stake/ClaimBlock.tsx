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
        <div className="min-w-[250px] w-full flex flex-col border rounded-lg bg-secondary overflow-hidden mb-2">
            <div className="flex flex-row justify-between items-center p-2 mx-2">

                <div className="flex flex-col items-center min-w-[5em] w-[8em]">
                    <div className="flex w-full font-mono text-xxs justify-center items-center">
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

                <div className="flex flex-col items-center min-w-[5em] w-[8em]">
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

                <div className="flex flex-row items-center justify-end min-w-[5em] w-[12em]">
                    <FormatNumber
                        nb={claim.rewards_adx + claim.rewards_adx_genesis}
                        format="number"
                        className="text-gray-400 text-xs mr-1"
                        minimumFractionDigits={2}
                        prefix="+ "
                        suffix=" ADX"
                        info={`Base rewards: ${formatNumber(claim.rewards_adx, 2, 2)} Genesis rewards: ${formatNumber(claim.rewards_adx_genesis, 2, 2)}`}
                    />
                    {/* <Image
                        src={adxTokenLogo}
                        width={14}
                        height={14}
                        alt="ADX logo"
                    /> */}
                </div>

                <div className="flex flex-row items-center justify-end min-w-[5em] w-[12em]">
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

            </div>
        </div >
    );
};

export default ClaimBlock;
