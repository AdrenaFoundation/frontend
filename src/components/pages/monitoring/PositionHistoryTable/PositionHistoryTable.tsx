import 'react-datepicker/dist/react-datepicker.css';

import { AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import DataApiClient from '@/DataApiClient';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionSortOption } from '@/hooks/usePositionHistory';
import { useSelector } from '@/store/store';
import { EnrichedPositionApi, EnrichedPositionApiV2 } from '@/types';

import PositionHistoryBlockV2 from '../../trading/Positions/PositionHistoryBlockV2';
import Table, { TableHeaderType } from '../Table';
import {
  BottomBar,
  CurrencyCell,
  DateCell,
  LeverageCell,
  MutagenCell,
  PnlCell,
  SideCell,
  TokenCell,
} from './PositionTableComp/PositionCells';

interface ExportOptions {
  type: 'all' | 'year' | 'dateRange';
  year?: number;
  entryDate?: string;
  exitDate?: string;
}

export default function PositionHistoryTable({
  positionsData,
  isLoadingPositionsHistory,
  handleSort,
  sortBy,
  sortDirection,
  currentPage,
  totalPages,
  loadPageData,
  walletAddress,
  breakpoint = '1280px',
}: {
  positionsData: EnrichedPositionApiV2 | null;
  isLoadingPositionsHistory: boolean;
  handleSort: (sort: PositionSortOption) => void;
  sortBy: PositionSortOption;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  loadPageData: (page: number) => Promise<void>;
  walletAddress: string | null;
  breakpoint?: string;
}) {
  const isMobile = useBetterMediaQuery(`(max-width: ${breakpoint})`);

  const [activePosition, setActivePosition] =
    useState<EnrichedPositionApi | null>(null);

  const showPnlWithFees = useSelector((state) => state.settings.showFeesInPnl);

  const [isNative, setIsNative] = useState<boolean>(false);
  const [isPnlWithFees, setIsPnlWithFees] = useState<boolean>(showPnlWithFees);

  // Export modal state
  const [isDownloading, setIsDownloading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'year',
    year: new Date().getFullYear(),
  });
  const [exportWarning, setExportWarning] = useState<string>('');

  const downloadPositionHistory = useCallback(
    async (options: ExportOptions): Promise<boolean> => {
      if (!walletAddress || isDownloading) {
        return false;
      }

      setIsDownloading(true);
      setExportWarning(''); // Clear any previous warnings

      try {
        // Server uses large default page size (500,000), so most if not all users get everything in one request
        const exportParams: Parameters<
          typeof DataApiClient.exportPositions
        >[0] = {
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

        const firstPageResult =
          await DataApiClient.exportPositions(exportParams);

        if (!firstPageResult) {
          setExportWarning('Failed to export positions. Please try again.');
          return false;
        }

        const { csvData, metadata } = firstPageResult;

        if (
          !csvData ||
          csvData.trim().length === 0 ||
          metadata.totalPositions === 0
        ) {
          setExportWarning(
            `No positions available for ${options.type === 'year' ? `year ${options.year}` : `date range ${options.entryDate} to ${options.exitDate}`}`,
          );
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
              await new Promise((resolve) => setTimeout(resolve, 100));
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
    },
    [walletAddress, isDownloading],
  );

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

  const hasDateFields = Boolean(
    exportOptions.entryDate || exportOptions.exitDate,
  );

  const isExportValid = () => {
    if (!hasDateFields) {
      return true;
    } else {
      return Boolean(exportOptions.entryDate && exportOptions.exitDate);
    }
  };

  const headers: TableHeaderType[] = [
    { title: 'Token', key: 'token', width: 4.375, sticky: 'left' },
    { title: 'Side', key: 'side', width: 3.75, sticky: 'left' },
    { title: 'Lev.', key: 'leverage', width: 3.4375 },
    { title: 'PnL', key: 'pnl', align: 'right', isSortable: true },
    {
      title: 'Volume',
      key: 'volume',
      align: 'right',
      isSortable: true,
    },
    {
      title: 'Collateral',
      key: 'collateral_amount',
      isSortable: true,
      align: 'right',
    },
    {
      title: 'Fees Paid',
      key: 'fees',
      align: 'right',
      isSortable: true,
    },
    { title: 'Entry', key: 'entry', align: 'right' },
    { title: 'Exit', key: 'exit', align: 'right' },
    {
      title: 'Mutagen',
      key: 'mutagen',
      align: 'right',
    },
    {
      title: 'Date',
      key: 'entry_date',
      isSortable: true,
      align: 'right',
    },
  ];

  if (positionsData === null) {
    return null;
  }

  const { maxPnl, minPnl } = positionsData.positions.reduce(
    (acc, p) => {
      acc.maxPnl = Math.max(acc.maxPnl, p.pnl);
      acc.minPnl = Math.min(acc.minPnl, p.pnl);
      return acc;
    },
    {
      maxPnl: 0,
      minPnl: 0,
    },
  );

  const formattedData = positionsData.positions.map((p) => ({
    token: (
      <TokenCell token={p.token} isLiquidated={p.status === 'liquidate'} />
    ),
    side: <SideCell side={p.side} />,
    leverage: <LeverageCell leverage={p.entryLeverage} />,
    pnl: (
      <PnlCell
        pnl={isPnlWithFees ? p.pnl : p.pnl - p.fees}
        maxPnl={maxPnl}
        minPnl={minPnl}
      />
    ),
    volume: <CurrencyCell value={p.volume} />,
    collateral_amount: (
      <CurrencyCell
        value={
          isNative ? p.entryCollateralAmountNative : p.entryCollateralAmount
        }
        isCurrency={!isNative}
      />
    ),
    fees: <CurrencyCell value={p.fees} />,
    entry: <CurrencyCell value={p.entryPrice} />,
    exit: <CurrencyCell value={p.exitPrice} />,
    mutagen: <MutagenCell value={p.totalPoints} />,
    entry_date: <DateCell date={p.entryDate} />,
    id: p.positionId,
  }));

  return (
    <>
      {showExportModal ? (
        <Modal
          title="Export Position History"
          close={() => {
            setExportWarning(''); // Clear warning when closing modal
            setShowExportModal(false);
          }}
        >
          <div className="flex flex-col gap-6 p-6 min-w-[25rem] sm:min-w-[31.25rem]">
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
                        entryDate: '',
                        exitDate: '',
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
                        exportOptions.entryDate
                          ? new Date(exportOptions.entryDate)
                          : null
                      }
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          entryDate: date
                            ? date.toISOString().split('T')[0]
                            : '',
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select start date"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date('2024-09-25')}
                      maxDate={
                        exportOptions.exitDate
                          ? new Date(exportOptions.exitDate)
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
                        exportOptions.exitDate
                          ? new Date(exportOptions.exitDate)
                          : null
                      }
                      onChange={(date) => {
                        setExportWarning(''); // Clear warning when changing options
                        setExportOptions({
                          ...exportOptions,
                          type: 'dateRange',
                          exitDate: date
                            ? date.toISOString().split('T')[0]
                            : '',
                        });
                      }}
                      className="w-full h-full px-3 bg-transparent border-0 text-sm text-white focus:outline-none"
                      placeholderText="Select end date"
                      dateFormat="yyyy-MM-dd"
                      minDate={
                        exportOptions.entryDate
                          ? new Date(exportOptions.entryDate)
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
              <div className='text-xs text-orange font-semibold'>
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

      <div className="border-t p-3">
        <Table
          title="Position History"
          headers={headers}
          data={formattedData}
          sortBy={sortBy}
          sortDirection={sortDirection}
          handleSort={handleSort as (column: string) => void}
          loadPageData={loadPageData}
          currentPage={currentPage}
          totalPages={totalPages}
          height="20rem"
          isSticky={!!isMobile}
          onRowClick={(id) => {
            const position =
              positionsData.positions.find((p) => p.positionId === id) ?? null;
            setActivePosition(position);
          }}
          bottomBar={
            <BottomBar
              isNative={isNative}
              isPnlWithFees={isPnlWithFees}
              setIsNative={setIsNative}
              setIsPnlWithFees={setIsPnlWithFees}
              onDownloadClick={() => {
                setExportWarning(''); // Clear any previous warnings
                setShowExportModal(true);
              }}
            />
          }
          isLoading={isLoadingPositionsHistory}
        />
      </div>
      <AnimatePresence>
        {activePosition ? (
          <Modal
            close={() => setActivePosition(null)}
            className="p-5 w-full"
            wrapperClassName="w-full md:max-w-[75rem] md:mt-0"
          >
            <PositionHistoryBlockV2
              positionHistory={activePosition}
              showShareButton={true}
              showExpanded={true}
              showChart={true}
            />
          </Modal>
        ) : null}
      </AnimatePresence>
    </>
  );
}
