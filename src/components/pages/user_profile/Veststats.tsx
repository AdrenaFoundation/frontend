import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { Vest } from '@/types';
import { nativeToUi } from '@/utils';

export default function VestStats({
  userVest,
  className,
}: {
  userVest: Vest | null;
  className?: string;
}) {
  return (
    <StyledContainer
      title="Vest Stats"
      titleClassName="text-2xl"
      className={twMerge(className)}
    >
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Vested amount</div>

          <FormatNumber
            nb={
              userVest
                ? nativeToUi(
                    userVest.amount,
                    window.adrena.client.adxToken.decimals,
                  )
                : null
            }
            placeholder="0"
            suffix=" ADX"
            precision={3}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Claimed amount</div>

          <FormatNumber
            nb={
              userVest
                ? nativeToUi(
                    userVest.claimedAmount,
                    window.adrena.client.adxToken.decimals,
                  )
                : null
            }
            placeholder="0"
            suffix=" ADX"
            precision={3}
          />
        </div>
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
