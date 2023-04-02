import { AdrenaClient } from '@/AdrenaClient';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { CustodyExtended } from '@/types';

import ALPIndexCompositionArray from './ALPIndexCompositionArray';
import ALPIndexCompositionBlocs from './ALPIndexCompositionBlocs';

export default function ALPIndexComposition({
  className,
  client,
  custodies,
}: {
  className?: string;
  client: AdrenaClient | null;
  custodies: CustodyExtended[] | null;
}) {
  const alpIndexComposition = useALPIndexComposition(client, custodies);
  const isBigScreen = useBetterMediaQuery('(min-width: 950px)');

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
