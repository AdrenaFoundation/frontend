import 'react-datepicker/dist/react-datepicker.css';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Pagination from '@/components/common/Pagination/Pagination';
import Select from '@/components/common/Select/Select';
import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import DataApiClient from '@/DataApiClient';
import usePositionsHistory from '@/hooks/usePositionHistory';
import { EnrichedPositionApi } from '@/types';

import downloadIcon from '../../../../../public/images/download.png';
import PositionHistoryBlock from './PositionHistoryBlock';

interface ExportOptions {
  type: 'all' | 'year' | 'dateRange';
  year?: number;
  entryDate?: string;
  exitDate?: string;
}

function PositionsHistory({
  connected,
  walletAddress,
  showShareButton = true,
  exportButtonPosition = 'top',
  className,
}: {
  connected: boolean;
  className?: string;
  walletAddress: string | null;
  showShareButton?: boolean;
  exportButtonPosition?: 'top' | 'bottom';
}) {
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('itemsPerPage') || '5', 10);
  });

  const [initialLoad, setInitialLoad] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'year',
    year: new Date().getFullYear()
  });
  const [exportWarning, setExportWarning] = useState<string>('');

  const {
    isLoadingPositionsHistory,
    positionsData,
    currentPage,
    totalItems,
    totalPages,
    loadPageData,
    getPaginatedData,
  } = usePositionsHistory({
    walletAddress,
    batchSize: 20,
    itemsPerPage,
  });

  const paginatedPositions = getPaginatedData(currentPage);

  // Check for duplicate positions
  React.useEffect(() => {
    if (paginatedPositions.length) {
      const positionIds = new Set<string>();
      const duplicates: string[] = [];

      paginatedPositions.forEach(p => {
        const id = String(p.positionId);
        if (positionIds.has(id)) {
          duplicates.push(id);
        }
        positionIds.add(id);
      });

      if (duplicates.length > 0) {
        console.error(`Found duplicate position IDs in current page: ${duplicates.join(', ')}`);
      }
    }
  }, [paginatedPositions]);

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    loadPageData(page);
  };

  // Load initial data when clicking on the history tab, but do not do at first render
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    if (connected && walletAddress) {
      loadPageData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    localStorage.setItem('itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  const downloadPositionHistory = useCallback(async (options: ExportOptions): Promise<boolean> => {
    if (!walletAddress || isDownloading) {
      return false;
    }

    setIsDownloading(true);
    setExportWarning(''); // Clear any previous warnings

    try {
      // Server uses large default page size (500,000), so most if not all users get everything in one request
      const exportParams: Parameters<typeof DataApiClient.exportPositions>[0] = {
        userWallet: walletAddress,
      };

      if (options.type === 'year' && options.year) {
        exportParams.year = options.year;
      } else if (options.type === 'dateRange') {
        if (options.entryDate) {
          exportParams.entryDate = new Date(options.entryDate);
        }
        if (options.exitDate) {
          const exitDate = new Date(options.exitDate);
          exitDate.setUTCHours(23, 59, 59, 999);
          exportParams.exitDate = exitDate;
        }
      }

      const firstPageResult = await DataApiClient.exportPositions(exportParams);

      if (!firstPageResult) {
        setExportWarning('Failed to export positions. Please try again.');
        return false;
      }

      const { csvData, metadata } = firstPageResult;

      if (!csvData || csvData.trim().length === 0 || metadata.totalPositions === 0) {
        setExportWarning(`No positions available for ${options.type === 'year' ? `year ${options.year}` : `date range ${options.entryDate} to ${options.exitDate}`}`);
        return false;
      }

      let allCsvData = csvData;

      // Handle rare case where data spans multiple pages (very large datasets +500k position events)
      if (metadata.totalPages > 1) {
        for (let page = 2; page <= metadata.totalPages; page++) {
          const pageResult = await DataApiClient.exportPositions({
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
      let filename = `positions-${walletAddress.slice(0, 8)}`;
      if (options.type === 'year' && options.year) {
        filename += `-${options.year}`;
      } else if (options.type === 'dateRange') {
        if (options.entryDate) filename += `-from-${options.entryDate}`;
        if (options.exitDate) filename += `-to-${options.exitDate}`;
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
      console.error('Error downloading position history:', error);
      setExportWarning('Failed to export positions. Please try again.');
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [walletAddress, isDownloading]);

  const getNoDataMessage = () => {
    if (!connected) return "Connect your wallet to view your trade history.";
    if (!positionsData) return "No trade history available.";
    if (totalItems === 0) return "No trade history available.";
    if (currentPage > totalPages) return "This page doesn't exist.";
    if (isLoadingPositionsHistory) return "Loading...";
    return "No data available for this page.";
  };

  const handleExportSubmit = async () => {
    const success = await downloadPositionHistory(exportOptions);
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

  const hasDateFields = Boolean(exportOptions.entryDate || exportOptions.exitDate);

  const isExportValid = () => {
    if (!hasDateFields) {
      return true;
    } else {
      return Boolean(exportOptions.entryDate && exportOptions.exitDate);
    }
  };

  const exportButton = (
    <div
      className={twMerge(
        "flex gap-1 items-center cursor-pointer transition-opacity",
        showExportModal ? "opacity-100" : "opacity-50 hover:opacity-100"
      )}
      onClick={() => {
        setExportWarning(''); // Clear any previous warnings
        setShowExportModal(!showExportModal);
      }}
    >
      <div className='text-sm tracking-wider'>
        Export
      </div>
      <Image
        src={downloadIcon}
        width={14}
        height={12}
        alt="Download icon"
      />
    </div>
  );

  return (
    <div className={twMerge("w-full h-full flex flex-col relative", className)}>
      {showExportModal ? (
        <Modal
          title="Export Position History"
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
                        entryDate: '',
                        exitDate: ''
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
                      selected={exportOptions.entryDate ? new Date(exportOptions.entryDate) : null}
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          entryDate: date ? date.toISOString().split('T')[0] : ''
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select start date"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date('2024-09-25')}
                      maxDate={exportOptions.exitDate ? new Date(exportOptions.exitDate) : new Date()}
                      popperClassName="z-[200]"
                      popperPlacement="bottom-start"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs text-white/60">To:</label>
                  <div className="h-10 bg-[#0A1117] border border-gray-800/50 rounded overflow-hidden">
                    <DatePicker
                      selected={exportOptions.exitDate ? new Date(exportOptions.exitDate) : null}
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          exitDate: date ? date.toISOString().split('T')[0] : ''
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select end date"
                      dateFormat="yyyy-MM-dd"
                      minDate={exportOptions.entryDate ? new Date(exportOptions.entryDate) : new Date('2024-09-25')}
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
      ) : null}

      <div
        className="flex flex-col justify-center"
        style={{
          minHeight: `${itemsPerPage * 49}px`,
        }}
      >
        {connected ? (
          <>
            {isLoadingPositionsHistory && paginatedPositions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader className='ml-auto mr-auto' />
              </div>
            ) : (
              <>
                {paginatedPositions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center">
                      {exportButtonPosition === "top" && exportButton}
                    </div>
                    {paginatedPositions.map((positionHistory: EnrichedPositionApi) => (
                      <PositionHistoryBlock
                        key={positionHistory.positionId}
                        positionHistory={positionHistory}
                        showShareButton={showShareButton}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex overflow-hidden bg-main/90 grow border rounded-lg h-[15em] items-center justify-center">
                    <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                      {getNoDataMessage()}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <WalletConnection />
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="w-6" /> {/* Spacer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoadingPositionsHistory}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />

        {totalItems > 5 && (
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              setItemsPerPage(newItemsPerPage);
              // Reset to first page when changing items per page
              if (currentPage > Math.ceil(totalItems / newItemsPerPage)) {
                handlePageChange(1);
              }
            }}
            className="w-6 h-6 bg-gray-800 text-white border border-gray-700 rounded text-[10px] appearance-none cursor-pointer text-center"
          >
            {[5, 10, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// Memoize this component to avoid unnecessary re-renders caused by
// a re-render of the parent component.
// This is not the most expensive component to re-render, but it's sensible
// because we're avoiding unnecessary work within a critical path of the app,
// which is subject to a lot of re-renders by nature: a trading view must be reactive.
// More optimizations are possible within this component, but this is the best low-hanging fruit
// yielding the most benefits for minimal effort.
// Note this is a good candidate for memoization because:
// - the parent component re-renders often (trading view)
// - this component expects simple "scalar" / "primitive-type" / "referentially-stable" props:
//   - connected: boolean
//   - className?: string
// - https://react.dev/reference/react/memo
export default React.memo(PositionsHistory);
