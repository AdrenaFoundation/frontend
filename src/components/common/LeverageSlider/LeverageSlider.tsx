import 'rc-slider/assets/index.css';

import Slider from 'rc-slider';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

// Leverage colors
/*
// GMX Style
const colorA = '#2d3ed5';
const colorB = '#232743';
*/

// ADRENA Style
const colorA = '#36538f';
const colorB = '#1e222d';

export default function LeverageSlider({
  className,
  onChange,
}: {
  className?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className={twMerge('h-4', 'min-h-4', 'flex', 'min-w-10', className)}>
      <Slider
        min={1}
        max={50}
        defaultValue={1}
        step={0.1}
        marks={[2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].reduce(
          (acc, mark) => {
            acc[mark] = <span className="text-txtfade">x{mark}</span>;
            return acc;
          },
          {} as Record<number, ReactNode>,
        )}
        railStyle={{
          backgroundColor: colorB,
        }}
        trackStyle={{
          backgroundColor: colorA,
        }}
        handleStyle={{
          backgroundColor: colorB,
          borderColor: colorA,
        }}
        activeDotStyle={{
          backgroundColor: colorA,
          borderColor: colorA,
        }}
        dotStyle={{
          backgroundColor: colorB,
          borderColor: colorB,
        }}
        // Use as number because we don't use the slider as a range
        onChange={(v) => onChange(v as number)}
      />
    </div>
  );
}
