import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { twMerge } from 'tailwind-merge';

import Pagination from '@/components/common/Pagination/Pagination';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import useClaimHistory from '@/hooks/useClaimHistory';
import { ClaimHistoryExtended } from '@/types';
import { formatNumber } from '@/utils';

import adxTokenLogo from '../../../../public/images/adx.svg';
import chevronDown from '../../../../public/images/chevron-down.svg';
import downloadIcon from '../../../../public/images/download.png';
import usdcTokenLogo from '../../../../public/images/usdc.svg';
import ClaimBlock from './ClaimBlock';

interface ClaimHistorySectionProps {
    token: 'ADX' | 'ALP';
    walletAddress: string | null;
    batchSize?: number;
    itemsPerPage?: number;
    optimisticClaim?: ClaimHistoryExtended | null;
    setOptimisticClaim?: (claim: ClaimHistoryExtended | null) => void;
}

export default function ClaimHistorySection({
    token,
    walletAddress,
    batchSize = 1000,
    itemsPerPage = 2,
    optimisticClaim,
    setOptimisticClaim,
}: ClaimHistorySectionProps) {
    const [isClaimHistoryVisible, setIsClaimHistoryVisible] = React.useState(false);
    const nodeRef = useRef(null); // Reference for CSSTransition

    // Track which pages we've already attempted to load to prevent loops
    const [attemptedLoads, setAttemptedLoads] = React.useState<Record<number, boolean>>({});

    // Use the enhanced hook for all data fetching and pagination
    const {
        isLoadingClaimHistory,
        claimsHistory,
        // Pagination-related values
        currentPage,
        totalPages,
        loadPageData,
        getPaginatedData
    } = useClaimHistory({
        walletAddress,
        batchSize,
        itemsPerPage,
        symbol: token
    });

    // Reset optimistic claim when fresh data is loaded
    useEffect(() => {
        if (claimsHistory && optimisticClaim && setOptimisticClaim) {
            setOptimisticClaim(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claimsHistory, token]);

    // Get total items count
    const totalItems = useMemo(() => {
        if (!claimsHistory) return 0;
        return claimsHistory.symbols.reduce(
            (acc, symbol) => acc + (symbol.claims?.length || 0),
            0,
        );
    }, [claimsHistory]);

    // Get combined claims data to display
    const paginatedClaims = useMemo(() => {
        if (!claimsHistory) return [];

        // Use the hook's getPaginatedData function
        const claims = getPaginatedData(currentPage);

        // If we got empty claims but we're not loading and we should have data,
        // and we haven't already tried loading this page, trigger loading for this page
        if (claims.length === 0 && !isLoadingClaimHistory && totalItems > 0 && !attemptedLoads[currentPage]) {
            // Mark this page as attempted
            setAttemptedLoads(prev => ({ ...prev, [currentPage]: true }));

            // Use setTimeout to ensure this happens after the current render cycle
            // Only try once per render, don't loop
            setTimeout(() => {
                // Double-check we still need to load before trying
                // This helps prevent race conditions
                if (getPaginatedData(currentPage).length === 0 && !attemptedLoads[currentPage]) {
                    loadPageData(currentPage);
                }
            }, 0);
        }

        return claims;
    }, [claimsHistory, currentPage, getPaginatedData, isLoadingClaimHistory, loadPageData, totalItems, attemptedLoads]);

    // Reset attempted loads when wallet changes
    useEffect(() => {
        setAttemptedLoads({});
    }, [walletAddress, token]);


    // Calculate the all-time claimed amounts
    const allTimeClaimedUsdc = (claimsHistory?.symbols.find(symbol => symbol.symbol === token)?.allTimeRewardsUsdc ?? 0) + (optimisticClaim?.rewards_usdc ?? 0);
    const allTimeClaimedAdx = (claimsHistory?.symbols.find(symbol => symbol.symbol === token)?.allTimeRewardsAdx ?? 0) + (claimsHistory?.symbols.find(symbol => symbol.symbol === token)?.allTimeRewardsAdxGenesis ?? 0) + (optimisticClaim?.rewards_adx ?? 0);

    // Format helpers
    const isMediumUsdcAllTimeClaimAmount = allTimeClaimedUsdc >= 1000;
    const isMediumAdxAllTimeClaimAmount = allTimeClaimedAdx >= 1000;
    const isBigUsdcAllTimeClaimAmount = allTimeClaimedUsdc >= 100_000;
    const isBigAdxAllTimeClaimAmount = allTimeClaimedAdx >= 1_000_000;

    const handlePageChange = (page: number) => {
        if (page === currentPage) return; // Don't reload the same page

        // Reset the attempt tracking for the new page to allow initial load
        setAttemptedLoads(prev => {
            const newAttempts = { ...prev };
            // Clear the attempt for the new page
            delete newAttempts[page];
            return newAttempts;
        });

        loadPageData(page);
    };

    // Message to display when no data is available
    const getNoDataMessage = () => {
        if (!claimsHistory) return "No claim history available.";
        if (totalItems === 0) return "No claim history available.";
        if (currentPage > totalPages) return "This page doesn't exist.";
        if (isLoadingClaimHistory) return "Loading...";
        return "No data available for this page.";
    };

    // Download handler
    const downloadClaimHistory = () => {
        if (!claimsHistory) {
            return;
        }

        const keys = [
            'claim_id',
            'transaction_date',
            'rewards_adx',
            ...(token === 'ADX' ? [] : ['rewards_adx_genesis']),
            'rewards_usdc',
            'signature',
        ];

        const csvRows = claimsHistory.symbols.flatMap(symbol => symbol.claims)
            .filter(
                (claim) =>
                    claim.rewards_adx !== 0 ||
                    claim.rewards_adx_genesis !== 0 ||
                    claim.rewards_usdc !== 0
            )
            .map((claim) =>
                keys
                    .map((key) => {
                        let value = claim[key as keyof typeof claim];
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
        a.download = `${token}-staking-claim-history-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="flex flex-col text-sm py-0 px-5 w-full">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full text-white rounded-lg transition-colors duration-200">
                <div className='flex flex-col'>
                    <div className='flex flex-row gap-2 items-center select-none'>
                        <div className="flex items-center justify-between">
                            <div className='mr-2'>
                                <h3 className="md:text-lg font-semibold">Claim History</h3>
                            </div>

                            <h3 className="text-lg font-semibold text-txtfade">
                                {totalItems && totalItems != claimsHistory?.allTimeCountClaims ? ` (${totalItems}/${claimsHistory?.allTimeCountClaims})` : ` (${totalItems})`}
                            </h3>

                            {claimsHistory ? <div className='w-auto flex mr-2 mt-2 opacity-50 hover:opacity-100 cursor-pointer gap-1 ml-2' onClick={downloadClaimHistory}>
                                <Image
                                    src={downloadIcon}
                                    width={18}
                                    height={16}
                                    alt="Download icon"
                                    className="relative bottom-1"
                                    style={{ width: 'auto/2', height: 'auto/2' }}
                                />
                            </div> : null}
                        </div>
                    </div>

                    <p className='text-xs text-txtfade'>Subject to 30s delay</p>
                </div>

                {/* TOTALs */}
                <div className="flex flex-col items-start text-xs text-txtfade bg-secondary rounded-lg border border-bcolor pt-1 pb-1 pl-2 pr-2">
                    <div className="flex flex-row items-center">
                        <p className="text-txtfade">
                            All time claimed amounts:
                        </p>
                    </div>
                    <div className="flex flex-row space-x-4 text-xs">
                        <div className="flex items-center">
                            <FormatNumber
                                nb={allTimeClaimedUsdc}
                                precisionIfPriceDecimalsBelow={
                                    isMediumUsdcAllTimeClaimAmount ? 0 : 2
                                }
                                minimumFractionDigits={
                                    isMediumUsdcAllTimeClaimAmount ? 0 : 2
                                }
                                precision={isMediumUsdcAllTimeClaimAmount ? 0 : 2}
                                isAbbreviate={isBigUsdcAllTimeClaimAmount}
                                info={
                                    isBigUsdcAllTimeClaimAmount
                                        ? formatNumber(allTimeClaimedUsdc, 2, 2)
                                        : undefined
                                }
                                className="text-txtfade text-xs"
                            />
                            <Image
                                src={usdcTokenLogo}
                                width={16}
                                height={16}
                                alt="USDC logo"
                                className="ml-1 opacity-50"
                            />
                        </div>
                        <div className="flex items-center">
                            <FormatNumber
                                nb={allTimeClaimedAdx}
                                precisionIfPriceDecimalsBelow={
                                    isMediumAdxAllTimeClaimAmount ? 0 : 2
                                }
                                minimumFractionDigits={
                                    isMediumAdxAllTimeClaimAmount ? 0 : 2
                                }
                                precision={isMediumAdxAllTimeClaimAmount ? 0 : 2}
                                isAbbreviate={isBigAdxAllTimeClaimAmount}
                                info={
                                    isBigAdxAllTimeClaimAmount
                                        ? formatNumber(allTimeClaimedAdx, 2, 2)
                                        : undefined
                                }
                                className="text-txtfade text-xs"
                            />
                            <Image
                                src={adxTokenLogo}
                                width={16}
                                height={16}
                                alt="ADX logo"
                                className="ml-1 opacity-50"
                            />
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
                nodeRef={nodeRef}
            >
                <div className="mt-4">
                    {isLoadingClaimHistory && !paginatedClaims.length ? (
                        <div className="flex flex-col w-full h-full items-center justify-center py-4">
                            <Loader />
                        </div>
                    ) : (
                        <div className="mt-2">
                            {paginatedClaims.length > 0 ? (
                                paginatedClaims.map((claim) => (
                                    <ClaimBlock key={claim.claim_id} claim={claim} />
                                ))
                            ) : (
                                <p>{getNoDataMessage()}</p>
                            )}
                        </div>
                    )}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        isLoading={isLoadingClaimHistory}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
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
    );
}
