import Head from 'next/head';
import { useState } from 'react';
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
  const selectedTokenPrice = useSelector(
    (s) => s.streamingTokenPrices[getTokenSymbol(selected.symbol)] ?? null,
  );
  const stats = useDailyStats();
  const [previousTokenPrice, setPreviousTokenPrice] = useState<number | null>(
    null,
  );
  const [tokenColor, setTokenColor] = useState<
    'text-white' | 'text-green' | 'text-red'
  >('text-white');

  if (selectedTokenPrice !== null) {
    if (previousTokenPrice !== null) {
      // if streamingTokenPrices is higher than previous value, set color to green
      // if streamingTokenPrices is smaller than previous value, set color to red
      const newTokenColor =
        selectedTokenPrice > previousTokenPrice
          ? 'text-green'
          : selectedTokenPrice < previousTokenPrice
          ? 'text-red'
          : tokenColor;
      // make sure we're only updating the local state if the new color is different.
      if (newTokenColor !== tokenColor) {
        setTokenColor(newTokenColor);
      }
    }

    if (selectedTokenPrice !== previousTokenPrice) {
      setPreviousTokenPrice(selectedTokenPrice);
    }
  }

  const dailyChange = stats?.[selected.symbol]?.dailyChange ?? null;
  const dailyVolume = stats?.[selected.symbol]?.dailyVolume ?? null;
  const lastDayHigh = stats?.[selected.symbol]?.lastDayHigh ?? null;
  const lastDayLow = stats?.[selected.symbol]?.lastDayLow ?? null;

  return (
    <>
      <Head>
        <title>
          {selectedTokenPrice?.toFixed(selected.symbol === 'BONK' ? 8 : 2) ??
            '-'}{' '}
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
            options={tokenList.map((token) => {
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
            nb={selectedTokenPrice}
            format="currency"
            minimumFractionDigits={2}
            precision={selected.displayPriceDecimalsPrecision}
            className={twMerge('text-lg font-bold', tokenColor)}
          />
          <div className="flex flex-row gap-0 sm:gap-1">
            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="flex font-mono sm:text-xxs text-txtfade text-right">
                24h:
              </span>
            </div>
            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                Ch.
              </span>
              <span
                className={twMerge(
                  'font-mono text-xs sm:text-xxs ml-1', // Adjusted to text-xs
                  dailyChange
                    ? dailyChange > 0
                      ? 'text-green'
                      : 'text-red'
                    : 'text-white',
                )}
              >
                {dailyChange
                  ? `${dailyChange.toFixed(2)}%` // Manually format to 2 decimal places
                  : '-'}
              </span>
            </div>

            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                Vol.
              </span>
              <span className="font-mono text-xs sm:text-xxs ml-1">
                <FormatNumber
                  nb={dailyVolume}
                  format="currency"
                  isAbbreviate={true}
                  isDecimalDimmed={false}
                  className="font-mono text-xxs" // Ensure smaller font
                />
              </span>
            </div>

            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                Hi
              </span>
              <span className="font-mono text-xs sm:text-xxs ml-1">
                <FormatNumber
                  nb={lastDayHigh} // Assuming high is available in stats
                  format="currency"
                  className="font-mono text-xxs"
                />
              </span>
            </div>

            <div className="flex items-center p-1 rounded-full flex-wrap">
              <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                Lo
              </span>
              <span className="font-mono text-xxs sm:text-xs ml-1">
                <FormatNumber
                  nb={lastDayLow} // Assuming low is available in stats
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
