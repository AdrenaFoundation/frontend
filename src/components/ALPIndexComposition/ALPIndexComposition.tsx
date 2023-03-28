import useALPIndexComposition from "@/hooks/useALPIndexComposition";
import { formatPriceInfo } from "@/utils";
import { twMerge } from "tailwind-merge";

function formatPercentage(nb: number | null): string {
  if (nb === null) {
    return "-";
  }

  return `${Number(nb / 100).toFixed(2)}%`;
}

export default function ALPIndexComposition({
  className,
}: {
  className?: string;
}) {
  const alpIndexComposition = useALPIndexComposition();

  return (
    <div
      className={twMerge("bg-secondary", "border", "border-grey", className)}
    >
      <div className="flex h-12 w-full items-center pl-4 font-bold">
        ALP Index Composition
      </div>

      <div className="flex h-12 w-full items-center pl-4 pr-4">
        {["Token", "Price", "Pool", "Weight", "Utilization"].map(
          (columnName) => (
            <div
              key={columnName}
              className="flex w-40 shrink-0 grow uppercase last:justify-end"
            >
              {columnName}
            </div>
          )
        )}
      </div>

      {alpIndexComposition ? (
        <div className="flex flex-col pl-4 pr-4">
          {alpIndexComposition.map((composition) => (
            <div
              key={composition.token.name}
              className="flex h-12 w-full items-center"
            >
              <div className="flex items-center w-40 shrink-0 grow">
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="w-8 h-8"
                    src={composition.token.image}
                    alt={`${composition.token.name} logo`}
                  />
                }
                <span className="ml-4">{composition.token.name}</span>
              </div>

              <div className="flex items-center w-40 shrink-0 grow">
                {composition.price ? formatPriceInfo(composition.price) : "-"}
              </div>

              <div className="flex items-center w-40 shrink-0 grow">
                {composition.poolUsdValue
                  ? formatPriceInfo(composition.poolUsdValue)
                  : "-"}
              </div>

              <div className="flex items-center w-40 shrink-0 grow">
                <span>{formatPercentage(composition.currentRatio)}</span>
                <span className="ml-1 mr-1">/</span>
                <span>{formatPercentage(composition.targetRatio)}</span>
              </div>

              <div className="flex items-center w-40 shrink-0 grow justify-end">
                {formatPercentage(composition.utilization)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
