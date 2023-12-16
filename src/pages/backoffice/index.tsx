import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import { ChartData } from 'chart.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import BlocInfo from '@/components/common/BlocInfo/BlocInfo';
import ComingSoonInfo from '@/components/common/BlocInfo/formatting/ComingSoonInfo';
import NumberInfo from '@/components/common/BlocInfo/formatting/NumberInfo';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import {
  formatNumber,
  formatPercentage,
  formatPriceInfo,
  nativeToUi,
} from '@/utils';

const CANNOT_CALCULATE = -1;

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Backoffice({ mainPool, custodies }: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);

  if (!mainPool || !custodies || !tokenPrices) return <></>;

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

      <div className="flex flex-wrap z-10">
        <BlocInfo
          title="Assets Under Management"
          className="w-[28em] m-2"
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
          className="w-[28em] m-2"
          columnsTitles={[
            <div className="font-specialmonster" key="long">
              Long
            </div>,
            <div className="font-specialmonster" key="short">
              Short
            </div>,
          ]}
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
                rowTitle: `${custody.tokenInfo.name} Open Interest`,
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

        <BlocInfo
          title="Fees"
          className="w-[28em] m-2"
          data={[
            {
              rowTitle: 'Total Collected',
              value: <NumberInfo value={mainPool.totalFeeCollected} />,
            },
          ]}
        />
      </div>
    </>
  );
}
