import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import downloadIcon from '@/../public/images/download.png';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

export const TokenCell = ({
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

export const CurrencyCell = ({
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

export const PnlCell = ({
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

export const SideCell = ({ side }: { side: string }) => (
  <div
    className={twMerge(
      'font-mono text-[0.7rem]',
      side.toLowerCase() === 'long' ? 'text-[#35C488]' : 'text-redbright',
    )}
  >
    {side}
  </div>
);

export const LeverageCell = ({ leverage }: { leverage: number }) => (
  <FormatNumber
    nb={leverage}
    suffix="x"
    precision={0}
    isDecimalDimmed={false}
  />
);

export const DateCell = ({ date }: { date: Date }) => {
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

export const MutagenCell = ({ value }: { value: number }) => (
  <FormatNumber
    nb={value}
    isDecimalDimmed={false}
    className="text-mutagen"
    precision={3}
    isAbbreviate
  />
);

export const BottomBar = ({
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
