import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { USD_DECIMALS } from '@/constant';
import { CustodyExtended, PoolExtended } from '@/types';
import { formatPriceInfo, nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import NumberInfo from '../NumberInfo';
import Table from '../Table';

export default function FeesView({
  mainPool,
  custodies,
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
}: {
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
  alpStakingCurrentRoundRewards: number | null;
  adxStakingCurrentRoundRewards: number | null;
}) {
  const attributes = Object.keys(custodies[0].nativeObject.collectedFees);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <StyledContainer
          headerClassName="text-center justify-center"
          title="ALL TIME FEES"
        >
          <StyledSubSubContainer className="mt-2 justify-center">
            <h2>{formatPriceInfo(mainPool.totalFeeCollected)}</h2>
          </StyledSubSubContainer>
        </StyledContainer>

        <StyledContainer
          headerClassName="text-center justify-center"
          title="CURRENT STAKING ROUND FEES"
          subTitle="Accumulating fees to be redistributed to stakers at the end of the current staking round."
        >
          <StyledSubSubContainer className="mt-2 justify-center">
            <h2>
              {alpStakingCurrentRoundRewards !== null &&
              adxStakingCurrentRoundRewards !== null
                ? formatPriceInfo(
                    alpStakingCurrentRoundRewards +
                      adxStakingCurrentRoundRewards,
                  )
                : '-'}
            </h2>
          </StyledSubSubContainer>
        </StyledContainer>
      </div>

      <StyledContainer
        title="All time Fees Breakdown Per Token"
        headerClassName="text-center justify-center"
        className="min-w-[22em] w-[22em] grow"
      >
        <div className="flex flex-row flex-wrap justify-evenly grow h-full w-full gap-4">
          {...custodies.map((custody) => {
            return (
              <StyledSubSubContainer
                key={custody.pubkey.toBase58()}
                className="flex flex-col w-full sm:w-[40%] h-[11em] items-center justify-center p-0 relative overflow-hidden"
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

                <div className="flex w-full">
                  <div className="flex flex-col w-[55%] items-end">
                    {attributes.map((attribute) => (
                      <div key={attribute} className="flex">
                        <NumberInfo
                          value={nativeToUi(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (custody.nativeObject.collectedFees as any)[
                              attribute
                            ],
                            USD_DECIMALS,
                          )}
                          precision={0}
                          className="mr-2"
                          wholePartClassName="text-base"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col w-[45%] shrink-0">
                    {attributes.map((_, i) => (
                      <span className="text-txtfade w-[10em] text-base" key={i}>
                        {
                          [
                            'Swap',
                            'Add Liq.',
                            'Remove Liq.',
                            'Open Pos.',
                            'Close Pos.',
                            'Liquidation',
                            'Borrow',
                          ][i]
                        }
                      </span>
                    ))}
                  </div>
                </div>
              </StyledSubSubContainer>
            );
          })}
        </div>
      </StyledContainer>
    </>
  );
}
