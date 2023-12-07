import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function TradingInputs({
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
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const stats = useDailyStats();

  const infoStyle =
    'flex flex-col sm:flex-row gap-1 xl:gap-2 bg-white/5 p-1 px-5 rounded-full';

  return (
    <div
      className={twMerge(
        'flex items-center gap-3 h-14 bg-black/50 backdrop-blur-md border border-gray-300 border-b-transparent rounded-t-lg',
        className,
      )}
    >
      <div className="flex items-center sm:border-r sm:border-r-gray-300 h-full p-3">
        <Select
          selected={`${selected.symbol} / USD`}
          options={tokenList
            .filter((token) => token.symbol !== selected.symbol)
            .map((token) => `${token.symbol} / USD`)}
          onSelect={(opt: string) => {
            const selectedTokenSymbol = opt.slice(
              0,
              opt.length - ' / USD'.length,
            );
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

      <div className="hidden sm:flex flex-row gap-3 p-3 items-center">
        <div className="font-mono mr-3">
          {tokenPrices && tokenPrices[selected.symbol]
            ? // Force linting, we check it just bellow
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              formatPriceInfo(tokenPrices[selected.symbol]!)
            : null}
        </div>

        <div className={infoStyle}>
          <span
            className={twMerge(
              'font-mono text-xs',
              stats && stats[selected.symbol].dailyChange > 0
                ? 'text-green-500'
                : 'text-red-500',
            )}
          >
            {stats
              ? `${formatNumber(stats[selected.symbol].dailyChange, 2)}%`
              : '-'}
          </span>
          <span className="text-xs text-txtfade">24h Change</span>
        </div>

        <div className={infoStyle}>
          <span className="font-mono text-xs">
            {formatPriceInfo(stats?.[selected.symbol].dailyVolume ?? null)}
          </span>
          <span className="text-xs text-txtfade">24h Volume</span>
        </div>
      </div>
    </div>
  );
}
