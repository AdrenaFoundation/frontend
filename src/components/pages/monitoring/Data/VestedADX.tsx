import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { VestRegistry } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function VestedADX({
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
      title="VESTED ADX"
      className="w-auto grow"
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
