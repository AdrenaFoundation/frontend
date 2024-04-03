import 'rc-slider/assets/index.css';

import Slider from 'rc-slider';
import { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputNumber from '../InputNumber/InputNumber';

// ADRENA Style
const colorA = '#ffffff20';

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
    <div className={twMerge('flex overflow-hidden h-16', className)}>
      <div className="flex pl-1 pt-1 pr-2 pb-1 bg-third w-[4em] border-r h-full">
        <div className="flex w-full items-center ml-1 shrink-0">
          <span className="shrink-0 w-2">x</span>

          <InputNumber
            className="w-full max-w-full overflow-hidden text-center bg-third"
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
        </div>
      </div>

      <div className="flex h-full w-full bg-transparent pr-4 pl-2 ml-2">
        <Slider
          className="relative top-4"
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
            backgroundColor: colorA,
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
            borderColor: colorA,
          }}
          dotStyle={{
            borderRadius: 0,
            width: '2px',
            border: 0,
            height: '0.8em',
            backgroundColor: colorA,
            borderColor: colorA,
          }}
          // Use as number because we don't use the slider as a range
          onChange={(v) => onChange(v as number)}
        />
      </div>
    </div>
  );
}
