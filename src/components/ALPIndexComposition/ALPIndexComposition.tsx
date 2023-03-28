import useALPIndexComposition from "@/hooks/useALPIndexComposition";
import { formatPriceInfo } from "@/utils";
import styles from "./ALPIndexComposition.module.scss";

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
    <div className={`${styles.alpIndexComposition} ${className ?? ""}`}>
      <div className={styles.alpIndexComposition__title}>
        ALP Index Composition
      </div>

      <div className={styles.alpIndexComposition__header}>
        <div>Token</div>
        <div>Price</div>
        <div>Pool</div>
        <div>Weight</div>
        <div>Utilization</div>
      </div>

      {alpIndexComposition ? (
        <div className={styles.alpIndexComposition__tokens}>
          {alpIndexComposition.map((composition) => (
            <div
              key={composition.token.name}
              className={styles.alpIndexComposition__token}
            >
              <div className={styles.alpIndexComposition__token_name}>
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.alpIndexComposition__token_icon}
                    src={composition.token.image}
                    alt={`${composition.token.name} logo`}
                  />
                }
                <span>{composition.token.name}</span>
              </div>

              <div>
                {composition.price ? formatPriceInfo(composition.price) : "-"}
              </div>

              <div>
                {composition.poolUsdValue
                  ? formatPriceInfo(composition.poolUsdValue)
                  : "-"}
              </div>

              <div className={styles.alpIndexComposition__token_weights}>
                <span>{formatPercentage(composition.currentRatio)}</span>/
                <span>{formatPercentage(composition.targetRatio)}</span>
              </div>

              <div>{formatPercentage(composition.utilization)}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
