import { twMerge } from 'tailwind-merge';

import Switch from '@/components/common/Switch/Switch';

interface ExecutionModeSelectorProps {
  isLimitOrder: boolean;
  onModeChange: (isLimit: boolean) => void;
}

export const ExecutionModeSelector = ({
  isLimitOrder,
  onModeChange,
}: ExecutionModeSelectorProps) => (
  <div
    className="flex flex-row items-center justify-between gap-3 p-3 px-4 bg-third border rounded-lg cursor-pointer select-none mt-4"
    onClick={() => onModeChange(!isLimitOrder)}
  >
    <h5 className="flex items-center text-sm font-interBold">Limit order</h5>

    <Switch
      className={twMerge('mr-0.5', isLimitOrder ? 'bg-green' : 'bg-inputcolor')}
      checked={isLimitOrder}
      onChange={() => {
        // Handle the click on the level above
      }}
      size="medium"
    />

    {/* <div className='w-full h-10 flex mt-2 justify-between gap-1'>
            <div
                className={twMerge(
                    'w-1/2 h-full flex items-center bg-bcolor opacity-50 border rounded-lg justify-center text-sm cursor-pointer font-archivo transition duration-300',
                    !isLimitOrder && 'opacity-100 border-white/20'
                )}
                onClick={() => onModeChange(false)}
            >
                Current Price
            </div>

            <div
                className={twMerge(
                    'w-1/2 h-full flex flex-col items-center bg-bcolor opacity-50 border rounded-lg justify-center text-sm cursor-pointer font-archivo',
                    isLimitOrder && 'opacity-100 border-white/20'
                )}
                onClick={() => onModeChange(true)}
            >
                Specific Price
                <div className='text-xxs text-txtfade'>Limit order</div>
            </div>
        </div> */}
  </div>
);
