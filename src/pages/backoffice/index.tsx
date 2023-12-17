import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import { ChartData } from 'chart.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import BlocInfo from '@/components/common/BlocInfo/BlocInfo';
import ComingSoonInfo from '@/components/common/BlocInfo/formatting/ComingSoonInfo';
import NumberInfo from '@/components/common/BlocInfo/formatting/NumberInfo';
import { USD_DECIMALS } from '@/constant';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import { useSelector } from '@/store/store';
import { CustodyExtended, PageProps } from '@/types';
import {
  formatNumber,
  formatPercentage,
  formatPriceInfo,
  nativeToUi,
} from '@/utils';

const CANNOT_CALCULATE = -1;

// Utility function
function abbreviateWords(input: string) {
  // Words to abreviate
  const mapping = {
    Usd: '',
    Liquidity: 'Liq.',
    Position: 'Pos.',
  } as const;

  return input
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters to separate words
    .trim() // Remove any leading/trailing whitespace
    .split(' ') // Split the string into an array of words
    .map((word: string) => (mapping as any)[word] ?? word) // Map each word to its abbreviation if it exists
    .join(' ') // Join the words back into a string
    .trim(); // Ensure no leading/trailing whitespace
}

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Backoffice({ mainPool, custodies }: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const cortex = useCortex();
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();

  if (
    !mainPool ||
    !custodies ||
    !tokenPrices ||
    !cortex ||
    !adxTotalSupply ||
    !alpTotalSupply
  )
    return <></>;

  // Value of all assets owned by the pool
  // Which doesn't take into account opened positions and stuff
  const totalPoolAssetHardValue = custodies.reduce((acc, custody) => {
    const price = tokenPrices[custody.tokenInfo.symbol];

    if (!price) return CANNOT_CALCULATE;
    return acc + custody.owned * price;
  }, 0);

  // full animation
  // https://lottie.host/37e1ec5d-b487-44e1-b4e9-ac7f51500eee/ydhCjShFMH.lottie
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <>
      <DotLottiePlayer
        src="https://lottie.host/f7973135-c929-4978-b0cb-df671f50d021/eGqcR9lFei.lottie"
        autoplay={!isSafari}
        loop={!isSafari}
        className={twMerge(
          isAnimationLoaded ? 'opacity-100' : 'opacity-0',
          'fixed lg:absolute top-[50px] md:top-[-50px] right-0 transition-opacity duration-300 w-[80%] z-0',
        )}
        onEvent={(event: PlayerEvents) => {
          if (event === PlayerEvents.Ready) {
            setIsAnimationLoaded(true);
          }
        }}
      />

      <div className="flex flex-wrap z-10 min-w-[780px] overflow-auto">
        <BlocInfo
          title="Global Overview"
          className="min-w-[20em] m-2 grow"
          rowTitleWidth="50%"
          data={[
            {
              rowTitle: 'Total Value',
              value: <NumberInfo value={mainPool.aumUsd} />,
            },

            ...(totalPoolAssetHardValue !== CANNOT_CALCULATE
              ? [
                  {
                    rowTitle: 'Raw Total Assets Value',
                    value: <NumberInfo value={totalPoolAssetHardValue} />,
                  },
                ]
              : []),

            {
              rowTitle: 'Total Volume',
              value: <NumberInfo value={mainPool.totalVolume} />,
            },

            {
              rowTitle: 'Total Fee Collected',
              value: <NumberInfo value={mainPool.totalFeeCollected} />,
            },

            {
              rowTitle: 'ADX total supply',
              value: (
                <NumberInfo
                  value={adxTotalSupply}
                  precision={window.adrena.client.adxToken.decimals}
                  denomination="ADX"
                />
              ),
            },

            {
              rowTitle: 'ALP total supply',
              value: (
                <NumberInfo
                  value={alpTotalSupply}
                  precision={window.adrena.client.alpToken.decimals}
                  denomination="ALP"
                />
              ),
            },

            {
              rowTitle: (
                <div>
                  Total Vested{' '}
                  <span className="italic text-xs text-txtfade">
                    (unrealized)
                  </span>
                </div>
              ),
              value: (
                <NumberInfo
                  value={nativeToUi(
                    cortex.vestedTokenAmount,
                    window.adrena.client.adxToken.decimals,
                  )}
                  precision={window.adrena.client.adxToken.decimals}
                  denomination="ADX"
                />
              ),
            },

            {
              rowTitle: 'Number of Vest',
              value: (
                <NumberInfo
                  value={cortex.vests.length}
                  precision={0}
                  denomination=""
                />
              ),
            },
          ]}
        />

        <BlocInfo
          title="Assets Under Management"
          className="min-w-[20em] m-2 grow"
          rowTitleWidth="50%"
          data={[
            {
              rowTitle: 'Total Value',
              value: <NumberInfo value={mainPool.aumUsd} />,
            },

            ...(totalPoolAssetHardValue !== CANNOT_CALCULATE
              ? [
                  {
                    rowTitle: 'Raw Total Assets Value',
                    value: <NumberInfo value={totalPoolAssetHardValue} />,
                  },
                ]
              : []),

            ...custodies.map((custody) => ({
              rowTitle: custody.tokenInfo.name,
              value: (
                <div className="flex flex-col">
                  <NumberInfo
                    value={custody.owned}
                    precision={custody.decimals}
                    denomination={custody.tokenInfo.symbol}
                  />
                  {tokenPrices[custody.tokenInfo.symbol] ? (
                    <NumberInfo
                      value={
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        custody.owned * tokenPrices[custody.tokenInfo.symbol]!
                      }
                    />
                  ) : null}
                </div>
              ),
            })),
          ]}
        />

        <BlocInfo
          title="Positions"
          className="min-w-[28em] m-2 grow"
          rowTitleWidth="35%"
          columnsTitles={['Long', 'Short']}
          data={[
            {
              rowTitle: 'Nb Open Positions',
              values: [
                mainPool.nbOpenLongPositions,
                mainPool.nbOpenShortPositions,
              ],
            },
            {
              rowTitle: 'Open Interest',
              values: [
                <NumberInfo key="long" value={mainPool.oiLongUsd} />,
                <NumberInfo key="short" value={mainPool.oiLongUsd} />,
              ],
            },
            {
              rowTitle: 'Average Leverage',
              values: [<ComingSoonInfo key="0" />, <ComingSoonInfo key="1" />],
            },

            ...custodies
              .filter((custody) => !custody.isStable)
              .map((custody) => ({
                rowTitle: `${custody.tokenInfo.symbol} Open Interest`,
                values: [
                  <div key="long" className="flex flex-col">
                    <NumberInfo
                      value={nativeToUi(
                        custody.nativeObject.tradeStats.oiLongUsd,
                        custody.decimals,
                      )}
                    />
                    {tokenPrices[custody.tokenInfo.symbol] ? (
                      <NumberInfo
                        value={
                          nativeToUi(
                            custody.nativeObject.tradeStats.oiLongUsd,
                            custody.decimals,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          ) * tokenPrices[custody.tokenInfo.symbol]!
                        }
                      />
                    ) : null}
                  </div>,

                  <div key="short" className="flex flex-col">
                    <NumberInfo
                      value={nativeToUi(
                        custody.nativeObject.tradeStats.oiShortUsd,
                        custody.decimals,
                      )}
                    />
                    {tokenPrices[custody.tokenInfo.symbol] ? (
                      <NumberInfo
                        value={
                          nativeToUi(
                            custody.nativeObject.tradeStats.oiShortUsd,
                            custody.decimals,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          ) * tokenPrices[custody.tokenInfo.symbol]!
                        }
                      />
                    ) : null}
                  </div>,
                ],
              })),
          ]}
        />

        {(() => {
          const attributes = Object.keys(
            custodies[0].nativeObject.collectedFees,
          );

          return (
            <BlocInfo
              title="Fee Custody Breakdown"
              rowTitleWidth="90px"
              className="min-w-[45em] m-2 grow"
              columnsTitles={attributes.map(abbreviateWords)}
              data={[
                ...custodies.map((custody) => ({
                  rowTitle: custody.tokenInfo.name,
                  values: attributes.map((attribute) => (
                    <NumberInfo
                      key={attribute}
                      value={nativeToUi(
                        (custody.nativeObject.collectedFees as any)[attribute],
                        USD_DECIMALS,
                      )}
                    />
                  )),
                })),

                {
                  rowTitle: <div className="font-semibold">Total</div>,
                  values: attributes.map((param, i) => (
                    <NumberInfo
                      key={i}
                      value={custodies.reduce(
                        (total, custody) =>
                          total +
                          nativeToUi(
                            // Force typing as we know the keys are matching the collectedFees field
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (custody.nativeObject.collectedFees as any)[param],
                            USD_DECIMALS,
                          ),
                        0,
                      )}
                    />
                  )),
                },
              ]}
            />
          );
        })()}

        {(() => {
          const attributes = Object.keys(custodies[0].nativeObject.volumeStats);

          return (
            <BlocInfo
              title="Volume Custody Breakdown"
              rowTitleWidth="90px"
              className="min-w-[45em] m-2 grow"
              columnsTitles={attributes.map(abbreviateWords)}
              data={[
                ...custodies.map((custody) => ({
                  rowTitle: custody.tokenInfo.name,
                  values: attributes.map((attribute) => (
                    <NumberInfo
                      key={attribute}
                      value={nativeToUi(
                        (custody.nativeObject.volumeStats as any)[attribute],
                        USD_DECIMALS,
                      )}
                    />
                  )),
                })),

                {
                  rowTitle: <div className="font-semibold">Total</div>,
                  values: attributes.map((param, i) => (
                    <NumberInfo
                      key={i}
                      value={custodies.reduce(
                        (total, custody) =>
                          total +
                          nativeToUi(
                            // Force typing as we know the keys are matching the collectedFees field
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (custody.nativeObject.volumeStats as any)[param],
                            USD_DECIMALS,
                          ),
                        0,
                      )}
                    />
                  )),
                },
              ]}
            />
          );
        })()}
      </div>
    </>
  );
}
