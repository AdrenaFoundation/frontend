import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { CustodyExtended } from '@/types';

import ALPIndexCompositionArray from './ALPIndexCompositionArray';
import ALPIndexCompositionBlocs from './ALPIndexCompositionBlocs';

export default function ALPIndexComposition({
  className,
  custodies,
}: {
  className?: string;
  custodies: CustodyExtended[] | null;
}) {
  const alpIndexComposition = useALPIndexComposition(custodies);
  const isBigScreen = useBetterMediaQuery('(min-width: 950px)');

  if (isBigScreen === null) return null;

  const calculateOffset = (
    targetRatio: number | null,
    currentRatio: number | null,
  ) => {
    if (!currentRatio || !targetRatio) {
      return '';
    }

    const boundries = {
      1: targetRatio * 0.01,
      5: targetRatio * 0.05,
      10: targetRatio * 0.1,
      30: targetRatio * 0.3,
    };

    const diff = Math.abs(currentRatio - targetRatio); // 4

    if (boundries[1] >= diff) {
      return 'text-green-500';
    }

    if (boundries[1] <= diff && diff <= boundries[5]) {
      return 'text-green-500';
    }

    if (boundries[5] <= diff && diff <= boundries[10]) {
      return '';
    }

    if (boundries[10] <= diff && diff <= boundries[30]) {
      return 'text-orange-500';
    }

    // more than 30% off from target ratio
    return 'text-red-500';
  };

  return (
    <div>
      {isBigScreen ? (
        <ALPIndexCompositionArray
          alpIndexComposition={alpIndexComposition}
          calculateOffset={calculateOffset}
          className={className}
        />
      ) : (
        <ALPIndexCompositionBlocs
          alpIndexComposition={alpIndexComposition}
          calculateOffset={calculateOffset}
          className={className}
        />
      )}
    </div>
  );
}
