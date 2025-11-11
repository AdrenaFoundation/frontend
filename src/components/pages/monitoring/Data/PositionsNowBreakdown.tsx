import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { USD_DECIMALS } from '@/constant';
import { CustodyExtended } from '@/types';
import { nativeToUi } from '@/utils';

export default function PositionsNowBreakdown({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="flex flex-row items-center gap-2 w-full border-b p-3">
        <p className={titleClassName}>Live Positions Open Interest</p>

        <LiveIcon />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 p-3 lg:p-0">
        {...custodies
          .filter((c) => !c.isStable)
          .map((custody, i) => {
            return (
              <div
                key={custody.pubkey.toBase58()}
                className={twMerge(
                  'flex-1 border rounded-md lg:rounded-none lg:border-0 pl-5 pt-3 pr-3 pb-3',
                  i !== 0 ? 'lg:border-l' : '',
                  i !== 2 ? 'lg:pr-0' : '',
                )}
              >
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src={custody.tokenInfo.image}
                    alt="token icon"
                    width={24}
                    height={24}
                  />

                  <p className={twMerge(titleClassName, 'opacity-100')}>
                    {custody.tokenInfo.symbol}
                  </p>
                </div>

                <div className="flex flex-col">
                  <div className="mt-3">
                    <div
                      className={twMerge(
                        titleClassName,
                        'text-green opacity-75',
                      )}
                    >
                      Long
                    </div>

                    <div className="flex flex-col">
                      <NumberDisplay
                        nb={nativeToUi(
                          custody.nativeObject.longPositions.lockedAmount,
                          custody.decimals,
                        )}
                        precision={
                          custody.tokenInfo.displayAmountDecimalsPrecision
                        }
                        suffix={custody.tokenInfo.symbol}
                        className="border-0 p-1 items-start"
                      />

                      <NumberDisplay
                        nb={nativeToUi(
                          custody.nativeObject.longPositions.sizeUsd,
                          USD_DECIMALS,
                        )}
                        precision={0}
                        format="currency"
                        className="border-0 p-1 items-start"
                        bodyClassName="text-sm text-txtfade"
                      />
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-bcolor my-1" />

                  <div className="mt-2">
                    <div
                      className={twMerge(
                        titleClassName,
                        'mr-4 text-red opacity-75',
                      )}
                    >
                      Short
                    </div>

                    <NumberDisplay
                      nb={nativeToUi(
                        // Works because we have only one stable
                        custody.nativeObject.shortPositions
                          .stableLockedAmount[0].lockedAmount,
                        USD_DECIMALS,
                      )}
                      precision={0}
                      suffix="USDC"
                      className="border-0 p-1 items-start"
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
