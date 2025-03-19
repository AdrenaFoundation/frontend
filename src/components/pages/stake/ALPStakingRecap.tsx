import '../../../styles/Animation.css';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Pagination from '@/components/common/Pagination/Pagination';
import FormatNumber from '@/components/Number/FormatNumber';
import {
    ClaimHistoryExtended,
} from '@/types';

import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import chevronDown from '../../../../public/images/chevron-down.svg';
import downloadIcon from '../../../../public/images/download.png';
import ClaimBlock from './ClaimBlock';

export default function ALPStakingRecap({
    claimsHistory,
}: {
    claimsHistory: ClaimHistoryExtended[] | null;
}) {
    const [isClaimHistoryVisible, setIsClaimHistoryVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [claimHistoryItemsPerPage,] = useState(3);

    const [paginatedClaimsHistory, setPaginatedClaimsHistory] = useState<ClaimHistoryExtended[]>([]);

    useEffect(() => {
        if (!claimsHistory) {
            return;
        }
        const startIndex = (currentPage - 1) * claimHistoryItemsPerPage;
        const endIndex = startIndex + claimHistoryItemsPerPage;
        setPaginatedClaimsHistory(claimsHistory.slice(startIndex, endIndex));
    }, [claimsHistory, currentPage, claimHistoryItemsPerPage]);

    const allTimeClaimedUsdc =
        claimsHistory?.reduce((sum, claim) => sum + claim.rewards_usdc, 0) ?? 0;
    const allTimeClaimedAdx =
        claimsHistory?.reduce(
            (sum, claim) => sum + claim.rewards_adx + claim.rewards_adx_genesis,
            0,
        ) ?? 0;

    const adxValueAtClaim = claimsHistory?.reduce(
        (sum, claim) => sum + (claim.rewards_adx + claim.rewards_adx_genesis) * claim.adx_price_at_claim,
        0,
    ) ?? 0;

    const downloadClaimHistory = useCallback(() => {
        if (!claimsHistory) {
            return;
        }

        const keys = [
            'claim_id',
            'transaction_date',
            'rewards_adx',
            'rewards_adx_genesis',
            'rewards_usdc',
            'signature',
        ];

        const csvRows = claimsHistory
            .filter(
                (claim) =>
                    claim.rewards_adx !== 0 ||
                    claim.rewards_adx_genesis !== 0 ||
                    claim.rewards_usdc !== 0
            )
            .map((claim) =>
                keys
                    .map((key) => {
                        let value = claim[key as keyof typeof claimsHistory[0]];
                        // Format the date field if it's `transaction_date`
                        if (key === 'transaction_date' && value instanceof Date) {
                            value = (value as Date).toISOString(); // Format to ISO 8601
                        }
                        return `"${String(value).replace(/"/g, '""')}"`;
                    })
                    .join(',')
            );

        const csvFileContent = [keys.join(','), ...csvRows].join('\n');

        const blob = new Blob([csvFileContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `alp-staking-claim-history-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, [claimsHistory]);

    return (
        <div className="flex flex-col bg-main rounded-2xl border">
            <div className="p-5 pb-0">
                <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-lg shadow-lg">
                    <p className="opacity-75 text-base p-3 flex flex-col gap-2 text-center">
                        <span className='text-base'>Starting March 19th, 2025, at 00:00 UTC, ALP is now fully liquid. But before that date, you were there and had some ALP staked!</span>
                    </p>

                    <div
                        className={twMerge(
                            'flex w-full rounded-bl-lg rounded-br-lg p-3 items-center justify-center flex-none border-t bg-[#130AAA] relative overflow-hidden',
                        )}
                    >
                        <div className="flex flex-row items-center gap-6">
                            <div className='flex flex-col items-center'>
                                <p className="opacity-50 text-base">Historical Staked ALP Rewards</p>

                                <FormatNumber
                                    nb={allTimeClaimedUsdc + adxValueAtClaim}
                                    minimumFractionDigits={0}
                                    precision={0}
                                    precisionIfPriceDecimalsBelow={0}
                                    isAbbreviate={false}
                                    prefix='$'
                                    className="text-2xl"
                                />
                            </div>

                            <Image
                                src={alpLogo}
                                width={100}
                                height={100}
                                className="opacity-10 absolute right-0 top-0"
                                alt={`ALP logo`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-4'>
                <div className='flex pr-4 pl-4 gap-4 flex-wrap'>
                    <NumberDisplay
                        title='USDC Rewards'
                        nb={allTimeClaimedUsdc}
                        precision={0}
                        format='number'
                        suffix='USDC'
                        className=''
                        bodyClassName='text-base'
                    />

                    <NumberDisplay
                        title='LM Rewards'
                        nb={allTimeClaimedAdx}
                        precision={0}
                        format='number'
                        suffix='ADX'
                        className=''
                        bodyClassName='text-base'
                    />

                    <NumberDisplay
                        tippyInfo="The value of the ADX rewards at the time of claim."
                        title='LM Usd Value'
                        nb={adxValueAtClaim}
                        precision={0}
                        format='currency'
                        className=''
                        bodyClassName='text-base'
                    />
                </div>
            </div>

            <div className="flex flex-col h-full mt-4 relative">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full text-white rounded-lg transition-colors duration-200">
                    <div className='flex flex-col'>
                        <div className='flex flex-row gap-2 items-center select-none'>
                            <div className="flex items-center justify-between">
                                <div className='mr-2'>
                                    <h3 className="md:text-lg font-semibold">Claim History</h3>
                                </div>

                                <h3 className="text-lg font-semibold text-txtfade">
                                    {claimsHistory?.length ? ` (${claimsHistory.length})` : ''}
                                </h3>

                                {claimsHistory ? <div className='w-auto flex right-4 opacity-50 hover:opacity-100 cursor-pointer gap-1 absolute' onClick={() => {
                                    downloadClaimHistory();
                                }}>
                                    <Image
                                        src={downloadIcon}
                                        width={18}
                                        height={16}
                                        alt="Download icon"
                                        className="relative bottom-1"
                                    />
                                </div> : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Claim History Section */}

                <CSSTransition
                    in={isClaimHistoryVisible}
                    timeout={300}
                    classNames="claim-history"
                    unmountOnExit
                >
                    <div className="mt-4">
                        <div mt-2>
                            {paginatedClaimsHistory.length > 0 ? (
                                paginatedClaimsHistory.map((claim) => (
                                    <ClaimBlock key={claim.claim_id} claim={claim} />
                                ))
                            ) : (
                                <p>No claim history available.</p>
                            )}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={claimsHistory ? claimsHistory.length : 0}
                            itemsPerPage={claimHistoryItemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </CSSTransition>

                <div className='w-full flex items-center justify-center h-6 border-t border-b border-bcolor hover:opacity-100 opacity-80 cursor-pointer mt-2' onClick={() => {
                    setIsClaimHistoryVisible(!isClaimHistoryVisible)
                }}>
                    <Image
                        className={twMerge(
                            `h-6 w-6`,
                            isClaimHistoryVisible ? 'transform rotate-180 transition-all duration-1000 ease-in-out' : '',
                        )}
                        src={chevronDown}
                        height={60}
                        width={60}
                        alt="Chevron down"
                    />
                </div>
            </div>
        </div >
    );
}
