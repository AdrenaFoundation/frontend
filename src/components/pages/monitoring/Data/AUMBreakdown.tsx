import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
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
    <StyledContainer
      title="AUM Breakdown"
      headerClassName="text-center justify-center"
      className="w-auto grow"
      titleClassName={titleClassName}
    >
      <div className="flex flex-row flex-wrap justify-evenly grow h-full w-full gap-x-2 gap-y-4">
        {...custodies.map((custody) => {
          return (
            <StyledSubSubContainer
              key={custody.pubkey.toBase58()}
              className="flex flex-col w-full sm:w-[48%] min-w-[10em] h-[8em] items-center justify-center p-0 relative overflow-hidden"
            >
              <Image
                src={custody.tokenInfo.image}
                className="absolute top-0 left-[-40px] -z-10 grayscale opacity-5"
                alt="token icon"
                width="200"
                height="200"
              />

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
            </StyledSubSubContainer>
          );
        })}
      </div>
    </StyledContainer>
  );
}
