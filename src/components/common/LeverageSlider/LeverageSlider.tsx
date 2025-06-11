import 'rc-slider/assets/index.css';

import Slider from 'rc-slider';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '../Button/Button';
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
  const marks = [3, 5, 10, 25, 50, 100];

  const handleBlur = () => {
    if (isLeverageInputEmpty || value === undefined || value === null) {
      // If the input is empty, reset to the minimum value
      onChange(1.1);
      setIsLeverageInputEmpty(false);
    } else {
      let adjustedValue = value;

      // Ensure the value respects min and max constraints
      if (adjustedValue < 1.1) {
        adjustedValue = 1.1;
      } else if (adjustedValue > 100) {
        adjustedValue = 100;
      }

      // Limit decimals to 1
      adjustedValue = Math.round(adjustedValue * 10) / 10;

      onChange(adjustedValue);
    }
  };

  return (
    <div className={twMerge('flex flex-col overflow-hidden', className)}>
      <div className="flex">
        <div className="flex flex-col pl-1 pt-1 pr-2 pb-1 w-[4.5em] h-8">
          <div className="flex w-full h-full items-center ml-3.5 shrink-0">
            <span className="shrink-0 w-2 font-mono">X</span>

            <InputNumber
              className="flex w-full max-w-full overflow-hidden font-mono text-left ml-1 bg-inputcolor"
              value={isLeverageInputEmpty ? undefined : value}
              min={1.1}
              max={100}
              onChange={function (value: number | null): void {
                if (value === null) {
                  setIsLeverageInputEmpty(true);
                  return;
                }
                onChange(value);
                setIsLeverageInputEmpty(false);
              }}
              inputFontSize="0.9em"
              onBlur={handleBlur}
              decimalConstraint={1}
            />
          </div>
        </div>

        <div className="flex h-full w-full pr-4 pl-4">
          <Slider
            className="relative top-2.5"
            min={1.1}
            max={100}
            value={value}
            step={0.1}
            railStyle={{
              backgroundColor: colorA,
              borderColor: 'white',
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
              height: '1.125em',
              width: '1.125em',
              marginTop: '-0.5em',
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

      <div className="flex h-6">
        {marks.map((mark, index) => (
          <Button
            key={index}
            title={`x${mark.toString()}`}
            variant="text"
            rounded={false}

            className={twMerge(
              'flex-1 flex-grow text-xs h-full',
              // Put 0.7 e.m instead of lg because conflicts in the border handling by browser
              index === 0 ? 'rounded-bl-[0.7em]' : '',
              index === marks.length - 1 ? 'rounded-br-[0.7em]' : '',
            )}
            onClick={() => {
              onChange(mark);
              setIsLeverageInputEmpty(false);
            }}
          />
        ))}
      </div>
    </div>
  );
}
