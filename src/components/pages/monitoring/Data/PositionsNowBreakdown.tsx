import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { USD_DECIMALS } from '@/constant';
import { CustodyExtended } from '@/types';
import { nativeToUi } from '@/utils';

import NumberInfo from '../NumberInfo';

export default function PositionsNowBreakdown({
  custodies,
  titleClassName,
  mainWholeNumberClassName,
  dollarWholeNumberClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
  mainWholeNumberClassName?: string;
  dollarWholeNumberClassName?: string;
}) {
  return (
    <StyledContainer
      title="LIVE POSITIONS COUNT OI BREAKDOWN (PER TOKEN AND SIDE)"
      className="w-auto grow"
      titleClassName={titleClassName}
    >
      <div className="flex flex-row flex-wrap justify-evenly grow h-full w-full gap-4">
        {...custodies
          .filter((c) => !c.isStable)
          .map((custody) => {
            return (
              <StyledSubSubContainer
                key={custody.pubkey.toBase58()}
                className="flex flex-col w-[20em] min-w-[20em] h-[15em] grow items-center justify-center relative overflow-hidden"
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

                <div className="flex w-full flex-col items-center h-full justify-evenly">
                  <div className="flex items-center">
                    <div className={twMerge('mr-4', titleClassName)}>Long</div>

                    <div className="flex flex-col">
                      <NumberInfo
                        value={nativeToUi(
                          custody.nativeObject.longPositions.lockedAmount,
                          custody.decimals,
                        )}
                        denomination={custody.tokenInfo.symbol}
                        className="items-center"
                        precision={custody.tokenInfo.symbol === 'BTC' ? 2 : 0}
                        wholePartClassName={mainWholeNumberClassName}
                        denominationClassName="text-base ml-2"
                      />

                      <NumberInfo
                        value={nativeToUi(
                          custody.nativeObject.longPositions.sizeUsd,
                          USD_DECIMALS,
                        )}
                        precision={0}
                        wholePartClassName={twMerge(
                          'text-txtfade',
                          dollarWholeNumberClassName,
                        )}
                        denominationClassName={dollarWholeNumberClassName}
                      />
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-[#ffffff20]" />

                  <div className="flex items-center">
                    <div className={twMerge('mr-4', titleClassName)}>Short</div>

                    <div className="flex flex-col">
                      <NumberInfo
                        value={nativeToUi(
                          // Works because we have only one stable
                          custody.nativeObject.shortPositions
                            .stableLockedAmount[0].lockedAmount,
                          USD_DECIMALS,
                        )}
                        precision={0}
                        wholePartClassName={mainWholeNumberClassName}
                        denominationClassName={mainWholeNumberClassName}
                      />
                    </div>
                  </div>
                </div>
              </StyledSubSubContainer>
            );
          })}
      </div>
    </StyledContainer>
  );
}
