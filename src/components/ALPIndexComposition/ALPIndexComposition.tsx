import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import ALPIndexCompositionArray from './ALPIndexCompositionArray';
import ALPIndexCompositionBlocs from './ALPIndexCompositionBlocs';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { AdrenaClient } from '@/AdrenaClient';
import { CustodyExtended } from '@/types';

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
