import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import FormatNumber from '@/components/Number/FormatNumber';
import { Token } from '@/types';

import { ErrorDisplay } from './ErrorDisplay';
import { calculateLimitOrderTriggerPrice } from './utils';

const triggerPricePresets = [0.1, 0.25, 0.5, 1, 5] as const;
const limitOrderSlippagePresets = [0.1, 0.25, 0.5, 1, 5, null] as const;

interface LimitOrderContentProps {
    side: 'long' | 'short';
    tokenPriceBTrade: number | undefined | null;
    limitOrderTriggerPrice: number | null;
    limitOrderSlippage: number | null;
    insufficientAmount: boolean;
    errorMessage: string | null;
    tokenA: Token;
    tokenB: Token;
    onTriggerPriceChange: (price: number | null) => void;
    onSlippageChange: (slippage: number | null) => void;
    onAddLimitOrder: () => void;
}

export const LimitOrderContent = ({
    side,
    tokenPriceBTrade,
    limitOrderTriggerPrice,
    limitOrderSlippage,
    insufficientAmount,
    errorMessage,
    tokenA,
    tokenB,
    onTriggerPriceChange,
    onSlippageChange,
    onAddLimitOrder,
}: LimitOrderContentProps) => (
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
                            tokenDecimals: tokenB.displayPriceDecimalsPrecision,
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

            <div className='flex relative bottom-[0.15em] cursor-pointer' onClick={() => {
                if (!tokenPriceBTrade) return;
                onTriggerPriceChange(tokenPriceBTrade);
            }}>
                <FormatNumber
                    nb={tokenPriceBTrade}
                    format="currency"
                    className="text-xs"
                    isDecimalDimmed={false}
                />
            </div>
        </div>

        <h5 className='ml-4 mt-4 flex'>Slippage</h5>

        <div className={`flex flex-row flex-wrap rounded-bl-lg rounded-br-lg h-7 gap-2 mt-3 mb-2`}>
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

        {
            side === 'short' && tokenA.symbol !== 'USDC' ?
                <ErrorDisplay errorMessage="Only USDC is allowed as collateral for short positions" /> :
                errorMessage && <ErrorDisplay errorMessage={errorMessage} />
        }

        <Button
            className={twMerge(
                'w-full justify-center mt-2 mb-1 sm:mb-2',
                side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
            )}
            size="lg"
            title="Add Limit Order"
            disabled={limitOrderTriggerPrice === null || insufficientAmount || errorMessage !== null}
            onClick={onAddLimitOrder}
        />
    </>
);
