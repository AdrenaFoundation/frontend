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

  return (
    <div>
      {isBigScreen ? (
        <ALPIndexCompositionArray
          alpIndexComposition={alpIndexComposition}
          className={className}
        />
      ) : (
        <ALPIndexCompositionBlocs
          alpIndexComposition={alpIndexComposition}
          className={className}
        />
      )}
    </div>
  );
}
