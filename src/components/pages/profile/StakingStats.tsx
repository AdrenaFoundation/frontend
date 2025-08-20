import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import downloadIcon from '@/../public/images/download.png';
import calendarIcon from '@/../public/images/Icons/calendar.svg';
import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import useClaimHistory from '@/hooks/useClaimHistory';
import { WalletStakingAccounts } from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { ClaimHistoryExtended, LockedStakeExtended } from '@/types';
import {
  formatPriceInfo,
  getAdxLockedStakes,
  getAlpLockedStakes,
  nativeToUi,
} from '@/utils';

import TableV2 from '../monitoring/TableV2';

export default function StakingStats({
  stakingAccounts,
  walletAddress,
  className,
}: {
  className?: string;
  walletAddress: string | null;
  stakingAccounts: WalletStakingAccounts | null;
}) {
  const tokenPrices = useSelector((state) => state.tokenPrices);
  const tokenPrice = tokenPrices['ADX'];

  const batchSize = 100; // Example batch size
  const itemsPerPage = 100; // Example items per page

  const {
    isLoadingClaimHistory,
    claimsHistory,
    // Pagination-related values
    currentPage,
    // totalPages,
    loadPageData,
    getPaginatedData,
  } = useClaimHistory({
    walletAddress,
    batchSize,
    itemsPerPage,
    symbol: 'ADX',
  });

  const [liquidStakedADX, setLiquidStakedADX] = useState<number | null>(null);
  const [lockedStakedADX, setLockedStakedADX] = useState<number | null>(null);
  const [, setLockedStakedALP] = useState<number | null>(null);

  const allAdxClaims =
    claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')?.claims ||
    [];

  const [optimisticClaim, setOptimisticClaim] = useState<{
    rewards_usdc: number;
    rewards_adx: number;
  } | null>(null);
  const [attemptedLoads, setAttemptedLoads] = useState<Record<string, boolean>>(
    {},
  );

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

  // Reset optimistic claim when fresh data is loaded
  useEffect(() => {
    if (claimsHistory && optimisticClaim && setOptimisticClaim) {
      setOptimisticClaim(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimsHistory]);

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
    if (
      claims.length === 0 &&
      !isLoadingClaimHistory &&
      totalItems > 0 &&
      !attemptedLoads[currentPage]
    ) {
      // Mark this page as attempted
      setAttemptedLoads((prev) => ({ ...prev, [currentPage]: true }));

      // Use setTimeout to ensure this happens after the current render cycle
      // Only try once per render, don't loop
      setTimeout(() => {
        // Double-check we still need to load before trying
        // This helps prevent race conditions
        if (
          getPaginatedData(currentPage).length === 0 &&
          !attemptedLoads[currentPage]
        ) {
          loadPageData(currentPage);
        }
      }, 0);
    }

    return claims;
  }, [
    claimsHistory,
    currentPage,
    getPaginatedData,
    isLoadingClaimHistory,
    loadPageData,
    totalItems,
    attemptedLoads,
  ]);

  // const handlePageChange = (page: number) => {
  //   if (page === currentPage) return; // Don't reload the same page

  //   // Reset the attempt tracking for the new page to allow initial load
  //   setAttemptedLoads((prev) => {
  //     const newAttempts = { ...prev };
  //     // Clear the attempt for the new page
  //     delete newAttempts[page];
  //     return newAttempts;
  //   });

  //   loadPageData(page);
  // };

  // Reset attempted loads when wallet changes
  useEffect(() => {
    setAttemptedLoads({});
  }, [walletAddress]);

  // Calculate the all-time claimed amounts
  const allTimeClaimedUsdc =
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')
      ?.allTimeRewardsUsdc ?? 0) + (optimisticClaim?.rewards_usdc ?? 0);

  const allTimeClaimedAdx =
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')
      ?.allTimeRewardsAdx ?? 0) +
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')
      ?.allTimeRewardsAdxGenesis ?? 0) +
    (optimisticClaim?.rewards_adx ?? 0);

  return (
    <div
      className={twMerge(
        'm-3 rounded-lg border border-bcolor overflow-hidden bg-[#040D14]',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-third border-b">
        <p className="text-sm font-interSemibold p-2 px-3">Staked ADX</p>

        <div className="flex flex-row items-center gap-2 px-3 p-2 border-l border-inputcolor">
          <Image
            src={calendarIcon}
            alt="Calendar"
            width={12}
            height={12}
            className="w-3 h-3 opacity-50"
          />

          <p className="text-sm font-interMedium">
            {new Date('03/12/2024').toLocaleDateString('en-US', {
              year: 'numeric',
              day: 'numeric',
              month: 'short',
            })}{' '}
            –{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="p-3 border-r border-bcolor basis-1/3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={allAdxClaims
                .map((claim) => ({
                  date: new Date(claim.transaction_date),
                  usdc: claim.rewards_usdc,
                  adx: claim.rewards_adx * (tokenPrice || 0),
                }))
                .reverse()} // Reverse to show most recent first
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <YAxis
                tickFormatter={(value) => formatPriceInfo(value)}
                fontSize="12"
              />

              <Legend />
              <Tooltip
                content={
                  <CustomRechartsToolTip
                    format="currency"
                    precision={2}
                    labelCustomization={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    }}
                    precisionMap={{
                      usdc: 2,
                      adx: 2,
                    }}
                    total={true}
                    totalColor="#10b981"
                  />
                }
                cursor={false}
              />
              <Bar dataKey="usdc" stackId="a" fill="#3986FF" name="USDC" />
              <Bar dataKey="adx" stackId="a" fill="#FF344F" name="ADX (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-4 p-3 basis-2/3">
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-row items-center bg-third border border-inputcolor justify-between rounded-lg p-2 flex-1">
              <p className="opacity-50 text-sm">Liquid Staked</p>{' '}
              <FormatNumber
                nb={liquidStakedADX}
                precision={2}
                isDecimalDimmed={false}
                suffix=" ADX"
                className="font-mono text-sm"
              />
            </div>
            <div className="flex flex-row items-center bg-third border border-inputcolor justify-between rounded-lg p-2 flex-1">
              <p className="opacity-50 text-sm">Locked Staked ADX</p>{' '}
              <FormatNumber
                nb={lockedStakedADX}
                precision={2}
                isDecimalDimmed={false}
                suffix=" ADX"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <StatsTable
              paginatedClaims={paginatedClaims}
              tokenPrice={tokenPrice}
              stats={[
                {
                  title: 'Total USDC rewards',
                  value: allTimeClaimedUsdc,
                  format: 'currency',
                },
                { title: 'Total ADX rewards', value: allTimeClaimedAdx },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const StatsTable = ({
  paginatedClaims,
  tokenPrice,
  stats,
}: {
  paginatedClaims: ClaimHistoryExtended[];
  tokenPrice: number | null;
  stats: {
    title: string;
    value: number;
    format?: 'currency' | 'number';
  }[];
}) => {
  const headers = [
    { title: 'Claimed On', key: 'claimedOn' },
    { title: 'Source', key: 'source', width: 90 },
    { title: 'USDC rewards', key: 'usdcReward', align: 'right' as const },
    { title: 'ADX rewards', key: 'adxReward', align: 'right' as const },
    { title: 'Total rewards', key: 'totalReward', align: 'right' as const },
  ];

  const maxTotalRewards = Math.max(
    ...paginatedClaims.map(
      (claim) => claim.rewards_usdc + claim.rewards_adx * (tokenPrice ?? 0),
    ),
    0,
  );

  const minTotalRewards = Math.min(
    ...paginatedClaims.map(
      (claim) => claim.rewards_usdc + claim.rewards_adx * (tokenPrice ?? 0),
    ),
    0,
  );

  const data = paginatedClaims.map((claim) => ({
    claimedOn: (
      <p className="font-mono text-sm">
        {new Date(claim.transaction_date).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    ),
    source: (
      <p
        className={twMerge(
          'font-mono text-sm',
          claim.source === 'auto' ? 'text-blue' : 'text-orange',
        )}
      >
        {claim.source}
      </p>
    ),
    usdcReward: (
      <FormatNumber
        nb={claim.rewards_usdc}
        precision={2}
        isDecimalDimmed={false}
        suffix=" USDC"
        suffixClassName="text-sm"
        className="text-sm"
        isAbbreviate={claim.rewards_usdc > 1_000}
      />
    ),
    adxReward: (
      <FormatNumber
        nb={claim.rewards_adx}
        precision={2}
        isDecimalDimmed={false}
        suffix=" ADX"
        suffixClassName="text-sm"
        className="text-sm"
        isAbbreviate={claim.rewards_adx > 1_000}
      />
    ),
    totalReward: (
      <TotalRewardsCell
        totalRewards={
          claim.rewards_usdc + claim.rewards_adx * (tokenPrice ?? 0)
        }
        maxValue={maxTotalRewards}
        minValue={minTotalRewards}
      />
    ),
  }));

  return (
    <div className="flex flex-col gap-3">
      <TableV2
        headers={headers}
        data={data}
        bottomBar={<BottomBar stats={stats} />}
        maxHeight="12rem"
      />
    </div>
  );
};

const TotalRewardsCell = ({
  totalRewards,
  maxValue,
  minValue,
}: {
  totalRewards: number;
  maxValue: number;
  minValue: number;
}) => {
  const scaleMax = Math.max(Math.abs(maxValue), Math.abs(minValue)) || 1;
  const heightPct = normalize(totalRewards, 10, 100, 0, scaleMax);

  return (
    <div>
      <FormatNumber
        nb={totalRewards}
        precision={2}
        isDecimalDimmed={false}
        format="currency"
        suffixClassName="text-sm text-green"
        prefix="+ "
        className="text-sm text-green"
      />
      <div
        className={twMerge(
          'absolute bottom-0 left-0 bg-green/10 w-full pointer-events-none z-0',
        )}
        style={{ height: `${heightPct}%` }}
      />
    </div>
  );
};

const BottomBar = ({
  stats,
}: {
  stats: {
    title: string;
    value: number;
    format?: 'currency' | 'number';
  }[];
}) => (
  <div className="flex flex-row justify-between">
    <div className="flex flex-row items-center gap-5 p-1.5 px-3 border-r border-r-inputcolor">
      {stats.map((stat) => (
        <div key={stat.title} className="flex flex-row gap-2 items-center">
          <p className="text-xs font-mono opacity-50">{stat.title}</p>
          <FormatNumber
            nb={stat.value}
            format={stat.format}
            isDecimalDimmed={false}
            className="text-xs font-interSemibold"
          />
        </div>
      ))}
    </div>

    <div className="flex flex-row items-center">
      <div className="flex flex-row items-center gap-3 p-1.5 px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300">
        <Image
          src={downloadIcon}
          alt="Download"
          width={16}
          height={16}
          className="w-4 h-4"
        />
      </div>
    </div>
  </div>
);
