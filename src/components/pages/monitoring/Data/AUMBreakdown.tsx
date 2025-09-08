import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { useSelector } from '@/store/store';
import { CustodyExtended } from '@/types';

export default function AUMBreakdown({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>AUM Breakdown</p>
      </div>

      <div className="grid md:grid-cols-4">
        {...custodies.map((custody, i) => {
          return (
            <div
              key={custody.pubkey.toBase58()}
              className={twMerge(
                'flex-1 p-4',
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

                <p className={twMerge(titleClassName, 'opacity-100')}>
                  {custody.tokenInfo.symbol}
                </p>
              </div>

              <NumberDisplay
                nb={custody.owned}
                precision={custody.tokenInfo.displayAmountDecimalsPrecision}
                className="border-0 p-0 items-start"
              />

              {tokenPrices[custody.tokenInfo.symbol] ? (
                <NumberDisplay
                  nb={
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    custody.owned * tokenPrices[custody.tokenInfo.symbol]!
                  }
                  precision={0}
                  className="border-0 p-0 items-start"
                  bodyClassName="text-txtfade text-sm"
                  format="currency"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
