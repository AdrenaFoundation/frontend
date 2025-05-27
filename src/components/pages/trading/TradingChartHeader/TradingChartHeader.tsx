import Switch from '@mui/material/Switch';
import Tippy from '@tippyjs/react';
import Head from 'next/head';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import liveIcon from '@/../public/images/Icons/live-icon.svg';
import Select from '@/components/common/Select/Select';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import { ChartPreferences } from '../TradingChart/types';
import TradingChartHeaderStats from './TradingChartHeaderStats';

export function getTokenSymbolFromChartFormat(tokenSymbol: string) {
  return tokenSymbol.slice(0, tokenSymbol.length - ' / USD'.length);
}

export default function TradingChartHeader({
  allActivePositions,
  className,
  tokenList,
  selected,
  onChange,
  chartPreferences,
  setChartPreferences,
}: {
  allActivePositions: PositionExtended[] | null;
  className?: string;
  tokenList: Token[];
  selected: Token;
  onChange: (t: Token) => void;
  chartPreferences: ChartPreferences;
  setChartPreferences: (prefs: ChartPreferences) => void;
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
          'flex flex-col sm:flex-row items-center justify-between sm:gap-3 z-30 bg-main border-b p-1',
          className,
        )}
      >
        <div className="flex items-center min-w-fit border-b sm:border-b-0 sm:border-r border-bcolor">
          <Select
            className="w-full"
            selectedClassName="py-1 px-2"
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

        {allActivePositions ? (
          <div className="flex flex-row gap-3 items-center border rounded-lg flex-none px-2 xl:px-3 py-1 mb-3 sm:mb-0">
            <div className='flex flex-row sm:flex-col xl:flex-row gap-2 items-center'>
              <div className="flex flex-row gap-1 items-center">
                <Image
                  src={liveIcon}
                  alt="live icon"
                  width={10}
                  height={10}
                  className=""
                />
                <FormatNumber
                  nb={allActivePositions.filter((p) => p.side === 'long').length}
                  prefix="long: "
                  prefixClassName="opacity-50"
                  className="text-xxs md:text-xs whitespace-nowrap"
                />
              </div>

              <div className="flex flex-row gap-1 items-center">
                <Image
                  src={liveIcon}
                  alt="live icon"
                  width={10}
                  height={10}
                  className=""
                />
                <FormatNumber
                  nb={allActivePositions.filter((p) => p.side === 'short').length}
                  prefix="short: "
                  prefixClassName="opacity-50"
                  className="text-xxs md:text-xs whitespace-nowrap"
                />
              </div>
            </div>

            {/*
            <div className='flex flex-row sm:flex-col xl:flex-row xl:gap-2 items-center'>
               <div className="flex items-center text-white">
                <Tippy
                  content={
                    <div>
                      <p className='text-sm mb-1 font-boldy opacity-50'>
                        Show position history for all active positions.
                      </p>
                      <ul>
                        <li className='text-xxs md:text-xs font-mono'>L / S = Long / Short</li>
                        <li className='flex flex-row gap-1 text-xxs md:text-xs items-center font-mono'>
                          <div className='w-2 h-2 rounded-full bg-green flex-none' /> / <div className='w-2 h-2 rounded-full bg-red flex-none' /> = PnL
                        </li>
                        <li className='flex flex-row gap-1 text-xxs md:text-xs items-center font-mono'>
                          <div className='w-2 h-2 rounded-full bg-blue flex-none' /> = your position
                        </li>
                        <li className='text-xxs md:text-xs font-mono'>size of mark = size of position</li>
                      </ul>
                    </div>
                  }>
                  <p className="opacity-50 text-xxs underline-dashed cursor-help">
                    Show pos.
                  </p>
                </Tippy>
                <Switch
                  checked={chartPreferences.showAllActivePositions}
                  onChange={() => {
                    setChartPreferences({
                      ...chartPreferences,
                      showAllActivePositions: !chartPreferences.showAllActivePositions,
                      showPositionHistory: false, // Disable position history when toggling active positions
                    });
                  }}
                  size="small"
                  sx={{
                    transform: 'scale(0.7)',
                    '& .MuiSwitch-switchBase': {
                      color: '#ccc',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#555',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#10e1a3',
                    },
                  }}
                />
               </div>
             </div> */}

            <div className="flex items-center text-white">
              <Tippy
                content={
                  <div>
                    <p className='text-sm mb-1 font-boldy opacity-50'>
                      Show liquidation lines for all active positions.
                    </p>
                    <ul>
                      <li className='text-xxs md:text-xs font-mono'>line thickness = size of position</li>

                    </ul>
                  </div>
                }>
                <p className="opacity-50 text-xxs underline-dashed cursor-help">
                  Show Liqs.
                </p>
              </Tippy>
              <Switch
                checked={chartPreferences.showAllActivePositionsLiquidationLines}
                onChange={() => {
                  setChartPreferences({
                    ...chartPreferences,
                    showAllActivePositionsLiquidationLines: !chartPreferences.showAllActivePositionsLiquidationLines,
                  });
                }}
                size="small"
                sx={{
                  transform: 'scale(0.7)',
                  '& .MuiSwitch-switchBase': {
                    color: '#ccc',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#1a1a1a',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: '#555',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#10e1a3',
                  },
                }}
              />
            </div>
          </div>
        ) : null}

        <TradingChartHeaderStats selected={selected} />
        {/* <div className="flex w-full p-1 sm:p-0 flex-row gap-2 justify-between sm:justify-end sm:gap-6 items-center sm:pr-5">
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
        </div> */}
      </div >
    </>
  );
}
