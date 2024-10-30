import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { CustodyExtended } from '@/types';

import NumberInfo from '../NumberInfo';

export default function AUMBreakdown({
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
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>AUM Breakdown</p>
      </div>

      <div className='grid sm:grid-cols-2 xl:grid-cols-4'>
        {...custodies.map((custody, i) => {
          return (
            <div
              key={custody.pubkey.toBase58()}
              className={twMerge(
                'flex-1 p-5',
                i !== 0 && 'xl:border-l',
                i % 2 && 'sm:border-l',
                i > 1 && 'border-t sm:border-t xl:border-t-0',
                i == 1 && 'border-t sm:border-t-0',
              )}
            >
              <div className="flex flex-row items-center gap-2 mb-3">
                <Image
                  src={custody.tokenInfo.image}
                  alt="token icon"
                  width="24"
                  height="24"
                />

                <p className={twMerge(titleClassName, 'opacity-100')}>{custody.tokenInfo.symbol}</p>
              </div>

              <NumberInfo
                value={custody.owned}
                className="items-center"
                precision={custody.tokenInfo.symbol === 'BTC' ? 2 : 0}
                denomination={custody.tokenInfo.symbol}
                wholePartClassName={mainWholeNumberClassName}
                denominationClassName="text-base ml-2"
              />

              {tokenPrices[custody.tokenInfo.symbol] ? (
                <NumberInfo
                  value={
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    custody.owned * tokenPrices[custody.tokenInfo.symbol]!
                  }
                  precision={0}
                  denominationClassName={dollarWholeNumberClassName}
                  wholePartClassName={twMerge(
                    'text-txtfade',
                    dollarWholeNumberClassName,
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
