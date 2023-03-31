import useALPIndexComposition from "@/hooks/useALPIndexComposition";
import { useMediaQuery } from "react-responsive";
import ALPIndexCompositionArray from "./ALPIndexCompositionArray";
import ALPIndexCompositionBlocs from "./ALPIndexCompositionBlocs";

export default function ALPIndexComposition({
  className,
}: {
  className?: string;
}) {
  const alpIndexComposition = useALPIndexComposition();
  const isBigScreen = useMediaQuery({ query: "(min-width: 950px)" });

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
