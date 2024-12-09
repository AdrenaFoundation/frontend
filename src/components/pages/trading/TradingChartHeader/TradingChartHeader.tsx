import Head from 'next/head';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import FormatNumber from '@/components/Number/FormatNumber';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import TradingChartHeaderStats from './TradingChartHeaderStats';

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
          'flex flex-col sm:flex-row items-center justify-between sm:gap-3 z-30 bg-main/90 backdrop-blur-md p-1 rounded-lg',
          className,
        )}
      >
        <div className="flex items-center w-full sm:w-[200px]">
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
        <TradingChartHeaderStats selected={selected} />
      </div>
    </>
  );
}
