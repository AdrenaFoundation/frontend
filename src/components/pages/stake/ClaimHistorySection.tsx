import 'react-datepicker/dist/react-datepicker.css';

import Image from 'next/image';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import DatePicker from 'react-datepicker';
import { CSSTransition } from 'react-transition-group';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Pagination from '@/components/common/Pagination/Pagination';
import Select from '@/components/common/Select/Select';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import DataApiClient from '@/DataApiClient';
import useClaimHistory from '@/hooks/staking/useClaimHistory';
import { ClaimHistoryExtended } from '@/types';
import { formatNumber } from '@/utils';

import adxTokenLogo from '../../../../public/images/adx.svg';
import chevronDown from '../../../../public/images/chevron-down.svg';
import downloadIcon from '../../../../public/images/download.png';
import usdcTokenLogo from '../../../../public/images/usdc.svg';
import ClaimBlock from './ClaimBlock';

interface ExportOptions {
  type: 'all' | 'year' | 'dateRange';
  year?: number;
  startDate?: string;
  endDate?: string;
}

interface ClaimHistorySectionProps {
  walletAddress: string | null;
  token?: 'ADX' | 'ALP';
  batchSize?: number;
  itemsPerPage?: number;
  optimisticClaim?: ClaimHistoryExtended | null;
  setOptimisticClaim?: (claim: ClaimHistoryExtended | null) => void;
}

