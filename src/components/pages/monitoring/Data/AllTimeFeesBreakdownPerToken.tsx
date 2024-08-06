import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
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
    <StyledContainer
      title="All time Fees Breakdown Per Token"
      headerClassName="text-center justify-center"
      className="w-auto grow"
      titleClassName={titleClassName}
    >
      <div className="flex flex-row flex-wrap justify-evenly grow h-full w-full gap-4">
        {...custodies.map((custody) => {
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

              <div className="flex w-full">
                <div className="flex flex-col w-[50%] items-end">
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
                        wholePartClassName={bodyClassName}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col w-[50%] shrink-0">
                  {attributes.map((_, i) => (
                    <span
                      className={twMerge('text-txtfade ml-2', bodyClassName)}
                      key={i}
                    >
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
  );
}
