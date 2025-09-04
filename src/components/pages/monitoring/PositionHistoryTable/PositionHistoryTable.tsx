import 'react-datepicker/dist/react-datepicker.css';

import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import { twMerge } from 'tailwind-merge';

import downloadIcon from '@/../public/images/download.png';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import DataApiClient from '@/DataApiClient';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionSortOption } from '@/hooks/usePositionHistory';
import { useSelector } from '@/store/store';
import { EnrichedPositionApi, EnrichedPositionApiV2, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import PositionHistoryBlock from '../../trading/Positions/PositionHistoryBlock';
import TableV2, { TableV2HeaderType, TableV2RowType } from '../TableV2';

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
}) {
  const isMobile = useBetterMediaQuery('(max-width: 1280px)');

  const [activePosition, setActivePosition] =
    useState<EnrichedPositionApi | null>(null);

  const showPnlWithFees = useSelector((state) => state.settings.showFeesInPnl);

  const [isNative, setIsNative] = useState<boolean>(false);
  const [isPnlWithFees, setIsPnlWithFees] = useState<boolean>(showPnlWithFees);
  const [viewMode, setViewMode] = useState<'table' | 'block'>('table');

  // Export modal state
  const [isDownloading, setIsDownloading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'year',
    year: new Date().getFullYear()
  });
  const [exportWarning, setExportWarning] = useState<string>('');

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

  const headers: TableV2HeaderType[] = [
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
        isIndicator={viewMode === 'table'}
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

  const PositionBlockComponent = (item: TableV2RowType, index: number) => {
    const position = positionsData.positions[index];

    return (
      <div
        key={`position-block-${index}`}
        className="bg-main border border-inputcolor rounded-lg hover:bg-third transition-colors cursor-pointer relative"
        onClick={() => {
          setActivePosition(position);
        }}
      >
        {item.status === 'liquidate' && (
          <div className="absolute left-0 top-0 h-full w-[0.0625rem] bg-orange" />
        )}

        <div className="flex justify-between items-center mb-3 border-b border-inputcolor p-2 px-4">
          <div className="flex items-center gap-2">
            {item.token}
            <div
              className={twMerge(
                'text-xs p-0.5 px-2 rounded-lg',
                position.side === 'long' ? 'bg-green/10' : 'bg-red/10',
              )}
            >
              {item.side}
            </div>
          </div>
          <div className="text-right">
            <p className="text-right text-xs opacity-50 font-interMedium">
              PnL
            </p>
            {item.pnl}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm pb-2 px-4">
          {headers.map((header) => {
            const value = item[header.key];
            if (['token', 'pnl', 'side'].includes(header.key)) return null;
            return (
              <div key={header.title}>
                <div className="opacity-50 text-xs font-interMedium">
                  {header.title}
                </div>
                <div className="text-sm">{value}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

      <div className="border-t p-3">
        <TableV2
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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          blockViewComponent={PositionBlockComponent}
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
            wrapperClassName="w-full max-w-[75rem]"
          >
            <PositionHistoryBlock
              positionHistory={activePosition}
              showShareButton={true}
              showExpanded={true}
            />
          </Modal>
        ) : null}
      </AnimatePresence>
    </>
  );
}

const TokenCell = ({
  token,
  isLiquidated,
}: {
  token: Token;
  isLiquidated: boolean;
}) => {
  const img = getTokenImage(token);
  const symbol = getTokenSymbol(token.symbol);

  return (
    <div className="flex flex-row items-center gap-1.5">
      <Image
        src={img}
        alt={token.symbol}
        width={16}
        height={16}
        className="w-3 h-3"
      />
      <p className="text-sm font-interSemibold opacity-90">{symbol}</p>
      {isLiquidated ? (
        <div className="absolute left-0 top-0 h-full w-[0.0625rem] bg-orange" />
      ) : null}
    </div>
  );
};

const CurrencyCell = ({
  value,
  isCurrency = true,
}: {
  value: number;
  isCurrency?: boolean;
}) => {
  return (
    <div>
      <FormatNumber
        nb={value}
        format={isCurrency ? 'currency' : undefined}
        prefix={value > 10_000 && isCurrency ? '$' : undefined}
        isDecimalDimmed={false}
        isAbbreviate={value > 10_000}
        className="relative"
      />
    </div>
  );
};

const PnlCell = ({
  pnl,
  maxPnl,
  minPnl,
  isIndicator,
}: {
  pnl: number;
  maxPnl: number;
  minPnl: number;
  isIndicator: boolean;
}) => {
  const positive = pnl >= 0;
  const sign = positive ? '+' : '-';
  const abs = Math.abs(pnl);

  const scaleMax = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) || 1;
  const heightPct = normalize(abs, 10, 100, 0, scaleMax);

  return (
    <div className={twMerge(!isIndicator ? 'p-0' : 'px-2')}>
      <FormatNumber
        nb={abs}
        prefix={sign}
        precision={2}
        format="currency"
        isDecimalDimmed={false}
        className={twMerge(
          'relative z-10 text-sm',
          positive ? 'text-[#35C488]' : 'text-redbright',
        )}
        prefixClassName={twMerge(
          'text-sm',
          positive ? 'text-[#35C488]' : 'text-redbright',
        )}
      />

      {isIndicator ? (
        <div
          className={twMerge(
            'absolute bottom-0 left-0 w-full pointer-events-none z-0',
            positive ? 'bg-green/10' : 'bg-red/10',
          )}
          style={{ height: `${heightPct}%` }}
        />
      ) : null}
    </div>
  );
};

const SideCell = ({ side }: { side: string }) => (
  <div
    className={twMerge(
      'font-mono text-[0.7rem]',
      side.toLowerCase() === 'long' ? 'text-[#35C488]' : 'text-redbright',
    )}
  >
    {side}
  </div>
);

const LeverageCell = ({ leverage }: { leverage: number }) => (
  <FormatNumber
    nb={leverage}
    suffix="x"
    precision={0}
    isDecimalDimmed={false}
  />
);

const DateCell = ({ date }: { date: Date }) => {
  return (
    <div className="font-mono text-sm">
      {new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </div>
  );
};

const MutagenCell = ({ value }: { value: number }) => (
  <FormatNumber
    nb={value}
    isDecimalDimmed={false}
    className="text-mutagen"
    precision={3}
    isAbbreviate
  />
);

const BottomBar = ({
  isNative,
  isPnlWithFees,
  setIsNative,
  setIsPnlWithFees,
  onDownloadClick,
}: {
  isNative: boolean;
  isPnlWithFees: boolean;
  setIsNative: (value: boolean) => void;
  setIsPnlWithFees: (value: boolean) => void;
  onDownloadClick: () => void;
}) => (
  <div className="flex flex-row justify-end sm:justify-between">
    <div className="hidden sm:block relative p-1 px-3 border-r border-r-inputcolor">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[1rem] w-[0.0625rem] bg-orange" />
      <p className="text-sm ml-3 font-mono opacity-50">Liquidated</p>
    </div>

    <div className="flex flex-row items-center">
      <div
        className="flex flex-row items-center gap-3 p-1 px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
        onClick={() => setIsPnlWithFees(!isPnlWithFees)}
      >
        <Switch
          checked={isPnlWithFees}
          size="small"
          onChange={() => {
            // handle toggle in parent div
          }}
        />
        <p className="text-sm font-interMedium opacity-50">PnL w/o fees</p>
      </div>

      <div
        className="flex flex-row items-center gap-3 p-1 px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
        onClick={() => setIsNative(!isNative)}
      >
        <Switch
          checked={isNative}
          size="small"
          onChange={() => {
            // handle toggle in parent div
          }}
        />
        <p className="text-sm font-interMedium opacity-50">Native</p>
      </div>

      <div
        className="flex flex-row items-center gap-3 p-1.5 px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
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
);
