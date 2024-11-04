import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { USD_DECIMALS } from '@/constant';
import { CustodyExtended } from '@/types';
import { nativeToUi } from '@/utils';

export default function AllTimeFeesBreakdownPerToken({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  const attributes = Object.keys(custodies[0].nativeObject.collectedFees);

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>All time Fees Breakdown</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {...custodies.map((custody, i) => {
          return (
            <div
              key={custody.pubkey.toBase58()}
              className={twMerge(
                'flex-1 p-5',
                i !== 0 && 'lg:border-l',
                i % 2 && 'sm:border-l',
                i > 1 && 'border-t sm:border-t lg:border-t-0',
                i == 1 && 'border-t sm:border-t-0',
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <Image
                  src={custody.tokenInfo.image}
                  alt="token icon"
                  width="24"
                  height="24"
                />

                <p className={twMerge(titleClassName, 'opacity-100')}>{custody.tokenInfo.symbol}</p>
              </div>

              <div className="flex flex-col mt-3">
                {attributes.map((attribute, i) => (
                  <div
                    className="flex flex-row justify-between items-center"
                    key={i}
                  >
                    <p className={twMerge('text-txtfade text-base')}>
                      {
                        [
                          'Swap',
                          'Add Liq.',
                          'Remove Liq.',
                          'Close Pos.',
                          'Liquidation',
                          'Borrow',
                        ][i]
                      }
                    </p>

                    <div key={attribute} className="flex">
                      <NumberDisplay
                        nb={nativeToUi(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (custody.nativeObject.collectedFees as any)[
                          attribute
                          ],
                          USD_DECIMALS,
                        )}
                        precision={0}
                        format='currency'
                        className='border-0 p-0 min-h-0'
                        bodyClassName='text-base'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
