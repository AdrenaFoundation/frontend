import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { ALPIndexComposition } from '@/hooks/useALPIndexComposition';
import { CustodyExtended, PoolExtended } from '@/types';

import PoolRatioChart from '../PoolRatioChart';
import Score from '../Score';

export default function PoolBloc({
  className,
  alpComposition,
}: {
  className?: string;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
  alpComposition: ALPIndexComposition;
}) {
  // Leave if info are missing
  if (
    alpComposition.some(
      (c) => c.targetRatio === null || c.currentRatio === null,
    )
  )
    return <></>;

  // Calculate the distance between the targetRatio and the currentRatio
  // The greater the distance, the lesser the score
  const ratioScore =
    100 -
    alpComposition.reduce((distance, comp) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return distance + Math.abs(comp.targetRatio! - comp.currentRatio!);
    }, 0);

  return (
    <StyledContainer title={<h1>Pool ratios</h1>} className={className}>
      <div className="w-full flex h-[100px] items-center pl-4 pr-4 mt-4">
        <PoolRatioChart alpComposition={alpComposition} />
      </div>

      <div className="text-lg ml-4 mt-4 font-special">Ratio Score</div>

      <Score className="ml-auto mr-auto" score={ratioScore} />
    </StyledContainer>
  );
}
