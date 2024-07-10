import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { CustodyExtended, PoolExtended } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

import NumberInfo from '../NumberInfo';
import Table from '../Table';

export default function TradingView({
  mainPool,
  custodies,
}: {
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-6 w-full">
        <StyledContainer
          headerClassName="text-center justify-center"
          title="POSITIONS NOW"
        >
          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Position count</h2>
              <div className="font-boldy text-sm ml-2 text-txtfade">
                Long / Short
              </div>
            </div>

            <StyledSubSubContainer className="mt-2 flex-col">
              <h2>
                {formatNumber(mainPool.nbOpenLongPositions, 2)} /{' '}
                {formatNumber(mainPool.nbOpenShortPositions, 2)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>

          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Open Interest</h2>
              <div className="font-boldy text-sm ml-2 text-txtfade">
                Long / Short
              </div>
            </div>

            <StyledSubSubContainer className="mt-2 flex-col">
              <h2>
                {formatPriceInfo(mainPool.longPositions)} /{' '}
                {formatPriceInfo(mainPool.shortPositions)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>
        </StyledContainer>

        <StyledContainer
          headerClassName="text-center justify-center"
          title="ALL TIME POSITIONS"
        >
          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Open Interest</h2>
              <div className="font-boldy text-sm ml-2 text-txtfade">
                Long / Short
              </div>
            </div>

            <StyledSubSubContainer className="mt-2">
              <h2>
                {formatPriceInfo(mainPool.oiLongUsd)} /{' '}
                {formatPriceInfo(mainPool.oiShortUsd)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>

          <StyledSubContainer>
            <div className="flex items-center">
              <h2>Profits and Losses</h2>
            </div>

            <StyledSubSubContainer className="mt-2">
              <h2>
                {formatPriceInfo(mainPool.profitsUsd)} /{' '}
                {formatPriceInfo(mainPool.lossUsd * -1)}
              </h2>
            </StyledSubSubContainer>
          </StyledSubContainer>
        </StyledContainer>
      </div>

      <StyledContainer
        title="POSITIONS NOW BREAKDOWN"
        className="min-w-[22em] w-[22em] grow"
      >
        <div className="flex flex-row flex-wrap justify-evenly grow h-full w-full gap-4">
          {...custodies
            .filter((c) => !c.isStable)
            .map((custody) => {
              return (
                <StyledSubSubContainer
                  key={custody.pubkey.toBase58()}
                  className="flex flex-col w-full sm:w-[30%] h-40 items-center justify-center p-0 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-4 opacity-10 font-boldy">
                    {custody.tokenInfo.symbol}
                  </div>

                  <Image
                    src={custody.tokenInfo.image}
                    className="absolute left-[-100px] -z-10 grayscale opacity-5"
                    alt="token icon"
                    width="200"
                    height="200"
                  />

                  <div className="flex w-full flex-col items-center gap-y-4">
                    <div className="flex">
                      <div className="flex items-center text-base uppercase font-boldy mr-6">
                        Long
                      </div>

                      <div className="flex flex-col">
                        <NumberInfo
                          value={nativeToUi(
                            custody.nativeObject.longPositions.lockedAmount,
                            custody.decimals,
                          )}
                          denomination={custody.tokenInfo.symbol}
                          precision={custody.tokenInfo.symbol === 'BTC' ? 2 : 0}
                          wholePartClassName="text-base"
                          denominationClassName="text-xs"
                        />

                        <NumberInfo
                          value={nativeToUi(
                            custody.nativeObject.longPositions.sizeUsd,
                            USD_DECIMALS,
                          )}
                          precision={0}
                          wholePartClassName="text-txtfade"
                        />
                      </div>
                    </div>

                    <div className="flex">
                      <div className="flex items-center text-base uppercase font-boldy mr-6">
                        Short
                      </div>

                      <div className="flex flex-col">
                        <NumberInfo
                          value={nativeToUi(
                            // Works because we have only one stable
                            custody.nativeObject.shortPositions
                              .stableLockedAmount[0].lockedAmount,
                            USD_DECIMALS,
                          )}
                          precision={0}
                          wholePartClassName="text-base"
                        />
                      </div>
                    </div>
                  </div>
                </StyledSubSubContainer>
              );
            })}
        </div>
      </StyledContainer>

      <StyledContainer title="POSITIONS NOW BREAKDOWN" className="w-full grow">
        <Table
          rowTitleWidth="20%"
          columnsTitles={['Long', 'Short']}
          data={[
            ...custodies
              .filter((custody) => !custody.isStable)
              .map((custody) => ({
                rowTitle: (
                  <div className="flex items-center">
                    <Image
                      src={custody.tokenInfo.image}
                      alt="token icon"
                      width="16"
                      height="16"
                    />
                    <span className="ml-1 text-base">
                      {custody.tokenInfo.name}
                    </span>
                  </div>
                ),
                values: [
                  <div key="long" className="flex flex-col">
                    <NumberInfo
                      value={nativeToUi(
                        custody.nativeObject.tradeStats.oiLongUsd,
                        custody.decimals,
                      )}
                      denomination={custody.tokenInfo.symbol}
                      precision={custody.decimals}
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
                      denomination={custody.tokenInfo.symbol}
                      precision={custody.decimals}
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
      </StyledContainer>
    </>
  );
}
