import 'rc-slider/assets/index.css';

import Image from 'next/image';
import Slider from 'rc-slider';
import { twMerge } from 'tailwind-merge';

import lockIcon from '@/../public/images/Icons/lock.svg';
import unlockIcon from '@/../public/images/Icons/unlock.svg';

// Import from tailwind config
const RAIL_COLOR = 'var(--color-bcolor)';

const SUCCESS_COLORS = {
  emerald: '#10b981',
  green: '#22c55e',
  teal: '#14b8a6',
};

const DANGER_COLORS = {
  red: '#C9243A',
  rose: '#e11d48',
  pink: '#db2777',
};

const LEVERAGE_MARKS = [1.1, 5, 10, 25, 50, 100] as const;

export default function LeverageSlider({
  className,
  value,
  onChange,
  isLocked = false,
  onLockToggle,
  side = 'long',
}: {
  value?: number;
  className?: string;
  onChange: (v: number) => void;
  isLocked?: boolean;
  onLockToggle?: (locked: boolean) => void;
  side?: 'long' | 'short';
}) {
  const isLong = side === 'long';
  const activeColor = isLong ? SUCCESS_COLORS.green : DANGER_COLORS.red;
  const gradient = isLong
    ? `linear-gradient(to right, ${SUCCESS_COLORS.emerald}, ${SUCCESS_COLORS.green}, ${SUCCESS_COLORS.teal})`
    : `linear-gradient(to right, ${DANGER_COLORS.red}, ${DANGER_COLORS.rose}, ${DANGER_COLORS.pink})`;

  const valueToPosition = (val: number): number => {
    if (val <= LEVERAGE_MARKS[0]) return 0;
    if (val >= LEVERAGE_MARKS[LEVERAGE_MARKS.length - 1])
      return LEVERAGE_MARKS.length - 1;

    for (let i = 0; i < LEVERAGE_MARKS.length - 1; i++) {
      if (val >= LEVERAGE_MARKS[i] && val <= LEVERAGE_MARKS[i + 1]) {
        const ratio =
          (val - LEVERAGE_MARKS[i]) /
          (LEVERAGE_MARKS[i + 1] - LEVERAGE_MARKS[i]);
        return i + ratio;
      }
    }
    return 0;
  };

  const positionToValue = (pos: number): number => {
    const index = Math.floor(pos);
    const fraction = pos - index;

    if (index >= LEVERAGE_MARKS.length - 1)
      return LEVERAGE_MARKS[LEVERAGE_MARKS.length - 1];
    if (index < 0) return LEVERAGE_MARKS[0];

    return (
      LEVERAGE_MARKS[index] +
      (LEVERAGE_MARKS[index + 1] - LEVERAGE_MARKS[index]) * fraction
    );
  };

  const handleIncrement = () => {
    const currentValue = value || 1.1;
    if (currentValue >= 100) return onChange(100);
    if (currentValue >= 1.1 && currentValue < 2) return onChange(2);
    onChange(Math.min(100, Math.floor(currentValue) + 1));
  };

  const handleDecrement = () => {
    const currentValue = value || 1.1;
    if (currentValue <= 1.1) return onChange(1.1);
    if (currentValue === 2) return onChange(1.1);
    if (currentValue > 2 && currentValue <= 3) return onChange(2);
    onChange(Math.max(1.1, Math.floor(currentValue) - 1));
  };

  return (
    <div className={twMerge('flex flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 pb-2 h-8">
        {!isLocked && (
          <button
            onClick={handleDecrement}
            className="w-8 h-8 text-3xl flex items-center justify-center text-txtfade hover:text-white transition-colors duration-200"
          >
            −
          </button>
        )}

        <div
          className={twMerge('flex items-center gap-4', isLocked && 'mx-auto')}
        >
          <span className="text-xl font-bold font-mono">
            {value?.toFixed(1) || '10.0'}x
          </span>

          {onLockToggle && (
            <button
              onClick={() => onLockToggle(!isLocked)}
              className={twMerge(
                'flex items-center justify-center transition-opacity duration-200',
                isLocked ? 'opacity-900' : 'opacity-50 hover:opacity-90',
              )}
              title={isLocked ? 'Unlock leverage' : 'Lock leverage'}
            >
              <Image
                src={isLocked ? lockIcon : unlockIcon}
                alt={isLocked ? 'Locked' : 'Unlocked'}
                width={16}
                height={16}
              />
            </button>
          )}
        </div>

        {!isLocked && (
          <button
            onClick={handleIncrement}
            className="w-8 h-8 text-3xl flex items-center justify-center text-txtfade hover:text-white transition-colors duration-200"
          >
            +
          </button>
        )}
      </div>

      {!isLocked && (
        <div className="flex items-center gap-1 px-7 py-2">
          <div className="flex-1 relative pb-6">
            <Slider
              className={`custom-leverage-slider-${side}`}
              min={0}
              max={LEVERAGE_MARKS.length - 1}
              value={valueToPosition(value || 10)}
              step={0.01}
              styles={{
                rail: { backgroundColor: RAIL_COLOR, height: 4 },
                track: { background: gradient, height: 4 },
                handle: {
                  backgroundColor: activeColor,
                  borderColor: activeColor,
                  opacity: 1,
                  borderWidth: 1,
                },
              }}
              dotStyle={{ display: 'none' }}
              onChange={(pos) =>
                onChange(Math.round(positionToValue(pos as number) * 10) / 10)
              }
            />

            <div className="absolute top-0 left-0 right-0 pointer-events-none">
              {LEVERAGE_MARKS.map((mark, index) => {
                const percentage = (index / (LEVERAGE_MARKS.length - 1)) * 100;
                const isActive = valueToPosition(value || 10) >= index;

                return (
                  <div
                    key={mark}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${percentage}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div
                      className="w-[2px] h-3 mx-auto mb-1 transition-colors"
                      style={{
                        backgroundColor: isActive ? activeColor : RAIL_COLOR,
                        marginTop: '1px',
                      }}
                    />
                    <button
                      onClick={() => onChange(mark)}
                      className={twMerge(
                        'text-xs hover:text-white transition-colors cursor-pointer font-mono',
                        isActive ? 'text-white/80' : 'text-white/40',
                      )}
                    >
                      {mark}x
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
