import { twMerge } from 'tailwind-merge';

import { ALPIndexComposition } from '@/hooks/useALPIndexComposition';
import { CustodyExtended, PoolExtended } from '@/types';
import { formatNumber } from '@/utils';

import Bloc from '../Bloc';
import PoolRatioChart from '../PoolRatioChart';
import Score from '../Score';

export default function PoolBloc({
  className,
  mainPool,
  custodies,
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
    <Bloc
      title="Pool ratios"
      className={twMerge('min-w-[20em] pb-4', className)}
    >
      <div className="w-full flex h-[100px] items-center pl-4 pr-4 mt-4">
        <PoolRatioChart alpComposition={alpComposition} />
      </div>

      <div className="text-lg ml-4 mt-4 font-specialmonster">Ratio Score</div>

      <Score className="ml-auto mr-auto" score={ratioScore} />
    </Bloc>
  );
}