export default function ClaimHistorySection({
  walletAddress,
  token = 'ADX',
  batchSize = 1000,
  itemsPerPage = 2,
  optimisticClaim,
  setOptimisticClaim,
}: ClaimHistorySectionProps) {
  const [isClaimHistoryVisible, setIsClaimHistoryVisible] =
    React.useState(false);
  const nodeRef = useRef(null); // Reference for CSSTransition

  const [isDownloading, setIsDownloading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'year',
    year: new Date().getFullYear(),
  });
  const [exportWarning, setExportWarning] = useState<string>('');

  // Track which pages we've already attempted to load to prevent loops
  const [attemptedLoads, setAttemptedLoads] = React.useState<
    Record<number, boolean>
  >({});

  // Use the enhanced hook for all data fetching and pagination
  const {
    isLoadingClaimHistory,
    claimsHistory,
    // Pagination-related values
    currentPage,
    totalPages,
    loadPageData,
    getPaginatedData,
  } = useClaimHistory({
    walletAddress,
    batchSize,
    itemsPerPage,
    symbol: token,
  });

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

  // Reset attempted loads when wallet changes
  useEffect(() => {
    setAttemptedLoads({});
  }, [walletAddress]);

  // Calculate the all-time claimed amounts
  const allTimeClaimedUsdc =
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === token)
      ?.allTimeRewardsUsdc ?? 0) + (optimisticClaim?.rewards_usdc ?? 0);
  const allTimeClaimedAdx =
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === token)
      ?.allTimeRewardsAdx ?? 0) +
    (claimsHistory?.symbols.find((symbol) => symbol.symbol === token)
      ?.allTimeRewardsAdxGenesis ?? 0) +
    (optimisticClaim?.rewards_adx ?? 0);

  // Format helpers
  const isMediumUsdcAllTimeClaimAmount = allTimeClaimedUsdc >= 1000;
  const isMediumAdxAllTimeClaimAmount = allTimeClaimedAdx >= 1000;
  const isBigUsdcAllTimeClaimAmount = allTimeClaimedUsdc >= 100_000;
  const isBigAdxAllTimeClaimAmount = allTimeClaimedAdx >= 1_000_000;

  const handlePageChange = (page: number) => {
    if (page === currentPage) return; // Don't reload the same page

    // Reset the attempt tracking for the new page to allow initial load
    setAttemptedLoads((prev) => {
      const newAttempts = { ...prev };
      // Clear the attempt for the new page
      delete newAttempts[page];
      return newAttempts;
    });

    loadPageData(page);
  };

  // Message to display when no data is available
  const getNoDataMessage = () => {
    if (!claimsHistory) return 'No claim history available.';
    if (totalItems === 0) return 'No claim history available.';
    if (currentPage > totalPages) return "This page doesn't exist.";
    if (isLoadingClaimHistory) return 'Loading...';
    return 'No data available for this page.';
  };

  // Download handler - new server-side export
  const downloadClaimHistory = useCallback(
    async (options: ExportOptions): Promise<boolean> => {
      if (!walletAddress || isDownloading) {
        return false;
      }

      setIsDownloading(true);
      setExportWarning(''); // Clear any previous warnings

      try {
        // Server uses large default page size (500,000), so most users get everything in one request
        const exportParams: Parameters<typeof DataApiClient.exportClaims>[0] = {
          userWallet: walletAddress,
          symbol: token,
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

        if (
          !csvData ||
          csvData.trim().length === 0 ||
          metadata.totalClaims === 0
        ) {
          setExportWarning(
            `No claims available for ${options.type === 'year' ? `year ${options.year}` : `date range ${options.startDate} to ${options.endDate}`}`,
          );
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
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }
        }

        // Create filename based on options
        let filename = `claims-${token.toLowerCase()}-${walletAddress.slice(0, 8)}`;
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
    },
    [walletAddress, isDownloading, token],
  );

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

  const hasDateFields = Boolean(
    exportOptions.startDate || exportOptions.endDate,
  );

  const isExportValid = () => {
    if (!hasDateFields) {
      return true;
    } else {
      return Boolean(exportOptions.startDate && exportOptions.endDate);
    }
  };

  return (
    <div className="flex flex-col text-sm py-0 px-5 w-full">
      {/* Export Modal */}
      {showExportModal && (
        <Modal
          title={`Export Claim History - ${token}`}
          close={() => {
            setExportWarning(''); // Clear warning when closing modal
            setShowExportModal(false);
          }}
        >
          <div className="flex flex-col gap-6 p-6 min-w-[400px] sm:min-w-[500px]">
            {/* Year Option */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl text-white">Export by Year</h3>
              <div className="flex items-center gap-3">
                <label className="text-xs text-white/60">Year:</label>
                <div className="relative flex items-center bg-[#0A1117] rounded-md border border-gray-800/50">
                  <Select
                    selected={String(exportOptions.year || getCurrentYear())}
                    onSelect={(value: string) => {
                      setExportWarning(''); // Clear warning when changing options
                      setExportOptions({
                        type: 'year',
                        year: parseInt(value),
                        startDate: '',
                        endDate: '',
                      });
                    }}
                    options={getYearOptions().map((year) => ({
                      title: String(year),
                    }))}
                    reversed={true}
                    className="h-8 flex items-center px-2"
                    selectedTextClassName="text-xs flex-1 text-left"
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
              <h3 className="text-xl text-white">Export by Date Range</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-white/60">From:</label>
                  <div className="h-10 bg-[#0A1117] border border-gray-800/50 rounded overflow-hidden">
                    <DatePicker
                      selected={
                        exportOptions.startDate
                          ? new Date(exportOptions.startDate)
                          : null
                      }
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          startDate: date
                            ? date.toISOString().split('T')[0]
                            : '',
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select start date"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date('2024-09-25')}
                      maxDate={
                        exportOptions.endDate
                          ? new Date(exportOptions.endDate)
                          : new Date()
                      }
                      popperClassName="z-[200]"
                      popperPlacement="bottom-start"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-white/60">To:</label>
                  <div className="h-10 bg-[#0A1117] border border-gray-800/50 rounded overflow-hidden">
                    <DatePicker
                      selected={
                        exportOptions.endDate
                          ? new Date(exportOptions.endDate)
                          : null
                      }
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          endDate: date ? date.toISOString().split('T')[0] : '',
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select end date"
                      dateFormat="yyyy-MM-dd"
                      minDate={
                        exportOptions.startDate
                          ? new Date(exportOptions.startDate)
                          : new Date('2024-09-25')
                      }
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
              <div className="text-xs text-orange font-semibold">
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

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full text-white rounded-md transition-colors duration-200">
        <div className="flex flex-col">
          <div className="flex flex-row gap-2 items-center select-none">
            <div className="flex items-center justify-between">
              <div className="mr-2">
                <h3 className="md:text-lg font-semibold">Claim History</h3>
              </div>

              <h3 className="text-lg font-semibold text-txtfade">
                {totalItems && totalItems != claimsHistory?.allTimeCountClaims
                  ? ` (${totalItems}/${claimsHistory?.allTimeCountClaims})`
                  : ` (${totalItems})`}
              </h3>

              {claimsHistory ? (
                <div
                  className="w-auto flex mr-2 mt-2 opacity-50 hover:opacity-100 cursor-pointer gap-1 ml-2"
                  onClick={() => {
                    setExportWarning(''); // Clear any previous warnings
                    setShowExportModal(true);
                  }}
                >
                  <Image
                    src={downloadIcon}
                    width={16}
                    height={16}
                    alt="Download icon"
                    className="relative bottom-1 w-4 h-4"
                    style={{ width: 'auto/2', height: 'auto/2' }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <p className="text-xs text-txtfade">Subject to 30s delay</p>
        </div>

        {/* TOTALs */}
        <div className="flex flex-col items-start text-xs text-txtfade bg-secondary rounded-md border border-bcolor pt-1 pb-1 pl-2 pr-2">
          <div className="flex flex-row items-center">
            <p className="text-txtfade">All time claimed amounts:</p>
          </div>
          <div className="flex flex-row space-x-4 text-xs">
            <div className="flex items-center">
              <FormatNumber
                nb={allTimeClaimedUsdc}
                precisionIfPriceDecimalsBelow={
                  isMediumUsdcAllTimeClaimAmount ? 0 : 2
                }
                minimumFractionDigits={isMediumUsdcAllTimeClaimAmount ? 0 : 2}
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
                minimumFractionDigits={isMediumAdxAllTimeClaimAmount ? 0 : 2}
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

      <div
        className="w-full flex items-center justify-center h-6 border-t border-b border-bcolor hover:opacity-100 opacity-80 cursor-pointer mt-2"
        onClick={() => {
          setIsClaimHistoryVisible(!isClaimHistoryVisible);
        }}
      >
        <Image
          className={twMerge(
            `h-6 w-6`,
            isClaimHistoryVisible
              ? 'transform rotate-180 transition-all duration-1000 ease-in-out'
              : '',
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
