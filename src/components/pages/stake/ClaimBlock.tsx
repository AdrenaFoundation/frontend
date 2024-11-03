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
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-5 justify-between sm:items-center p-3 sm:p-2 mx-2">
                <div className="flex flex-1 flex-col">
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

                <div className="flex flex-1 flex-col sm:text-center">
                    <div className="w-full font-mono text-xxs text-txtfade">Source</div>
                    <p
                        className={`text-xs font-mono opacity-50 ${claim.source === 'manual' ? 'text-orange' : 'text-blue'
                            }`}
                    >
                        {claim.source}
                    </p>
                </div>

                <div className="flex-1 sm:text-center">
                    <div className="block sm:hidden w-full font-mono text-xxs text-txtfade">USDC reward</div>
                    <FormatNumber
                        nb={claim.rewards_usdc}
                        format="number"
                        className="text-gray-400 text-xs mr-1"
                        minimumFractionDigits={2}
                        prefix="+ "
                        suffix="USDC"
                    />
                </div>

                <div className="flex-1 sm:text-end">
                    <div className="block sm:hidden w-full font-mono text-xxs text-txtfade">ADX reward</div>

                    <FormatNumber
                        nb={claim.rewards_adx + claim.rewards_adx_genesis}
                        format="number"
                        wrapperClassName="sm:justify-end"
                        className={`text-gray-400 text-xs ${claim.rewards_adx_genesis > 0 ? 'underline-dashed' : ''
                            }`}
                        minimumFractionDigits={2}
                        prefix="+ "
                        suffix=" ADX"
                        info={
                            claim.rewards_adx_genesis > 0
                                ? `${formatNumber(claim.rewards_adx, 2, 2)} + ${formatNumber(
                                    claim.rewards_adx_genesis,
                                    2,
                                    2,
                                )} (Genesis)`
                                : undefined
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default ClaimBlock;
