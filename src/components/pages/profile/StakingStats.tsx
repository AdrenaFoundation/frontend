import 'react-datepicker/dist/react-datepicker.css';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
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
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import DataApiClient from '@/DataApiClient';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
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

interface ExportOptions {
  type: 'all' | 'year' | 'dateRange';
  year?: number;
  startDate?: string;
  endDate?: string;
}

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

  // Export modal state
  const [isDownloading, setIsDownloading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'year',
    year: new Date().getFullYear()
  });
  const [exportWarning, setExportWarning] = useState<string>('');

  const downloadClaimHistory = useCallback(async (options: ExportOptions): Promise<boolean> => {
    if (!walletAddress || isDownloading) {
      return false;
    }

    setIsDownloading(true);
    setExportWarning(''); // Clear any previous warnings

    try {
      // Server uses large default page size (500,000), so most users get everything in one request
      const exportParams: Parameters<typeof DataApiClient.exportClaims>[0] = {
        userWallet: walletAddress,
        symbol: 'ADX', // ADX staking claims
      };

      if (options.type === 'year' && options.year) {
        exportParams.year = options.year;
      } else if (options.type === 'dateRange') {
        if (options.startDate) {
          exportParams.startDate = new Date(options.startDate);
        }
        if (options.endDate) {
          const endDate = new Date(options.endDate);
          endDate.setUTCHours(23, 59, 59, 999);
          exportParams.endDate = endDate;
        }
      }

      const firstPageResult = await DataApiClient.exportClaims(exportParams);

      if (!firstPageResult) {
        setExportWarning('Failed to export claims. Please try again.');
        return false;
      }

      const { csvData, metadata } = firstPageResult;

      if (!csvData || csvData.trim().length === 0 || metadata.totalClaims === 0) {
        setExportWarning(`No claims available for ${options.type === 'year' ? `year ${options.year}` : `date range ${options.startDate} to ${options.endDate}`}`);
        return false;
      }

      let allCsvData = csvData;

      // Handle rare case where data spans multiple pages (very large datasets +500k claims)
      if (metadata.totalPages > 1) {
        for (let page = 2; page <= metadata.totalPages; page++) {
          const pageResult = await DataApiClient.exportClaims({
            ...exportParams,
            page,
          });

          if (pageResult && pageResult.csvData) {
            const lines = pageResult.csvData.split('\n');
            const dataWithoutHeader = lines.slice(1).join('\n');
            if (dataWithoutHeader.trim()) {
              allCsvData += '\n' + dataWithoutHeader;
            }
          }

          if (page < metadata.totalPages) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      // Create filename based on options
      let filename = `claims-adx-${walletAddress.slice(0, 8)}`;
      if (options.type === 'year' && options.year) {
        filename += `-${options.year}`;
      } else if (options.type === 'dateRange') {
        if (options.startDate) filename += `-from-${options.startDate}`;
        if (options.endDate) filename += `-to-${options.endDate}`;
      }
      filename += `-${new Date().toISOString().split('T')[0]}.csv`;

      // Create and download the CSV file
      const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(allCsvData)}`;

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return true; // Success
    } catch (error) {
      console.error('Error downloading claim history:', error);
      setExportWarning('Failed to export claims. Please try again.');
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [walletAddress, isDownloading]);

  const handleExportSubmit = async () => {
    const success = await downloadClaimHistory(exportOptions);
    // Only close modal if export was successful
    if (success) {
      setShowExportModal(false);
    }
  };

  const getCurrentYear = () => new Date().getFullYear();
  const getYearOptions = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let year = currentYear; year >= 2024; year--) {
      years.push(year);
    }
    return years;
  };

  const hasDateFields = Boolean(exportOptions.startDate || exportOptions.endDate);

  const isExportValid = () => {
    if (!hasDateFields) {
      return true;
    } else {
      return Boolean(exportOptions.startDate && exportOptions.endDate);
    }
  };

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
    <>
      {/* Export Modal */}
      {showExportModal && (
        <Modal
          title="Export Claim History - ADX"
          close={() => {
            setExportWarning(''); // Clear warning when closing modal
            setShowExportModal(false);
          }}
        >
          <div className="flex flex-col gap-6 p-6 min-w-[400px] sm:min-w-[500px]">
            {/* Year Option */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-medium text-white">Export by Year</h3>
              <div className="flex items-center gap-3">
                <label className="text-xs text-white/60">Year:</label>
                <div className="relative flex items-center bg-[#0A1117] rounded-lg border border-gray-800/50">
                  <Select
                    selected={String(exportOptions.year || getCurrentYear())}
                    onSelect={(value: string) => {
                      setExportWarning(''); // Clear warning when changing options
                      setExportOptions({
                        type: 'year',
                        year: parseInt(value),
                        startDate: '',
                        endDate: ''
                      });
                    }}
                    options={getYearOptions().map(year => ({ title: String(year) }))}
                    reversed={true}
                    className="h-8 flex items-center px-2"
                    selectedTextClassName="text-xs font-medium flex-1 text-left"
                    menuTextClassName="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/40">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Date Range Option */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-medium text-white">Export by Date Range</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-white/60">From:</label>
                  <div className="h-10 bg-[#0A1117] border border-gray-800/50 rounded overflow-hidden">
                    <DatePicker
                      selected={exportOptions.startDate ? new Date(exportOptions.startDate) : null}
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          startDate: date ? date.toISOString().split('T')[0] : ''
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select start date"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date('2024-09-25')}
                      maxDate={exportOptions.endDate ? new Date(exportOptions.endDate) : new Date()}
                      popperClassName="z-[200]"
                      popperPlacement="bottom-start"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-white/60">To:</label>
                  <div className="h-10 bg-[#0A1117] border border-gray-800/50 rounded overflow-hidden">
                    <DatePicker
                      selected={exportOptions.endDate ? new Date(exportOptions.endDate) : null}
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          endDate: date ? date.toISOString().split('T')[0] : ''
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select end date"
                      dateFormat="yyyy-MM-dd"
                      minDate={exportOptions.startDate ? new Date(exportOptions.startDate) : new Date('2024-09-25')}
                      maxDate={new Date()}
                      popperClassName="z-[200]"
                      popperPlacement="bottom-start"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            {exportWarning && (
              <div className='text-xs text-orange font-boldy'>
                {exportWarning}
              </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={() => {
                  setExportWarning(''); // Clear warning when canceling
                  setShowExportModal(false);
                }}
                variant="secondary"
                className="px-4 py-2"
                title="Cancel"
              />
              <Button
                onClick={handleExportSubmit}
                disabled={!isExportValid()}
                className="px-4 py-2"
                title={isDownloading ? 'Exporting...' : 'Export'}
              />
            </div>
          </div>
        </Modal>
      )}

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
                onDownloadClick={() => {
                  setExportWarning(''); // Clear any previous warnings
                  setShowExportModal(true);
                }}
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
    </>
  );
}

const StatsTable = ({
  paginatedClaims,
  tokenPrice,
  currentPage,
  totalPages,
  loadPageData,
  isLoadingClaimHistory,
  onDownloadClick,
  stats,
}: {
  paginatedClaims: ClaimHistoryExtended[];
  tokenPrice: number | null;
  currentPage: number;
  totalPages: number;
  loadPageData: (page: number) => Promise<void>;
  isLoadingClaimHistory: boolean;
  onDownloadClick: () => void;
  stats: {
    title: string;
    value: number;
    format?: 'currency' | 'number';
  }[];
}) => {
  const isMobile = useBetterMediaQuery('(max-width: 1200px)');
  const [viewMode, setViewMode] = useState<'table' | 'block'>('table');

  const headers: TableV2HeaderType[] = [
    { title: 'Claimed On', sticky: 'left', key: 'claimedOn' },
    { title: 'Source', key: 'source', width: 5.625 },
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
        bottomBar={<BottomBar stats={stats} onDownloadClick={onDownloadClick} />}
        height={'16rem'}
        isSticky={!!isMobile}
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
  onDownloadClick,
}: {
  stats: {
    title: string;
    value: number;
    format?: 'currency' | 'number';
  }[];
  onDownloadClick: () => void;
}) => {
  const isMobile = useBetterMediaQuery('(max-width: 640px)');

  return (
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
              isAbbreviate={!!isMobile}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-row items-center">
        <div
          className="flex flex-row items-center p-1.5 px-2 sm:px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
          onClick={onDownloadClick}
        >
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
  )
}
