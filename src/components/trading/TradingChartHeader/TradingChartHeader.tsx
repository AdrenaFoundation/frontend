import Select from "@/components/Select/Select";
import useDailyStats from "@/hooks/useDailyStats";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { formatNumber, formatPriceInfo } from "@/utils";
import styles from "./TradingChartHeader.module.scss";

export default function TradingInputs({
  className,
  tokenList,
  selected,
  onChange,
}: {
  className?: string;
  tokenList: Token[];
  selected: Token;
  onChange: (t: Token) => void;
}) {
  const wallet = useSelector((s) => s.wallet);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const connected = !!wallet;
  const stats = useDailyStats();

  return (
    <div className={`${styles.tradingChartHeader} ${className ?? ""}`}>
      <Select
        selected={`${selected.name} / USD`}
        options={tokenList
          .filter((token) => token.name !== selected.name)
          .map((token) => `${token.name} / USD`)}
        onSelect={(opt: string) => {
          const selectedTokenName = opt.slice(0, opt.length - " / USD".length);
          const token = tokenList.find((t) => t.name === selectedTokenName)!;

          // Should never happens
          if (!token) return;

          onChange(token);
        }}
      />

      <div className={styles.tradingChartHeader__currentprice}>
        {tokenPrices && tokenPrices[selected.name]
          ? formatPriceInfo(tokenPrices[selected.name]!)
          : null}
      </div>

      <div className={styles.tradingChartHeader__dailyPriceChange}>
        <span>24h Change</span>
        <span
          className={`${
            stats && stats[selected.name].dailyChange > 0
              ? styles.tradingChartHeader__positive
              : ""
          } ${
            stats && stats[selected.name].dailyChange < 0
              ? styles.tradingChartHeader__negative
              : ""
          }`}
        >
          {stats
            ? `${formatNumber(stats[selected.name].dailyChange, 2)}%`
            : "-"}
        </span>
      </div>

      <div className={styles.tradingChartHeader__dailyPriceVolume}>
        <span>24h Volume</span>
        <span>
          {stats ? formatPriceInfo(stats[selected.name].dailyVolume) : "-"}
        </span>
      </div>
    </div>
  );
}
