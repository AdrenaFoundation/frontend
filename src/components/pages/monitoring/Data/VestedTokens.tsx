import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { VestRegistry } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function VestedTokens({
  vestRegistry,
  titleClassName,
  bodyClassName,
}: {
  vestRegistry: VestRegistry;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="VESTED TOKENS"
      className="w-auto grow min-w-[22em]"
      bodyClassName="items-center"
      titleClassName={titleClassName}
    >
      <div className="flex items-center justify-center">
        <div className={bodyClassName}>
          {formatNumber(
            nativeToUi(
              vestRegistry.vestedTokenAmount,
              window.adrena.client.adxToken.decimals,
            ),
            2,
          )}
        </div>
        <div className="ml-1">ADX</div>
      </div>
    </StyledContainer>
  );
}
