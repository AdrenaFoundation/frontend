import 'rc-slider/assets/index.css';

import Slider from 'rc-slider';
import { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputNumber from '../InputNumber/InputNumber';

// Leverage colors

// GMX Style
// const colorA = '#2d3ed5';
// const colorB = '#232743';

// ADRENA Style
const colorB = '#ffffff20';

export default function LeverageSlider({
  className,
  value,
  onChange,
}: {
  value?: number;
  className?: string;
  onChange: (v: number) => void;
}) {
  // Use this state to allow user to remove everything in the input
  // overwise the user is stuck with one number, which is bad ux
  const [isLeverageInputEmpty, setIsLeverageInputEmpty] =
    useState<boolean>(false);

  return (
    <div className={twMerge('flex flex-col overflow-hidden', className)}>
      <div className="flex items-center pl-4 pt-1 pr-2 pb-1 bg-third w-full">
        <span className="shrink-0 w-3">x</span>

        <InputNumber
          className="w-full"
          value={isLeverageInputEmpty ? undefined : value}
          max={50}
          onChange={function (value: number | null): void {
            // throw new Error('Function not implemented.');
            if (value === null) {
              setIsLeverageInputEmpty(true);
              return;
            }

            onChange(value);
            setIsLeverageInputEmpty(false);
          }}
          inputFontSize="1em"
        />

        <div
          className="w-5 h-5 border flex items-center justify-center rounded cursor-pointer opacity-80 hover:opacity-100"
          onClick={() => {
            let newValue: number = value ? value - 1 : 1;

            if (newValue < 1) {
              newValue = 1;
            }

            onChange(newValue);
          }}
        >
          -
        </div>

        <div
          className="w-5 h-5 border flex items-center justify-center rounded cursor-pointer opacity-80 hover:opacity-100 ml-2"
          onClick={() => {
            let newValue: number = value ? value + 1 : 1;

            if (newValue > 50) {
              newValue = 50;
            }

            onChange(newValue);
          }}
        >
          +
        </div>
      </div>

      <div className="flex p-6 h-[3.5em] bg-third border-t">
        <Slider
          className="relative bottom-3"
          min={1}
          max={50}
          value={value}
          defaultValue={1}
          step={0.1}
          marks={[2, 5, 10, 15, 20, 30, 40, 50].reduce((acc, mark) => {
            acc[mark] = (
              <span className="text-white text-sm opacity-30 hover:opacity-100">
                x{mark}
              </span>
            );
            return acc;
          }, {} as Record<number, ReactNode>)}
          railStyle={{
            backgroundColor: colorB,
            height: 2,
          }}
          trackStyle={{
            backgroundColor: 'white',
            height: 2,
          }}
          handleStyle={{
            backgroundColor: 'white',
            borderColor: 'white',
            opacity: 1,
            borderWidth: '3px',
          }}
          activeDotStyle={{
            backgroundColor: 'white',
            borderColor: colorB,
          }}
          dotStyle={{
            borderRadius: 0,
            width: '2px',
            border: 0,
            height: '0.8em',
            backgroundColor: colorB,
            borderColor: colorB,
          }}
          // Use as number because we don't use the slider as a range
          onChange={(v) => onChange(v as number)}
        />
      </div>
    </div>
  );
}
