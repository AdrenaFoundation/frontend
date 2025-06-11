import { twMerge } from 'tailwind-merge';

interface ExecutionModeSelectorProps {
    isLimitOrder: boolean;
    onModeChange: (isLimit: boolean) => void;
}

export const ExecutionModeSelector = ({ isLimitOrder, onModeChange }: ExecutionModeSelectorProps) => (
    <>
        <h5 className="flex items-center mt-4">Execute at</h5>

        <div className='w-full h-10 flex mt-2 justify-between gap-1'>
            <div
                className={twMerge(
                    'w-1/2 h-full flex items-center bg-bcolor border rounded justify-center text-sm cursor-pointer font-boldy',
                    !isLimitOrder ? 'text-[#f3f3f4]' : 'text-txtfade'
                )}
                onClick={() => onModeChange(false)}
            >
                Current Price
            </div>

            <div
                className={twMerge(
                    'w-1/2 h-full flex flex-col items-center bg-bcolor border rounded justify-center text-sm cursor-pointer font-boldy',
                    isLimitOrder ? 'text-[#f3f3f4]' : 'text-txtfade'
                )}
                onClick={() => onModeChange(true)}
            >
                Specific Price
                <div className='text-xxs text-txtfade'>Limit order</div>
            </div>
        </div>
    </>
);
