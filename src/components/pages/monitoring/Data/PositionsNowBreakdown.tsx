import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { USD_DECIMALS } from '@/constant';
import { CustodyExtended } from '@/types';
import { nativeToUi } from '@/utils';

import liveIcon from '../../../../../public/images/Icons/live-icon.svg';
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
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">

      <div className="flex flex-row gap-2 w-full border-b p-5">
        <p className={titleClassName}>LIVE POSITIONS COUNT OI BREAKDOWN (PER TOKEN AND SIDE)</p>
        <Image
          src={liveIcon}
          alt="Live icon"
          width={12}
          height={12}
          className='animate-pulse'
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-5 p-5 lg:p-0">
        {...custodies
          .filter((c) => !c.isStable)
          .map((custody, i) => {
            return (
              <div key={custody.pubkey.toBase58()} className={twMerge('flex-1 border rounded-xl lg:rounded-none lg:border-0 p-3 lg:p-5',
                i !== 0 ? 'lg:border-l' : '',
                i !== 2 ? 'lg:pr-0' : ''
              )}>
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src={custody.tokenInfo.image}
                    alt="token icon"
                    width="24"
                    height="24"
                  />

                  <p className={twMerge(titleClassName, 'opacity-100')}>{custody.tokenInfo.symbol}</p>
                </div>

                <div className="flex flex-col">
                  <div className="mt-3">
                    <div className={twMerge(titleClassName, 'mr-4 text-green opacity-75')}>Long</div>

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

                  <div className="w-full h-[1px] bg-bcolor my-3" />

                  <div>
                    <div className={twMerge(titleClassName, 'mr-4 text-red opacity-75')}>Short</div>

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
              </div>
            );
          })}
      </div>
    </div>
  );
}
