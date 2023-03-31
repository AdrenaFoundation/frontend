import { ALPIndexComposition } from "@/hooks/useALPIndexComposition";
import { formatPercentage, formatPriceInfo } from "@/utils";
import { twMerge } from "tailwind-merge";

export default function ALPIndexCompositionBlocs({
  alpIndexComposition,
  className,
}: {
  alpIndexComposition: ALPIndexComposition | null;
  className?: string;
}) {
  if (!alpIndexComposition) return null;

  return (
    <div className={twMerge("flex", "flex-wrap", "justify-evenly", className)}>
      {alpIndexComposition.map((composition) => (
        <div
          key={composition.token.name}
          className="flex flex-col w-[45%] bg-secondary border border-grey justify-evenly mt-4 p-4"
        >
          <div className="flex items-center border-b border-grey pb-2">
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-6 h-6"
                src={composition.token.image}
                alt={`${composition.token.name} logo`}
              />
            }
            <span className="ml-4">{composition.token.name}</span>
          </div>

          <div className="flex flex-col w-full mt-4">
            <div className="flex w-full justify-between">
              <div>Price</div>
              <div className="flex">
                {composition.price ? formatPriceInfo(composition.price) : "-"}
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div>Pool</div>
              <div className="flex">
                {composition.poolUsdValue
                  ? formatPriceInfo(composition.poolUsdValue)
                  : "-"}
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div>Weight</div>
              <div className="flex">
                <span>{formatPercentage(composition.currentRatio)}</span>
                <span className="ml-1 mr-1">/</span>
                <span>{formatPercentage(composition.targetRatio)}</span>
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div>Utilization</div>
              <div className="flex justify-end">
                {formatPercentage(composition.utilization)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
