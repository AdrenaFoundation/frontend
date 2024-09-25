import Head from 'next/head';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import FormatNumber from '@/components/Number/FormatNumber';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

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

    const price = streamingTokenPrices[getTokenSymbol(selected.symbol)];

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
      streamingTokenPrices[getTokenSymbol(selected.symbol)] || 0,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingTokenPrices]);

  return (
    <>
      <Head>
        <title>
          {streamingTokenPrices[getTokenSymbol(selected.symbol)]?.toFixed(2) ||
            0}{' '}
          – {getTokenSymbol(selected.symbol)} / USD
        </title>
      </Head>
      <div
        className={twMerge(
          'flex flex-col sm:flex-row items-center justify-between sm:gap-3 z-30 bg-main border-b p-1',
          className,
        )}
      >
        <div className="flex items-center w-full sm:w-[200px] border-b border-r-none sm:border-b-0 sm:border-r">
          <Select
            className="w-full"
            selectedClassName="py-1 px-2 sm:px-2"
            selected={`${getTokenSymbol(selected.symbol)} / USD`}
            options={tokenList
              .filter(
                (token) =>
                  getTokenSymbol(token.symbol) !==
                  getTokenSymbol(selected.symbol),
              )
              .map((token) => {
                return {
                  title: `${getTokenSymbol(token.symbol)} / USD`,
                  img: getTokenImage(token),
                };
              })}
            onSelect={(opt: string) => {
              const selectedTokenSymbol = getTokenSymbolFromChartFormat(opt);
              // Force linting, you cannot not find the token in the list
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const token = tokenList.find(
                (t) => getTokenSymbol(t.symbol) === selectedTokenSymbol,
              )!;

              if (!token) return;

              onChange(token);
            }}
            align="left"
          />
        </div>

        <div className="flex w-full p-1 sm:p-0 flex-row gap-2 justify-between sm:justify-end sm:gap-6 items-center sm:pr-5">
          <FormatNumber
            nb={streamingTokenPrices[getTokenSymbol(selected.symbol)]}
            format="currency"
            minimumFractionDigits={2}
            className={twMerge('text-lg font-bold', tokenColor)}
          />
          <div className="flex flex-row gap-0 sm:gap-1">
            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xs text-txtfade text-right">
                24h Change
              </span>
              <span
                className={twMerge(
                  'font-mono text-xs sm:text-xs ml-1', // Adjusted to text-xs
                  stats && stats[selected.symbol].dailyChange > 0
                    ? 'text-green'
                    : 'text-red',
                )}
              >
                {stats
                  ? `${stats[selected.symbol].dailyChange.toFixed(2)}%` // Manually format to 2 decimal places
                  : '-'}
              </span>
            </div>

            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xs text-txtfade text-right">
                24h Volume
              </span>
              <span className="font-mono text-xs sm:text-xs ml-1">
                <FormatNumber
                  nb={stats?.[selected.symbol].dailyVolume}
                  format="currency"
                  isAbbreviate={true}
                  isDecimalDimmed={false}
                  className="font-mono text-xs" // Ensure smaller font
                />
              </span>
            </div>

            {/* New 24h High */}
            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xs text-txtfade text-right">
                24h High
              </span>
              <span className="font-mono text-xs sm:text-xs ml-1">
                <FormatNumber
                  nb={stats?.[selected.symbol].lastDayHigh} // Assuming high is available in stats
                  format="currency"
                  className="font-mono text-xxs"
                />
              </span>
            </div>

            {/* New 24h Low */}
            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xs text-txtfade text-right">
                24h Low
              </span>
              <span className="font-mono text-xs sm:text-xs ml-1">
                <FormatNumber
                  nb={stats?.[selected.symbol].lastDayLow} // Assuming low is available in stats
                  format="currency"
                  className="font-mono text-xxs"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
