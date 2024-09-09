import { useEffect, useState } from 'react';
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
  const [previousTokenPrice, setPreviousTokenPrice] = useState<number>(0);
  const [tokenColor, setTokenColor] = useState<string>('text-white');

  useEffect(() => {
    // if streamingTokenPrices is larger than previous value, set color to green
    // if streamingTokenPrices is smaller than previous value, set color to red
    if (!streamingTokenPrices) return;

    const price =
      streamingTokenPrices[
        selected.symbol !== 'JITOSOL' ? selected.symbol : 'SOL'
      ];

    if (typeof price === 'undefined' || price === null) {
      return;
    }

    if (price > previousTokenPrice) {
      setTokenColor('text-green');
    } else if (price < previousTokenPrice) {
      setTokenColor('text-red');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingTokenPrices]);

  useEffect(() => {
    setPreviousTokenPrice(
      streamingTokenPrices[
        selected.symbol !== 'JITOSOL' ? selected.symbol : 'SOL'
      ] || 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingTokenPrices]);

  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row items-center justify-between sm:gap-3 z-30 bg-main border-b',
        className,
      )}
    >
      <div className="flex items-center w-full sm:w-[200px] border-b border-r-none sm:border-b-0 sm:border-r">
        <Select
          className="w-full"
          selectedClassName="py-3 px-2 sm:px-3"
          selected={`${
            selected.symbol !== 'JITOSOL' ? selected.symbol : 'SOL'
          } / USD`}
          options={tokenList
            .filter((token) => token.symbol !== selected.symbol)
            .map((token) => {
              return {
                title: `${
                  token.symbol !== 'JITOSOL' ? token.symbol : 'SOL'
                } / USD`,
              };
            })}
          onSelect={(opt: string) => {
            const selectedTokenSymbol = getTokenSymbolFromChartFormat(opt);
            // Force linting, you cannot not find the token in the list
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const token = tokenList.find(
              (t) =>
                t.symbol === selectedTokenSymbol ||
                (t.symbol === 'JITOSOL' && selectedTokenSymbol === 'SOL'),
            )!;

            if (!token) return;

            onChange(token);
          }}
        />
      </div>

      <div className="flex w-full p-3 sm:p-0 flex-row gap-3 justify-between sm:justify-end sm:gap-12 items-center sm:pr-5">
        <FormatNumber
          nb={
            streamingTokenPrices[
              selected.symbol !== 'JITOSOL' ? selected.symbol : 'SOL'
            ]
          }
          format="currency"
          minimumFractionDigits={2}
          className={twMerge('text-lg font-bold', tokenColor)}
        />

        <div className="flex flex-row gap-3 sm:gap-6">
          <div className="flex flex-col p-1 rounded-full flex-wrap">
            <span className="text-xs sm:text-sm text-txtfade text-right">
              24h Change
            </span>

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
          </div>

          <div className="flex flex-col p-1 rounded-full flex-wrap">
            <span className="text-xs sm:text-sm text-txtfade text-right">
              24h Volume
            </span>

            <FormatNumber
              nb={stats?.[selected.symbol].dailyVolume}
              format="currency"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
