import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import adxIcon from '@/../public/images/adrena_logo_adx_white.svg';
import downloadIcon from '@/../public/images/download.png';
import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import useClaimHistory from '@/hooks/useClaimHistory';
import { WalletStakingAccounts } from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { ClaimHistoryExtended, LockedStakeExtended } from '@/types';
import {
  formatDate,
  formatPriceInfo,
  getAdxLockedStakes,
  getAlpLockedStakes,
  nativeToUi,
} from '@/utils';

import TableV2, { TableV2HeaderType } from '../monitoring/TableV2';

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

  const batchSize = 50;
  const itemsPerPage = 50;

  const {
    isLoadingClaimHistory,
    claimHistoryGraphData,
    claimsHistory,
    // Pagination-related values
    currentPage,
    totalPages,
    loadPageData,
  } = useClaimHistory({
    walletAddress,
    batchSize,
    itemsPerPage,
    symbol: 'ADX',
  });

  const [liquidStakedADX, setLiquidStakedADX] = useState<number | null>(null);
  const [lockedStakedADX, setLockedStakedADX] = useState<number | null>(null);
  const [, setLockedStakedALP] = useState<number | null>(null);

  // const allAdxClaims =
  //   claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')?.claims ||
  //   [];

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

  // Calculate the all-time claimed amounts
  const allTimeClaimedUsdc =
    claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')
      ?.allTimeRewardsUsdc ?? 0;

  const allTimeClaimedAdx =
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')
      ?.allTimeRewardsAdx ?? 0) +
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === 'ADX')
      ?.allTimeRewardsAdxGenesis ?? 0);

  const claimData = claimsHistory
    ? (claimsHistory.symbols.find((symbol) => symbol.symbol === 'ADX')
        ?.claims ?? null)
    : null;

  if (!claimData) return null;

  return (
    <div
      className={twMerge(
        'm-3 rounded-lg border border-bcolor overflow-hidden bg-[#040D14]',
        className,
      )}
    >
      <div className="flex flex-row gap-2 items-center bg-third border-b p-2 px-3">
        <Image
          src={adxIcon}
          alt="ADX"
          width={24}
          height={24}
          className="w-4 h-4 opacity-50"
        />
        <p className="text-lg font-interSemibold">Staked ADX</p>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="p-3 border-r border-bcolor h-44 lg:h-auto lg:basis-1/3">
          {claimHistoryGraphData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={claimHistoryGraphData.map((claim) => ({
                  date: new Date(claim.transaction_date),
                  usdc: claim.rewards_usdc,
                  adx: claim.rewards_adx * (tokenPrice || 0),
                  genesisAdx: claim.rewards_adx_genesis * (tokenPrice || 0),
                }))}
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

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatDate(value)}
                  fontSize="12"
                  display="none"
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
                        genesisAdx: 2,
                      }}
                      total={true}
                      totalColor="#10b981"
                    />
                  }
                  cursor={false}
                />
                <Bar dataKey="usdc" stackId="a" fill="#3986FF" name="USDC" />

                <Bar
                  dataKey="adx"
                  stackId="a"
                  fill="#FF344F"
                  name="ADX (USD)"
                />

                <Bar
                  dataKey="genesis adx"
                  stackId="a"
                  fill="#FF344F"
                  name="Genesis ADX (USD)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 p-3 sm:basis-2/3">
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center bg-third border border-inputcolor justify-between rounded-lg p-2 flex-1 gap-2">
              <p className="opacity-50 text-sm">Liquid Staked</p>{' '}
              <FormatNumber
                nb={liquidStakedADX}
                precision={2}
                isDecimalDimmed={false}
                suffix=" ADX"
                className="font-mono text-sm"
                isAbbreviate={
                  liquidStakedADX ? liquidStakedADX > 1_000_000 : false
                }
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center bg-third border border-inputcolor justify-between rounded-lg p-2 flex-1 gap-2">
              <p className="opacity-50 text-sm">Locked Staked ADX</p>{' '}
              <FormatNumber
                nb={lockedStakedADX}
                precision={2}
                isDecimalDimmed={false}
                suffix=" ADX"
                className="font-mono text-sm"
                isAbbreviate={
                  lockedStakedADX ? lockedStakedADX > 1_000_000 : false
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <StatsTable
              paginatedClaims={claimData}
              tokenPrice={tokenPrice}
              currentPage={currentPage}
              totalPages={totalPages}
              loadPageData={loadPageData}
              isLoadingClaimHistory={isLoadingClaimHistory}
              stats={[
                {
                  title: 'total USDC',
                  value: allTimeClaimedUsdc,
                  format: 'currency',
                },
                { title: 'total ADX', value: allTimeClaimedAdx },
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
  currentPage,
  totalPages,
  loadPageData,
  isLoadingClaimHistory,
  stats,
}: {
  paginatedClaims: ClaimHistoryExtended[];
  tokenPrice: number | null;
  currentPage: number;
  totalPages: number;
  loadPageData: (page: number) => Promise<void>;
  isLoadingClaimHistory: boolean;
  stats: {
    title: string;
    value: number;
    format?: 'currency' | 'number';
  }[];
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'block'>('table');

  const headers: TableV2HeaderType[] = [
    { title: 'Claimed On', sticky: 'left', key: 'claimedOn' },
    { title: 'Source', key: 'source', width: 90 },
    { title: 'USDC rewards', key: 'usdcReward', align: 'right' },
    { title: 'ADX rewards', key: 'adxReward', align: 'right' },
    {
      title: 'Total rewards',
      key: 'totalReward',
      align: 'right',
    },
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
        isIndicator={viewMode === 'table'}
      />
    ),
  }));

  return (
    <div className="flex flex-col gap-3">
      <TableV2
        headers={headers}
        data={data}
        bottomBar={<BottomBar stats={stats} />}
        height={'16rem'}
        isSticky={window.innerWidth < 1200}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentPage={currentPage}
        totalPages={totalPages}
        loadPageData={loadPageData}
        isLoading={isLoadingClaimHistory}
        title="Claim History"
      />
    </div>
  );
};

const TotalRewardsCell = ({
  totalRewards,
  maxValue,
  minValue,
  isIndicator,
}: {
  totalRewards: number;
  maxValue: number;
  minValue: number;
  isIndicator: boolean;
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
      {isIndicator ? (
        <div
          className={twMerge(
            'absolute bottom-0 left-0 bg-green/10 w-full pointer-events-none z-0',
          )}
          style={{ height: `${heightPct}%` }}
        />
      ) : null}
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
    <div className="flex flex-row items-center gap-2 sm:gap-5 p-1.5 px-2 sm:px-3 border-r border-r-inputcolor">
      {stats.map((stat) => (
        <div key={stat.title} className="flex flex-row gap-2 items-center">
          <p className="text-xs font-mono opacity-50">{stat.title}</p>
          <FormatNumber
            nb={stat.value}
            format={stat.format}
            isDecimalDimmed={false}
            className="text-xs font-interSemibold"
            isAbbreviate={window.innerWidth < 640}
          />
        </div>
      ))}
    </div>

    <div className="flex flex-row items-center">
      <div className="flex flex-row items-center p-1.5 px-2 sm:px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300">
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
