import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import downloadIcon from '@/../public/images/download.png';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import usePositionsHistory from '@/hooks/usePositionHistory';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import TableV2 from '../TableV2';

export default function PositionHistoryTable({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const { positionsData } = usePositionsHistory({
    walletAddress,
    batchSize: 100,
    itemsPerPage: 100,
  });

  const showPnlWithFees = useSelector((state) => state.settings.showFeesInPnl);

  const [activeCol, setActiveCol] = useState<string | null>(null);
  const [isNative, setIsNative] = useState<boolean>(false);

  const [isPnlWithFees, setIsPnlWithFees] = useState<boolean>(showPnlWithFees);

  const headers = [
    { title: 'Token', key: 'token', width: 70 },
    { title: 'Side', key: 'side', width: 60 },
    { title: 'Lev.', key: 'leverage', width: 55 },
    { title: 'PnL', key: 'pnl', isNoPadding: true, align: 'right' as const },
    { title: 'Volume', key: 'volume', align: 'right' as const },
    {
      title: 'Collateral',
      key: 'collateral',
      align: 'right' as const,
    },
    { title: 'Fees Paid', key: 'fees', align: 'right' as const },
    { title: 'Entry', key: 'entry', align: 'right' as const },
    { title: 'Exit', key: 'exit', align: 'right' as const },
    { title: 'Mutagen', key: 'mutagen', align: 'right' as const },
    { title: 'Date', key: 'date', align: 'right' as const },
  ];

  if (positionsData === null) {
    return <div className="p-3">No position history available</div>;
  }

  const {
    maxPnl,
    minPnl,
    maxVolume,
    minVolume,
    maxCollateral,
    minCollateral,
    maxFees,
    minFees,
  } = positionsData.positions.reduce(
    (acc, p) => {
      acc.maxPnl = Math.max(acc.maxPnl, p.pnl);
      acc.maxVolume = Math.max(acc.maxVolume, p.volume);
      acc.maxCollateral = Math.max(acc.maxCollateral, p.entryCollateralAmount);
      acc.maxFees = Math.max(acc.maxFees, p.fees);
      acc.minPnl = Math.min(acc.minPnl, p.pnl);
      acc.minVolume = Math.min(acc.minVolume, p.volume);
      acc.minCollateral = Math.min(acc.minCollateral, p.entryCollateralAmount);
      acc.minFees = Math.min(acc.minFees, p.fees);
      return acc;
    },
    {
      maxPnl: 0,
      maxVolume: 0,
      maxCollateral: 0,
      maxFees: 0,
      minPnl: 0,
      minVolume: 0,
      minCollateral: 0,
      minFees: 0,
      avgPnl: 0,
      avgVolume: 0,
      avgCollateral: 0,
      avgFees: 0,
    },
  );

  const avgPnl =
    positionsData.positions.reduce((acc, p) => acc + p.pnl, 0) /
    positionsData.positions.length;
  const avgVolume =
    positionsData.positions.reduce((acc, p) => acc + p.volume, 0) /
    positionsData.positions.length;
  const avgCollateral =
    positionsData.positions.reduce(
      (acc, p) => acc + p.entryCollateralAmount,
      0,
    ) / positionsData.positions.length;

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
    volume: (
      <CurrencyCell
        value={p.volume}
        isActiveCol={activeCol === 'volume'}
        maxValue={maxVolume}
        minValue={minVolume}
      />
    ),
    collateral: (
      <CurrencyCell
        value={
          isNative ? p.entryCollateralAmountNative : p.entryCollateralAmount
        }
        isActiveCol={activeCol === 'collateral'}
        maxValue={maxCollateral}
        minValue={minCollateral}
        isCurrency={!isNative}
      />
    ),
    fees: (
      <CurrencyCell
        value={p.fees}
        isActiveCol={activeCol === 'fees'}
        maxValue={maxFees}
        minValue={minFees}
      />
    ),
    entry: <CurrencyCell value={p.entryPrice} />,
    exit: <CurrencyCell value={p.exitPrice} />,
    mutagen: <MutagenCell value={p.pointsMutations} />,
    date: <DateCell date={p.entryDate} />,
  }));

  return (
    <div className="border-t p-3">
      <TableV2
        headers={headers}
        data={formattedData}
        setActiveCol={setActiveCol}
        bottomBar={
          <BottomBar
            isNative={isNative}
            isPnlWithFees={isPnlWithFees}
            setIsNative={setIsNative}
            setIsPnlWithFees={setIsPnlWithFees}
            stats={[
              {
                title: 'avg PnL',
                value: avgPnl,
              },
              {
                title: 'avg Volume',
                value: avgVolume,
              },
              {
                title: 'avg Collateral',
                value: avgCollateral,
              },
            ]}
          />
        }
      />
    </div>
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
  maxValue,
  minValue,
  isActiveCol = false,
  isCurrency = true,
}: {
  value: number;
  maxValue?: number;
  minValue?: number;
  isActiveCol?: boolean;
  isCurrency?: boolean;
}) => {
  const abs = Math.abs(value);

  const scaleMax =
    Math.max(Math.abs(maxValue ?? 0), Math.abs(minValue ?? 0)) || 1;
  const heightPct = normalize(abs, 10, 100, 0, scaleMax);

  return (
    <div>
      <FormatNumber
        nb={value}
        format={isCurrency ? 'currency' : undefined}
        prefix={value > 10_000 && isCurrency ? '$' : undefined}
        isDecimalDimmed={false}
        isAbbreviate={value > 10_000}
        className="relative z-20"
      />
      <AnimatePresence>
        {isActiveCol ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${heightPct}%`, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={twMerge(
              'absolute bottom-0 left-0 w-full pointer-events-none z-0 bg-inputcolor/40',
            )}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const PnlCell = ({
  pnl,
  maxPnl,
  minPnl,
}: {
  pnl: number;
  maxPnl: number;
  minPnl: number;
}) => {
  const positive = pnl >= 0;
  const sign = positive ? '+' : '-';
  const abs = Math.abs(pnl);

  const scaleMax = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) || 1;
  const heightPct = normalize(abs, 10, 100, 0, scaleMax);

  return (
    <div className="px-2">
      <FormatNumber
        nb={abs}
        prefix={sign}
        precision={2}
        format="currency"
        isDecimalDimmed={false}
        className={twMerge(
          'relative z-10 text-sm',
          positive ? 'text-green' : 'text-redbright',
        )}
        prefixClassName={twMerge(
          'text-sm',
          positive ? 'text-green' : 'text-redbright',
        )}
      />

      <div
        className={twMerge(
          'absolute bottom-0 left-0 w-full pointer-events-none z-0',
          positive ? 'bg-green/10' : 'bg-red/10',
        )}
        style={{ height: `${heightPct}%` }}
      />
    </div>
  );
};

const SideCell = ({ side }: { side: string }) => (
  <div
    className={twMerge(
      'font-mono',
      side.toLowerCase() === 'long' ? 'text-green' : 'text-redbright',
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
  const d = date;
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  const label = `${day}. ${month} ${year}`;
  return <div className="font-mono text-xxs">{label}</div>;
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
  stats,
}: {
  isNative: boolean;
  isPnlWithFees: boolean;
  setIsNative: (value: boolean) => void;
  setIsPnlWithFees: (value: boolean) => void;
  stats: {
    title: string;
    value: number;
  }[];
}) => (
  <div className="flex flex-row justify-between">
    <div className="flex flex-row items-center">
      <div className="relative p-1 px-3 border-r border-r-inputcolor">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[1rem] w-[0.0625rem] bg-orange" />
        <p className="text-sm ml-3 font-mono opacity-50">Liquidated</p>
      </div>

      <div className="flex flex-row items-center gap-5 p-1.5 px-3 border-r border-r-inputcolor">
        {stats.map((stat) => (
          <div key={stat.title} className="flex flex-row gap-2 items-center">
            <p className="text-xs font-mono opacity-50">{stat.title}</p>
            <FormatNumber
              nb={stat.value}
              format="currency"
              isDecimalDimmed={false}
              className="text-xs font-interSemibold"
            />
          </div>
        ))}
      </div>
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
