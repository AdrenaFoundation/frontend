import useALPIndexComposition from "@/hooks/useALPIndexComposition";
import ALPIndexCompositionArray from "./ALPIndexCompositionArray";
import ALPIndexCompositionBlocs from "./ALPIndexCompositionBlocs";
import useBetterMediaQuery from "@/hooks/useBetterMediaQuery";

export default function ALPIndexComposition({
  className,
}: {
  className?: string;
}) {
  const alpIndexComposition = useALPIndexComposition();
  const isBigScreen = useBetterMediaQuery("(min-width: 950px)");

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
