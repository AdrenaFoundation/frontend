import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { USD_DECIMALS } from '@/constant';
import { CustodyExtended } from '@/types';
import { nativeToUi } from '@/utils';

import NumberInfo from '../NumberInfo';

export default function AllTimeFeesBreakdownPerToken({
  custodies,
  titleClassName,
  bodyClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
  bodyClassName?: string;
}) {
  const attributes = Object.keys(custodies[0].nativeObject.collectedFees);

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>All time Fees Breakdown (Per Token)</p>
      </div>

      <div className='grid sm:grid-cols-2 lg:grid-cols-4'>
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

                <p className={titleClassName}>{custody.tokenInfo.symbol}</p>
              </div>

              <div className="flex flex-col gap-1 mt-3">
                {attributes.map((attribute, i) => (
                  <div className="flex flex-row justify-between items-center">
                    <p className={twMerge('text-txtfade', bodyClassName)}>
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
                    </p>

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
                        wholePartClassName={bodyClassName}
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
