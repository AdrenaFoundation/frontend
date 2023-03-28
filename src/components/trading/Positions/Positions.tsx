import Button from "@/components/Button/Button";
import usePositions from "@/hooks/usePositions";
import { useSelector } from "@/store/store";
import { formatNumber, formatPriceInfo, nativeToUi } from "@/utils";
import styles from "./Positions.module.scss";

export default function Positions({ className }: { className?: string }) {
  const positions = usePositions();
  const tokenPrices = useSelector((s) => s.tokenPrices);

  // TODO
  // Change compeltely how the positions are displayed if the screen is small

  return (
    <div className={`${styles.positions} ${className ?? ""}`}>
      {/* Header */}
      <div className={styles.positions__header}>
        <div className={styles.positions__column}>Position</div>
        <div className={styles.positions__column}>Net Value</div>
        <div className={styles.positions__column}>Size</div>
        <div className={styles.positions__column}>Collateral</div>
        <div className={styles.positions__column}>Entry Price</div>
        <div className={styles.positions__column}>Mark Price</div>
        <div className={styles.positions__column}>Liq. Price</div>
        <div className={styles.positions__column}>{/* Close action*/}</div>
      </div>

      {/* Content */}
      <div className={styles.positions__contents}>
        {!positions?.length ? (
          <div className={styles.positions__contents_none}>
            No opened position
          </div>
        ) : null}

        {positions?.map((position) => (
          <div
            key={position.pubkey.toBase58()}
            className={styles.positions__contents_one}
          >
            <div
              className={`${styles.positions__column} ${styles.position_name}`}
            >
              <div>{position.token?.name ?? "Unknown Token"}</div>
              <div>
                <div>{formatNumber(position.leverage, 2)}x</div>
                <div
                  className={`${styles.position_name_side} ${
                    styles[`position_name_side_${position.side}`]
                  }`}
                >
                  {position.side}
                </div>
              </div>
            </div>

            <div className={styles.positions__column}>{/*Net Value*/}TODO</div>

            <div className={styles.positions__column}>
              {formatPriceInfo(nativeToUi(position.sizeUsd, 6))}
            </div>

            <div className={styles.positions__column}>
              {formatPriceInfo(nativeToUi(position.collateralUsd, 6))}
            </div>

            <div className={styles.positions__column}>
              {formatPriceInfo(nativeToUi(position.price, 6))}
            </div>

            <div className={styles.positions__column}>
              {position.token && tokenPrices[position.token.name]
                ? formatPriceInfo(tokenPrices[position.token.name]!)
                : "-"}
            </div>

            <div className={styles.positions__column}>{/*Liq. Price*/}TODO</div>

            <Button
              className={styles.positions__column}
              title="Close"
              onClick={() => {
                console.log("TODO: close position tx");
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
