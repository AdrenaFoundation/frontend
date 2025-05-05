import '../../../styles/Animation.css';

import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Pagination from '@/components/common/Pagination/Pagination';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useStakingAccount from '@/hooks/useStakingAccount';
import {
  DEFAULT_LOCKED_STAKE_LOCK_DURATION,
  LIQUID_STAKE_LOCK_DURATION,
} from '@/pages/stake';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  ClaimHistoryExtended,
  ClaimHistoryExtendedApi,
  LockedStakeExtended,
} from '@/types';
import { formatNumber, getNextStakingRoundStartTime } from '@/utils';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import adxTokenLogo from '../../../../public/images/adx.svg';
import chevronDown from '../../../../public/images/chevron-down.svg';
import downloadIcon from '../../../../public/images/download.png';
import infoIcon from '../../../../public/images/Icons/info.svg';
import usdcTokenLogo from '../../../../public/images/usdc.svg';
import ClaimBlock from './ClaimBlock';
import LockedStakes from './LockedStakes';
interface SortConfig {
  size: 'asc' | 'desc';
  duration: 'asc' | 'desc';
  lastClicked: 'size' | 'duration';
}

export default function StakeOverview({
  token,
  totalLockedStake,
  totalLiquidStaked,
  handleClickOnRedeem,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnClaimRewards,
  handleClickOnClaimRewardsAndBuyAdx,
  handleClickOnFinalizeLockedRedeem,
  userPendingUsdcRewards,
  userPendingAdxRewards,
  pendingGenesisAdxRewards,
  handleClickOnUpdateLockedStake,
  claimsHistory,
  optimisticClaimAdx,
  optimisticAllTimeAdxClaimedAllSymbols,
  optimisticAllTimeUsdcClaimedAllSymbols,
  loadClaimsHistory,
  claimsLimit,
}: {
  token: 'ADX' | 'ALP';
  totalLockedStake: number | null;
  totalLiquidStaked?: number | null;
  handleClickOnRedeem?: () => void;
  totalRedeemableLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnStakeMore: (initialLockPeriod: AlpLockPeriod | AdxLockPeriod) => void;
  handleClickOnClaimRewards: () => Promise<void>;
  handleClickOnClaimRewardsAndBuyAdx: () => Promise<void>;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  userPendingUsdcRewards: number;
  userPendingAdxRewards: number;
  roundPendingUsdcRewards: number;
  roundPendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
  nextRoundTime: number;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
  claimsHistory: ClaimHistoryExtendedApi | null;
  optimisticClaimAdx: ClaimHistoryExtended[] | null;
  optimisticAllTimeAdxClaimedAllSymbols: number;
  optimisticAllTimeUsdcClaimedAllSymbols: number;
  loadClaimsHistory?: {
    (offset: number, limit: number): Promise<void>;
    hasDataForPage?: (pageOffset: number, pageLimit: number) => boolean;
  };
  claimsLimit: number;
}) {
  const isMobile = useBetterMediaQuery('(max-width: 570px)');
  const isALP = token === 'ALP';
  const storageKey = isALP ? 'alpStakeSortConfig' : 'adxStakeSortConfig';
  const { stakingAccount, triggerReload } = useStakingAccount(
    isALP ? window.adrena.client.lpTokenMint : window.adrena.client.lmTokenMint,
  );
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [isClaimingAndBuyAdxRewards, setIsClaimingAndBuyAdxRewards] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const savedConfig = localStorage.getItem(storageKey);
    return savedConfig
      ? JSON.parse(savedConfig)
      : {
        size: 'desc',
        duration: 'asc',
        lastClicked: 'size',
      };
  });

  const [roundPassed, setRoundPassed] = useState<boolean>(false);
  const [isClaimHistoryVisible, setIsClaimHistoryVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [claimHistoryItemsPerPage,] = useState(4);

  const [paginatedClaimsHistory, setPaginatedClaimsHistory] = useState<ClaimHistoryExtended[]>([]);

  const combinedAdxClaims = useMemo(() => {
    if (!optimisticClaimAdx) return [];

    const existingAdxClaims = claimsHistory?.symbols.find(symbol => symbol.symbol === 'ADX')?.claims ?? [];
    return [...optimisticClaimAdx, ...existingAdxClaims];
  }, [optimisticClaimAdx, claimsHistory]);

  useEffect(() => {
    if (!claimsHistory) {
      console.log("StakeOverview: No claims history available, not updating paginated claims");
      setPaginatedClaimsHistory([]);
      return;
    }

    // Use all claims from all symbols, but replace ADX claims with the combined ones
    const allClaims = claimsHistory.symbols.flatMap(symbol => {
      if (symbol.symbol === 'ADX' && token === 'ADX') {
        return combinedAdxClaims;
      }
      return symbol.claims;
    });

    // Store the API offset for debugging
    const apiOffset = claimsHistory.offset;
    console.log(`StakeOverview: Processing claims history - ${allClaims.length} claims, apiOffset=${apiOffset}, page=${currentPage}`);

    // Use the total count from the API metadata, not just the currently loaded claims
    // claimsHistory.symbols contains the allTimeCountClaims which represents the total count
    const totalClaimsCount = claimsHistory.symbols.reduce(
      (acc, symbol) => acc + symbol.allTimeCountClaims, 0
    ) || allClaims.length;

    const totalPages = Math.ceil(totalClaimsCount / claimHistoryItemsPerPage);

    console.log(`StakeOverview: Total claims in API: ${totalClaimsCount}, totalPages=${totalPages}, currentPage=${currentPage}`);

    // If current page is beyond available data, adjust it
    if (currentPage > totalPages && totalPages > 0) {
      console.log(`StakeOverview: Current page ${currentPage} is beyond available data (totalPages=${totalPages}), adjusting to page ${totalPages}`);
      setCurrentPage(totalPages);
      return;
    }

    let displayItems: ClaimHistoryExtended[] = [];

    // Calculate the global index range for the current page
    const globalStartIndex = (currentPage - 1) * claimHistoryItemsPerPage;
    const globalEndIndex = globalStartIndex + claimHistoryItemsPerPage;

    // Calculate which batch should contain the current page (for batch size of 9)
    const batchSize = claimsLimit; // Match the batchSize in Pagination
    const currentBatchNumber = Math.floor(globalStartIndex / batchSize);
    const batchStartOffset = currentBatchNumber * batchSize;

    console.log(`StakeOverview: Page ${currentPage} - global indices: ${globalStartIndex}-${globalEndIndex}, apiOffset=${apiOffset}, batch=${currentBatchNumber}, batchStartOffset=${batchStartOffset}`);

    // First page always displays the first N items, regardless of API offset
    // This ensures we correctly display page 1 when returning to it
    if (currentPage === 1) {
      // For page 1, always take the first N items if we have fresh data with offset 0
      // or if we have offset 0 available in our data range
      if (apiOffset === 0 || (apiOffset <= 0 && allClaims.length > 0)) {
        const endIndex = Math.min(claimHistoryItemsPerPage, allClaims.length);
        displayItems = allClaims.slice(0, endIndex);
        console.log(`StakeOverview: First page - displaying items 0-${endIndex} from ${allClaims.length} available claims`);
      } else {
        console.log(`StakeOverview: First page with API offset ${apiOffset} - cannot display page 1 from current data`);
        // If we can't display page 1 from current data, we'll rely on the pagination component to load it
        displayItems = [];
      }
    }
    // When we're viewing a page within the batch that was loaded from the API
    // This handles cases like moving from page 4 to page 3 within the same batch
    else if (apiOffset > 0 && apiOffset === batchStartOffset) {
      // We're in the correct batch - calculate the relative index within the loaded batch
      const relativeStartIndex = globalStartIndex - apiOffset;
      const relativeEndIndex = Math.min(globalEndIndex - apiOffset, allClaims.length);

      console.log(`StakeOverview: Page ${currentPage} within loaded batch - relative indices: ${relativeStartIndex}-${relativeEndIndex}`);

      // Only include items that are in our loaded data range
      if (relativeStartIndex >= 0 && relativeStartIndex < allClaims.length) {
        displayItems = allClaims.slice(relativeStartIndex, relativeEndIndex);
        console.log(`StakeOverview: Sliced ${displayItems.length} items from batch data for page ${currentPage}`);
      } else {
        console.log(`StakeOverview: No data available for page ${currentPage} in current batch`);
        displayItems = [];
      }
    }
    // When we have API data with non-zero offset, but not the right batch
    else if (apiOffset > 0) {
      // Calculate the relative index within our loaded data
      const relativeStartIndex = globalStartIndex - apiOffset;
      const relativeEndIndex = globalEndIndex - apiOffset;

      console.log(`StakeOverview: Page ${currentPage} with API offset ${apiOffset} - relative indices: ${relativeStartIndex}-${relativeEndIndex}`);

      // Only include items that are in our loaded data
      if (relativeStartIndex >= 0 && relativeStartIndex < allClaims.length) {
        // We have at least some of the data for this page
        const sliceEnd = Math.min(relativeEndIndex, allClaims.length);
        displayItems = allClaims.slice(relativeStartIndex, sliceEnd);
        console.log(`StakeOverview: Sliced ${displayItems.length} items from offset data using indices ${relativeStartIndex}-${sliceEnd}`);
      } else {
        console.log(`StakeOverview: No data available for current page ${currentPage} in loaded data with offset=${apiOffset}`);
        displayItems = [];
      }
    }
    // For pages when offset is 0 and not the first page
    else {
      // Standard client-side pagination
      const startIndex = (currentPage - 1) * claimHistoryItemsPerPage;
      const endIndex = Math.min(startIndex + claimHistoryItemsPerPage, allClaims.length);

      console.log(`StakeOverview: Using client-side pagination for page ${currentPage} - indices: ${startIndex}-${endIndex}, total claims: ${allClaims.length}`);

      // Make sure we don't go out of bounds
      if (startIndex >= allClaims.length) {
        console.warn(`StakeOverview: Start index ${startIndex} is beyond available claims length ${allClaims.length}`);
        displayItems = [];
      } else {
        displayItems = allClaims.slice(startIndex, endIndex);
      }
    }

    console.log(`StakeOverview: Setting ${displayItems.length} paginated claims for current page ${currentPage}`);
    setPaginatedClaimsHistory(displayItems);
  }, [claimsHistory, currentPage, claimHistoryItemsPerPage, combinedAdxClaims, token]);

  const sortedLockedStakes = lockedStakes
    ? lockedStakes.sort((a: LockedStakeExtended, b: LockedStakeExtended) => {
      const sizeModifier = sortConfig.size === 'asc' ? 1 : -1;
      const durationModifier = sortConfig.duration === 'asc' ? 1 : -1;

      const sizeDiff = (Number(a.amount) - Number(b.amount)) * sizeModifier;
      const durationDiff = ((Number(a.endTime) * 1000) - (Number(b.endTime) * 1000)) * durationModifier;

      if (sortConfig.lastClicked === 'size') {
        return sizeDiff !== 0 ? sizeDiff : durationDiff; // If sizeDiff is zero, fall back to durationDiff.
      }

      if (sortConfig.lastClicked === 'duration') {
        return durationDiff !== 0 ? durationDiff : sizeDiff; // If durationDiff is zero, fall back to sizeDiff.
      }

      // Fallback sorting by duration or size if none was clicked
      return durationDiff || sizeDiff;
    })
    : [];

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    const interval = setInterval(() => {
      const nextRound = getNextStakingRoundStartTime(
        stakingAccount.currentStakingRound.startTime,
      ).getTime();

      if ((nextRound - Date.now()) < 0) {
        setRoundPassed(true);
      } else if (roundPassed) {
        setRoundPassed(false);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [roundPassed, stakingAccount]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sortConfig));
  }, [sortConfig, storageKey]);

  const handleClaim = async () => {
    setIsClaimingRewards(true);

    try {
      await handleClickOnClaimRewards();
    } finally {
      setIsClaimingRewards(false);
    }
  };

  const handleClaimAndBuyAdx = async () => {
    setIsClaimingAndBuyAdxRewards(true);

    try {
      await handleClickOnClaimRewardsAndBuyAdx();
    } finally {
      setIsClaimingAndBuyAdxRewards(false);
    }
  };

  const handleSort = (key: 'size' | 'duration') => {
    setSortConfig((prev) => ({
      ...prev,
      [key]: prev[key] === 'desc' ? 'asc' : 'desc',
      lastClicked: key,
    }));
  };

  const triggerResolveStakingRound = async () => {
    const notification = MultiStepNotification.newForRegularTransaction(
      `Resolve ${isALP ? 'ALP' : 'ADX'} Staking Round`,
    ).fire();

    try {
      await window.adrena.client.resolveStakingRound({
        stakedTokenMint: isALP
          ? window.adrena.client.lpTokenMint
          : window.adrena.client.lmTokenMint,
        notification,
      });

      setTimeout(() => {
        triggerReload();
      }, 0);
    } catch (error) {
      console.error('error', error);
    }
  };

  const totalStakeAmount =
    (isALP
      ? totalLockedStake
      : Number(totalLockedStake) + Number(totalLiquidStaked)) ?? 0;
  const isBigStakeAmount = totalStakeAmount > 1000000;

  const allTimeClaimedUsdc =
    (claimsHistory?.allTimeUsdcClaimed ?? 0) + optimisticAllTimeUsdcClaimedAllSymbols;
  const allTimeClaimedAdx =
    (claimsHistory?.allTimeAdxClaimed ?? 0) + optimisticAllTimeAdxClaimedAllSymbols;

  const numberTotalCountClaims = claimsHistory?.symbols.reduce((acc, symbol) => acc + symbol.allTimeCountClaims, 0) ?? 0;
  const isMediumUsdcAllTimeClaimAmount = allTimeClaimedUsdc >= 1000;
  const isMediumAdxAllTimeClaimAmount = allTimeClaimedAdx >= 1000;
  const isBigUsdcAllTimeClaimAmount = allTimeClaimedUsdc >= 100_000;
  const isBigAdxAllTimeClaimAmount = allTimeClaimedAdx >= 1_000_000;

  const downloadClaimHistory = useCallback(() => {
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
  }, [claimsHistory, token]);

  const [isLoadingMoreClaims, setIsLoadingMoreClaims] = useState(false);

  return (
    <div className="flex flex-col bg-main rounded-2xl border">
      <div className="p-5 pb-0">
        <div className="flex flex-col sm:flex-row items-stretch h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-lg shadow-lg">
          <div
            className={twMerge(
              'flex items-center w-full sm:w-auto sm:min-w-[200px] rounded-t-lg sm:rounded-r-none sm:rounded-l-lg p-3 flex-none sm:border-r',
              isALP ? 'bg-[#130AAA]' : 'bg-[#991B1B]',
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
              : 'Align with the protocol long term success: the longer the period, the higher the rewards. 20% of protocol fees are distributed to ADX stakers.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col h-full">
        {/* Pending rewards block */}
        <div className="h-[1px] bg-bcolor w-full my-3" />
        <div className="px-5">
          <div className={twMerge("flex mb-2 items-center w-full", isMobile ? 'flex-col' : '')}>
            <div className='flex gap-2'>
              <h3 className="text-lg font-semibold">Pending Rewards</h3>
              <Tippy
                content={
                  <div className="p-2">
                    {isALP ? (
                      <>
                        <p className="text-sm mb-1">
                          ADX and USDC rewards automatically accrue at the end of
                          every staking round.
                        </p>
                        <p className="text-sm">
                          Locked ALP can be retrieved once the locking period is
                          over, or by doing an early exit.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm mb-1">
                          ADX rewards automatically accrue at the end of every
                          staking round.
                        </p>
                        <p className="text-sm">
                          Liquid staked ADX can be unstaked at any time. Locked
                          ADX can be retrieved once the locking period is over, or
                          by performing an early exit.
                        </p>
                      </>
                    )}
                  </div>
                }
                placement="auto"
              >
                <Image
                  src={infoIcon}
                  width={16}
                  height={16}
                  alt="info icon"
                  className="inline-block ml-2 cursor-pointer txt op center mr-2"
                />
              </Tippy>
            </div>

            <div className={twMerge('flex gap-4', isMobile ? 'mt-2 w-full' : 'ml-auto')}>
              <Button
                variant="primary"
                size="sm"
                title={isClaimingAndBuyAdxRewards ? 'Claiming & buying ADX...' : 'Claim & Buy ADX'}
                className={twMerge("px-5", isMobile ? 'w-1/2' : 'w-[13em] min-w-[13em]')}
                onClick={handleClaimAndBuyAdx}
                disabled={
                  userPendingUsdcRewards +
                  userPendingAdxRewards +
                  pendingGenesisAdxRewards <=
                  0
                }
              />

              <Button
                variant="primary"
                size="sm"
                title={isClaimingRewards ? 'Claiming...' : 'Claim'}
                className={twMerge("px-5", isMobile ? 'w-1/2' : 'w-[9em]')}
                onClick={handleClaim}
                disabled={
                  userPendingUsdcRewards +
                  userPendingAdxRewards +
                  pendingGenesisAdxRewards <=
                  0
                }
              />
            </div>
          </div>

          <div className="flex flex-col border bg-secondary rounded-xl shadow-lg overflow-hidden">
            {/* Pending rewards block */}
            <div className="flex-grow"></div>
            <div className="flex flex-col border p-3 bg-secondary rounded-xl shadow-lg h-[90px]">
              <div className="flex flex-col space-y-1 flex-grow">
                <div className="flex justify-between">
                  <span className="text-txtfade">
                    Your share of {isALP ? '70%' : '20%'} platform&apos;s
                    revenue:
                  </span>
                  <div className="flex items-center">
                    <FormatNumber nb={userPendingUsdcRewards} />
                    <Image
                      src={usdcTokenLogo}
                      width={16}
                      height={16}
                      className="ml-1 opacity-50"
                      alt="usdc token logo"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-txtfade">
                    LM rewards
                    <span className="text-txtfade ">
                      {' '}
                      (see
                      <Link
                        href={
                          isALP
                            ? 'https://docs.adrena.xyz/tokenomics/alp/staked-alp-rewards-emissions-schedule'
                            : 'https://docs.adrena.xyz/tokenomics/adx/staked-adx-rewards-emissions-schedule'
                        }
                        className="underline ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        schedule
                      </Link>
                      ):
                    </span>
                  </span>
                  <div className="flex items-center">
                    <FormatNumber nb={userPendingAdxRewards} />
                    <Image
                      src={adxTokenLogo}
                      width={16}
                      height={16}
                      className="ml-1 opacity-50"
                      alt="adx token logo"
                    />
                  </div>
                </div>
                {pendingGenesisAdxRewards > 0 && (
                  <div className="flex justify-between">
                    <span className="text-txtfade">
                      Genesis campaign LM rewards bonus
                      <Tippy
                        content={
                          <p>
                            These rewards accrue over time for the first 180
                            days of the protocol. The amount is proportional to
                            your participation in the Genesis Liquidity
                            campaign. <br />
                            <br /> Thank you for being an early supporter of the
                            protocol! 🎊 🎁
                          </p>
                        }
                        placement="auto"
                      >
                        <Image
                          src={infoIcon}
                          width={14}
                          height={14}
                          alt="info icon"
                          className="inline-block ml-1 mr-1 cursor-pointer"
                        />
                      </Tippy>
                      :
                    </span>
                    <div className="flex items-center">
                      <FormatNumber
                        nb={pendingGenesisAdxRewards}
                        className="text-green"
                        prefix="+"
                        isDecimalDimmed={false}
                      />
                      <Image
                        src={adxTokenLogo}
                        width={16}
                        height={16}
                        className="ml-1 opacity-50"
                        alt="adx token logo"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="flex flex-col gap-2 text-sm px-3">
            <div className="flex items-center justify-between mt-2">
              <span className="text-txtfade flex items-center">
                <Tippy
                  content={
                    <p className="font-medium">
                      Each round duration is ~6h (+/- some jitter due to Sablier
                      on chain decentralized execution).
                      <br />
                      At the end of a round, the accrued rewards become
                      claimable, and a new round starts.
                      <br />
                      The ADX and ALP rounds are not necessarily in sync.
                    </p>
                  }
                  placement="auto"
                >
                  <Image
                    src={infoIcon}
                    width={14}
                    height={14}
                    alt="info icon"
                    className="inline-block mr-1"
                  />
                </Tippy>
                New rewards unlocking in:
              </span>

              <div className="flex items-center">
                {stakingAccount && (
                  <div className="flex items-center justify-center w-[7em]">
                    <RemainingTimeToDate
                      timestamp={
                        getNextStakingRoundStartTime(
                          stakingAccount.currentStakingRound.startTime,
                        ).getTime() / 1000
                      }
                      className="inline-flex items-center text-nowrap"
                      tippyText=""
                    />
                  </div>
                )}

                <div className="justify-end ml-2 hidden sm:flex">
                  <Link
                    href="https://docs.adrena.xyz/tokenomics/adx/staking-and-duration-locked-parameters-for-adx"
                    className="text-xs text-txtfade underline opacity-40 hover:opacity-100 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    learn more &gt;
                  </Link>
                </div>
              </div>
            </div>

            {roundPassed ? (
              <Button
                variant="outline"
                className="text-xs"
                title="Trigger Resolve Staking Round"
                onClick={() => triggerResolveStakingRound()}
              />
            ) : null}
          </div>
        </div>

        <div className="h-[1px] bg-bcolor w-full my-4" />

        <div className="flex flex-col text-sm py-0 px-5 w-full">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full text-white rounded-lg transition-colors duration-200">
            <div className='flex flex-col'>
              <div className='flex flex-row gap-2 items-center select-none'>
                <div className="flex items-center justify-between">
                  <div className='mr-2'>
                    <h3 className="md:text-lg font-semibold">Claim History</h3>
                  </div>

                  <h3 className="text-lg font-semibold text-txtfade">
                    {numberTotalCountClaims ? ` (${numberTotalCountClaims})` : ''}
                  </h3>

                  {claimsHistory ? <div className='w-auto flex mr-2 mt-2 opacity-50 hover:opacity-100 cursor-pointer gap-1 ml-2' onClick={() => {
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

              <p className='text-xs text-txtfade'>Subject to 30s delay</p>
            </div>

            {/* TOTALs */}
            {claimsHistory && (
              <div className="flex flex-col items-start text-xs text-txtfade bg-secondary rounded-lg border border-bcolor pt-1 pb-1 pl-2 pr-2">
                <div className="flex flex-row items-center">
                  <p className="text-txtfade">
                    All time claimed amounts:
                    <Tippy
                      content={
                        <div className="p-2">
                          <div className="text-sm mb-1">
                            This total includes all rewards claimed from both ADX and ALP staking combined.
                          </div>
                          <div className="text-sm">
                            The amounts represent your accumulated rewards across all staking activities for both tokens.
                          </div>
                          {claimsHistory && (
                            <div className="text-sm mt-2">
                              <strong>Breakdown by token:</strong>
                              <table className="w-full mt-1 border-collapse">
                                <thead className="border-b border-gray-700">
                                  <tr>
                                    <th className="text-left py-1">Token</th>
                                    <th className="text-right py-1">USDC rewards</th>
                                    <th className="text-right py-1">ADX rewards</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="py-1">ADX</td>
                                    <td className="text-right py-1">
                                      {formatNumber(claimsHistory.symbols.find(s => s.symbol === 'ADX')?.allTimeRewardsUsdc || 0, 2, 2)}
                                    </td>
                                    <td className="text-right py-1">
                                      {formatNumber(claimsHistory.symbols.find(s => s.symbol === 'ADX')?.allTimeRewardsAdx || 0, 2, 2)}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="py-1">ALP</td>
                                    <td className="text-right py-1">
                                      {formatNumber(claimsHistory.symbols.find(s => s.symbol === 'ALP')?.allTimeRewardsUsdc || 0, 2, 2)}
                                    </td>
                                    <td className="text-right py-1">
                                      {formatNumber(
                                        (claimsHistory.symbols.find(s => s.symbol === 'ALP')?.allTimeRewardsAdx || 0) +
                                        (claimsHistory.symbols.find(s => s.symbol === 'ALP')?.allTimeRewardsAdxGenesis || 0),
                                        2, 2
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      }
                      placement="auto"
                    >
                      <Image
                        src={infoIcon}
                        width={14}
                        height={14}
                        alt="info icon"
                        className="inline-block ml-1 cursor-pointer"
                      />
                    </Tippy>
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
                      className="text-txtfade"
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
                      className="text-txtfade"
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
            )}
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
                totalItems={numberTotalCountClaims ? numberTotalCountClaims : 0}
                itemsPerPage={claimHistoryItemsPerPage}
                batchSize={claimsLimit}
                onPageChange={(page) => {
                  console.log(`StakeOverview: Page changed to ${page}`);
                  setCurrentPage(page);
                }}
                isLoading={isLoadingMoreClaims}
                totalLoaded={claimsHistory ? claimsHistory.symbols.reduce(
                  (acc, symbol) => acc + symbol.claims.length, 0
                ) : 0}
                onLoadMore={async (offset, limit) => {
                  if (!loadClaimsHistory) {
                    console.log("StakeOverview: No loadClaimsHistory function available");
                    return;
                  }

                  console.log(`StakeOverview: Starting to load more claims data - requested offset=${offset}, limit=${limit}`);
                  setIsLoadingMoreClaims(true);

                  try {
                    console.log("StakeOverview: Calling loadClaimsHistory");
                    await loadClaimsHistory(offset, limit);
                    console.log(`StakeOverview: Claims data loaded successfully for offset=${offset}, limit=${limit}`);

                    // Give the system time to process the new data
                    // This ensures the UI updates correctly
                    setTimeout(() => {
                      setIsLoadingMoreClaims(false);
                    }, 100);
                  } catch (error) {
                    console.error('StakeOverview: Failed to load claim history:', error);
                    setIsLoadingMoreClaims(false);
                  }
                }}
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

        <div className="h-[1px] bg-bcolor w-full my-4" />

        {/* Locked stakes section */}
        <div className="px-5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold mr-2">My Locked Stakes</h3>
              <h3 className="text-lg font-semibold text-txtfade">
                {lockedStakes?.length ? ` (${lockedStakes.length})` : ''}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto">
              <div className="flex items-center text-xs bg-secondary rounded-full p-[2px] border border-bcolor">
                <button
                  className="px-2 py-1 rounded-full transition-colors flex items-center"
                  onClick={() => handleSort('size')}
                >
                  Amount
                  <span className="ml-1 text-txtfade text-[10px]">
                    {sortConfig.size === 'asc' ? '↑' : '↓'}
                  </span>
                </button>
                <div className="w-px h-4 bg-bcolor mx-[1px]"></div>
                <button
                  className="px-2 py-1 rounded-full transition-colors flex items-center"
                  onClick={() => handleSort('duration')}
                >
                  Unlock Date
                  <span className="ml-1 text-txtfade text-[10px]">
                    {sortConfig.duration === 'asc' ? '↑' : '↓'}
                  </span>
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                className='w-[8em]'
                title="Add Stake"
                onClick={() =>
                  handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_LOCK_DURATION)
                }
              />
            </div>
          </div>

          <LockedStakes
            lockedStakes={sortedLockedStakes}
            className='gap-3 mt-4'
            handleRedeem={handleLockedStakeRedeem}
            handleClickOnFinalizeLockedRedeem={
              handleClickOnFinalizeLockedRedeem
            }
            handleClickOnUpdateLockedStake={
              handleClickOnUpdateLockedStake
            }
          />
        </div>

        {/* Liquid stake section */}
        <div className="pb-8">
          {!isALP && (
            <>
              <div className="h-[1px] bg-bcolor w-full my-5" />
              <div className="px-5">
                <h3 className="text-lg font-semibold mb-2">Liquid stake</h3>
                <div className="flex flex-col sm:flex-row justify-between items-center border p-3 bg-secondary rounded-xl mt-3 shadow-lg">
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
                      variant="outline"
                      size="sm"
                      title="Unstake"
                      className={twMerge(
                        'px-5',
                        (!totalLiquidStaked || totalLiquidStaked <= 0) &&
                        'opacity-50 cursor-not-allowed',
                      )}
                      onClick={handleClickOnRedeem}
                      disabled={!totalLiquidStaked || totalLiquidStaked <= 0}
                    />

                    <Button
                      variant="primary"
                      size="sm"
                      title={
                        totalLiquidStaked && totalLiquidStaked > 0
                          ? 'Add Stake'
                          : 'Stake'
                      }
                      className="px-5"
                      onClick={() =>
                        handleClickOnStakeMore(LIQUID_STAKE_LOCK_DURATION)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
