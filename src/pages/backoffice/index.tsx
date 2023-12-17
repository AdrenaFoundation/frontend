import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Bloc from '@/components/pages/backoffice/Bloc/Bloc';
import BucketBarChart from '@/components/pages/backoffice/BucketBarChart/BucketBarChart';
import ComingSoonInfo from '@/components/pages/backoffice/Table/formatting/ComingSoonInfo';
import NumberInfo from '@/components/pages/backoffice/Table/formatting/NumberInfo';
import Table from '@/components/pages/backoffice/Table/Table';
import { USD_DECIMALS } from '@/constant';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import { nativeToUi } from '@/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const CANNOT_CALCULATE = -1;

function capitalizeFirstLetter(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Utility function to be able to generate short column name automatically
// from attribute name
//
// i.e
// swapUsd -> swap
// addLiquidityUsd -> add liq.
function abbreviateWords(input: string) {
  // Words to abreviate
  const mapping = {
    Usd: '',
    Liquidity: 'Liq.',
    Position: 'Pos.',
    Contributor: '',
  };

  return (
    input
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters to separate words
      .trim() // Remove any leading/trailing whitespace
      .split(' ') // Split the string into an array of words
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((word: string) => (mapping as any)[word] ?? word) // Map each word to its abbreviation if it exists
      .map(capitalizeFirstLetter)
      .join(' ') // Join the words back into a string
      .trim()
  ); // Ensure no leading/trailing whitespace
}

const TitleAnnotation = ({ text }: { text: string }) => (
  <span className="text-[0.8em] text-txtfade ml-1">{text}</span>
);

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

  console.log('Cortex', cortex);

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
        <Bloc title="Global Overview" className="min-w-[20em] m-2 grow">
          <Table
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
                    Total Vested
                    <TitleAnnotation text="Unrealized" />
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
        </Bloc>

        <Bloc title="Assets Under Management" className="min-w-[20em] m-2 grow">
          <Table
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
        </Bloc>

        <Bloc title="Vesting" className="min-w-[25em] max-w-[35em] m-2 grow">
          <Table
            rowTitleWidth="15em"
            data={[
              {
                rowTitle: (
                  <div>
                    Total Vested
                    <TitleAnnotation text="Unrealized" />
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
        </Bloc>

        <Bloc title="Buckets" className="min-w-[25em] max-w-[50em] m-2 grow">
          <div className="flex flex-wrap grow items-center justify-evenly">
            {['coreContributor', 'daoTreasury', 'pol', 'ecosystem'].map(
              (bucketName) => (
                <div className="flex flex-col p-6" key={bucketName}>
                  <div>{abbreviateWords(bucketName)} Bucket</div>

                  <BucketBarChart
                    allocated={nativeToUi(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (cortex as any)[`${bucketName}BucketAllocation`],
                      window.adrena.client.adxToken.decimals,
                    )}
                    vested={nativeToUi(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (cortex as any)[`${bucketName}BucketVestedAmount`],
                      window.adrena.client.adxToken.decimals,
                    )}
                    minted={nativeToUi(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (cortex as any)[`${bucketName}BucketMintedAmount`],
                      window.adrena.client.adxToken.decimals,
                    )}
                  />
                </div>
              ),
            )}
          </div>
        </Bloc>

        <Bloc title="Positions" className="min-w-[28em] m-2 grow">
          <Table
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
                values: [
                  <ComingSoonInfo key="0" />,
                  <ComingSoonInfo key="1" />,
                ],
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
        </Bloc>

        {(() => {
          const attributes = Object.keys(
            custodies[0].nativeObject.collectedFees,
          );

          return (
            <Bloc
              title="Fee Custody Breakdown"
              className="min-w-[45em] m-2 grow"
            >
              <Table
                rowTitleWidth="90px"
                columnsTitles={attributes.map(abbreviateWords)}
                data={[
                  ...custodies.map((custody) => ({
                    rowTitle: custody.tokenInfo.name,
                    values: attributes.map((attribute) => (
                      <NumberInfo
                        key={attribute}
                        value={nativeToUi(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (custody.nativeObject.collectedFees as any)[
                            attribute
                          ],
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
                              (custody.nativeObject.collectedFees as any)[
                                param
                              ],
                              USD_DECIMALS,
                            ),
                          0,
                        )}
                      />
                    )),
                  },
                ]}
              />
            </Bloc>
          );
        })()}

        {(() => {
          const attributes = Object.keys(custodies[0].nativeObject.volumeStats);

          return (
            <Bloc
              title="Volume Custody Breakdown"
              className="min-w-[45em] m-2 grow"
            >
              <Table
                rowTitleWidth="90px"
                columnsTitles={attributes.map(abbreviateWords)}
                data={[
                  ...custodies.map((custody) => ({
                    rowTitle: custody.tokenInfo.name,
                    values: attributes.map((attribute) => (
                      <NumberInfo
                        key={attribute}
                        value={nativeToUi(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            </Bloc>
          );
        })()}
      </div>
    </>
  );
}
