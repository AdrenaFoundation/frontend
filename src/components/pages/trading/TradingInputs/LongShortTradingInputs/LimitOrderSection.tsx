import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import FormatNumber from '@/components/Number/FormatNumber';

import { calculateLimitOrderTriggerPrice } from './utils';

interface LimitOrderSectionProps {
    side: 'short' | 'long';
    tokenPriceBTrade: number | undefined | null;
    limitOrderTriggerPrice: number | null;
    onTriggerPriceChange: (price: number | null) => void;
    limitOrderSlippage: number | null;
    onSlippageChange: (slippage: number | null) => void;
}

const triggerPricePresets = [0.1, 0.25, 0.5, 1, 5] as const;
const limitOrderSlippagePresets = [0.1, 0.25, 0.5, 1, 5, null] as const;

export const LimitOrderSection = ({
    side,
    tokenPriceBTrade,
    limitOrderTriggerPrice,
    onTriggerPriceChange,
    limitOrderSlippage,
    onSlippageChange,
}: LimitOrderSectionProps) => (
    <>
        <h5 className='ml-4 mt-4 flex'>Open Position after reaching</h5>

        <div className="flex items-center border-l border-t border-r rounded-tl-lg rounded-tr-lg bg-inputcolor pt-2 pb-2 mt-2 grow text-sm w-full relative gap-[0.1em]">
            <div className='pl-4 mt-[0.1em] text-[1.4em]'>{limitOrderTriggerPrice !== null ? '$' : null}</div>

            <InputNumber
                value={limitOrderTriggerPrice === null ? undefined : limitOrderTriggerPrice}
                placeholder="$100"
                className="font-mono border-0 outline-none bg-transparent h-8"
                onChange={onTriggerPriceChange}
                inputFontSize="1.4em"
            />

            {limitOrderTriggerPrice !== null && (
                <div
                    className="absolute right-4 cursor-pointer text-txtfade hover:text-white"
                    onClick={() => onTriggerPriceChange(null)}
                >
                    clear
                </div>
            )}
        </div>

        <div className="flex flex-row bg-inputcolor rounded-bl-lg rounded-br-lg h-7">
            {triggerPricePresets.map((percent, i) => (
                <Button
                    key={i}
                    title={`${side === 'long' ? '-' : '+'}${percent}%`}
                    variant="secondary"
                    rounded={false}
                    className={twMerge(
                        'flex-1 opacity-50 hover:opacity-100 flex-grow text-xs border-r border-t border-bcolor h-full font-bold',
                        i === 0 ? 'rounded-bl-[0.7em]' : '',
                        i === triggerPricePresets.length - 1 ? 'rounded-br-[0.7em] border-r-0' : '',
                        side === "long" ? 'text-redbright' : 'text-green',
                    )}
                    onClick={() => {
                        if (!tokenPriceBTrade) return;
                        onTriggerPriceChange(calculateLimitOrderTriggerPrice({
                            tokenPriceBTrade,
                            percent,
                            side,
                        }));
                    }}
                />
            ))}
        </div>

        <div className='flex items-center mt-3 ml-4 gap-1'>
            <div className='text-xs font-boldy relative bottom-[0.2em] text-txtfade'>
                Trigger price must be {side === 'long' ? 'below' : 'above'}
            </div>

            <div className='flex relative bottom-[0.15em]'>
                <FormatNumber
                    nb={tokenPriceBTrade}
                    format="currency"
                    className="text-xs"
                    isDecimalDimmed={false}
                />
            </div>
        </div>

        <h5 className='ml-4 mt-4 flex'>Slippage</h5>

        <div className="flex flex-row rounded-bl-lg rounded-br-lg h-7 gap-2 mt-3 pl-6 pr-6 mb-2">
            {limitOrderSlippagePresets.map((percent, i) => (
                <Button
                    key={i}
                    title={percent === null ? 'none' : `${percent}%`}
                    variant="secondary"
                    rounded={false}
                    className={twMerge(
                        'flex-1 hover:border-b-[#ffffffA0] flex-grow text-xs h-full font-bold border-b-2 border-transparent',
                        limitOrderSlippage === percent ? 'border-b-white' : '',
                    )}
                    onClick={() => onSlippageChange(percent)}
                />
            ))}
        </div>
    </>
);
