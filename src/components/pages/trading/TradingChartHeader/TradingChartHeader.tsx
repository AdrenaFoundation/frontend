import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import FormatNumber from '@/components/Number/FormatNumber';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber } from '@/utils';

export function getTokenSymbolFromChartFormat(tokenSymbol: string) {
  return tokenSymbol.slice(0, tokenSymbol.length - ' / USD'.length);
}

export default function TradingChartHeader({
  className,
  tokenList,
  selected,
  onChange,
}: {
  className?: string;
  tokenList: Token[];
  selected: Token;
  onChange: (t: Token) => void;
}) {
  const streamingTokenPrices = useSelector((s) => s.streamingTokenPrices);
  const stats = useDailyStats();

  return (
    <div
      className={twMerge(
        'flex items-center justify-between sm:justify-start gap-3 h-14 z-30 bg-main',
        className,
      )}
    >
      <div className="flex items-center h-full">
        <Select
          className="w-[8em]"
          selectedClassName="p-2"
          selected={`${selected.symbol} / USD`}
          options={tokenList
            .filter((token) => token.symbol !== selected.symbol)
            .map((token) => {
              return { title: `${token.symbol} / USD` };
            })}
          onSelect={(opt: string) => {
            const selectedTokenSymbol = getTokenSymbolFromChartFormat(opt);
            // Force linting, you cannot not find the token in the list
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const token = tokenList.find(
              (t) => t.symbol === selectedTokenSymbol,
            )!;

            if (!token) return;

            onChange(token);
          }}
        />
      </div>

      <div className="flex flex-row gap-3 p-3 items-center">
        <FormatNumber
          nb={streamingTokenPrices?.[selected.symbol]}
          format="currency"
          className="mr-3 text-base w-[8em]"
        />
        <div className="hidden sm:flex flex-col sm:flex-row bg-white/5 p-1 px-5 rounded-full flex-wrap justify-center">
          <span
            className={twMerge(
              'font-mono text-sm',
              stats && stats[selected.symbol].dailyChange > 0
                ? 'text-green'
                : 'text-red',
            )}
          >
            {stats
              ? `${formatNumber(stats[selected.symbol].dailyChange, 2)}%`
              : '-'}
          </span>
          <span className="text-sm text-txtfade ml-2 relative top-[0.1em]">
            24h Change
          </span>
        </div>

        <div className="hidden sm:flex flex-col sm:flex-row bg-white/5 p-1 px-5 rounded-full flex-wrap justify-center">
          <span className="font-mono text-sm">
            <FormatNumber
              nb={stats?.[selected.symbol].dailyVolume}
              format="currency"
            />
          </span>
          <span className="text-sm text-txtfade ml-2 relative top-[0.1em]">
            24h Volume
          </span>
        </div>
      </div>
    </div>
  );
}
