import Slider from "rc-slider";
import styles from "./LeverageSlider.module.scss";
import "rc-slider/assets/index.css";
import { ReactNode } from "react";

export default function LeverageSlider({
  className,
  onChange,
}: {
  className?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className={`${styles.leverageSlider} ${className ?? ""}`}>
      <Slider
        min={1}
        max={50}
        defaultValue={1}
        step={0.1}
        marks={[2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].reduce(
          (acc, mark) => {
            acc[mark] = (
              <span className={styles.leverageSlider__mark}>x{mark}</span>
            );
            return acc;
          },
          {} as Record<number, ReactNode>
        )}
        railStyle={{
          backgroundColor: "#232743",
        }}
        trackStyle={{
          backgroundColor: "#2d3ed5",
        }}
        handleStyle={{
          backgroundColor: "#232743",
          borderColor: "#2d3ed5",
        }}
        activeDotStyle={{
          backgroundColor: "#2d3ed5",
          borderColor: "#2d3ed5",
        }}
        dotStyle={{
          backgroundColor: "#232743",
          borderColor: "#232743",
        }}
        // Use as number because we don't use the slider as a range
        onChange={(v) => onChange(v as number)}
      />
    </div>
  );
}
