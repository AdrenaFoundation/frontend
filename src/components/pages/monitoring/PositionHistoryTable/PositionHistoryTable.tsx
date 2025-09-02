import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import downloadIcon from '@/../public/images/download.png';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import { PositionSortOption } from '@/hooks/usePositionHistory';
import { useSelector } from '@/store/store';
import { EnrichedPositionApi, EnrichedPositionApiV2, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import PositionHistoryBlock from '../../trading/Positions/PositionHistoryBlock';
import TableV2, { TableV2HeaderType, TableV2RowType } from '../TableV2';

export default function PositionHistoryTable({
  positionsData,
  isLoadingPositionsHistory,
  handleSort,
  sortBy,
  sortDirection,
  currentPage,
  totalPages,
  loadPageData,
}: {
  positionsData: EnrichedPositionApiV2 | null;
  isLoadingPositionsHistory: boolean;
  handleSort: (sort: PositionSortOption) => void;
  sortBy: PositionSortOption;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  loadPageData: (page: number) => Promise<void>;
}) {
  const [activePosition, setActivePosition] =
    useState<EnrichedPositionApi | null>(null);

  const showPnlWithFees = useSelector((state) => state.settings.showFeesInPnl);

  const [isNative, setIsNative] = useState<boolean>(false);
  const [isPnlWithFees, setIsPnlWithFees] = useState<boolean>(showPnlWithFees);
  const [viewMode, setViewMode] = useState<'table' | 'block'>('table');

  const headers: TableV2HeaderType[] = [
    { title: 'Token', key: 'token', width: 70, sticky: 'left' },
    { title: 'Side', key: 'side', width: 60, sticky: 'left' },
    { title: 'Lev.', key: 'leverage', width: 55 },
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
    mutagen: <MutagenCell value={p.pointsMutations} />,
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
          isSticky={window.innerWidth < 1280} // use useBetterMediaQuery
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
      'font-mono',
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
}: {
  isNative: boolean;
  isPnlWithFees: boolean;
  setIsNative: (value: boolean) => void;
  setIsPnlWithFees: (value: boolean) => void;
}) => (
  <div className="flex flex-row justify-between">
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
