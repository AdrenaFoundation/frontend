import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import SelectOptions from '@/components/common/SelectOptions/SelectOptions';
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
}: LimitOrderContentProps) => {

  const { t } = useTranslation()

  return (
    <>
      <h5 className="mt-4 flex">{t('trade.openPositionAfterReaching')}</h5>

      <div className="flex items-center border-l border-t border-r border-b-0 rounded-tl-lg rounded-tr-lg bg-inputcolor border border-white/20 pt-2 mt-2 grow text-sm w-full relative gap-[0.1em]">
        <div className="pl-4 mt-[0.2em] text-[1.4em]">
          {limitOrderTriggerPrice !== null ? '$' : null}
        </div>

        <InputNumber
          value={
            limitOrderTriggerPrice === null ? undefined : limitOrderTriggerPrice
          }
          placeholder={t('trade.limitOrderPlaceholder')}
          className="font-mono border-0 outline-none bg-transparent h-8"
          onChange={onTriggerPriceChange}
          inputFontSize="1.4em"
        />

        {limitOrderTriggerPrice !== null && (
          <div
            className="absolute right-4 cursor-pointer opacity-50 hover:text-white"
            onClick={() => onTriggerPriceChange(null)}
          >
            {t('trade.clear')}
          </div>
        )}
      </div>

      <div className="flex flex-row bg-inputcolor border border-white/20 border-t-0 rounded-bl-lg rounded-br-lg">
        {triggerPricePresets.map((percent, i) => (
          <Button
            key={i}
            title={`${side === 'long' ? '-' : '+'}${percent}%`}
            variant="secondary"
            rounded={false}
            className={twMerge(
              'flex-1 opacity-50 hover:opacity-100 flex-grow text-xs h-full font-bold bg-transparent',
              i === 0 ? 'rounded-bl-[0.7em]' : '',
              i === triggerPricePresets.length - 1
                ? 'rounded-br-[0.7em] border-r-0'
                : '',
              side === 'long' ? 'text-redbright' : 'text-green',
            )}
            onClick={() => {
              if (!tokenPriceBTrade) return;
              onTriggerPriceChange(
                calculateLimitOrderTriggerPrice({
                  tokenPriceBTrade,
                  tokenDecimals: tokenB.displayPriceDecimalsPrecision,
                  percent,
                  side,
                }),
              );
            }}
          />
        ))}
      </div>

      <div className="flex items-center mt-3 gap-1">
        <div className="text-xs relative bottom-[0.2em] opacity-50">
          {t('trade.triggerPriceMustBe')} {side === 'long' ? t('common.below') : t('common.above')}
        </div>

        <div
          className="flex relative bottom-[0.15em] cursor-pointer"
          onClick={() => {
            if (!tokenPriceBTrade) return;
            onTriggerPriceChange(tokenPriceBTrade);
          }}
        >
          <FormatNumber
            nb={tokenPriceBTrade}
            format="currency"
            className="text-xs"
            isDecimalDimmed={false}
          />
        </div>
      </div>

      <h5 className="mt-4 flex">{t('common.slippage')}</h5>

      <div
        className={`flex flex-row flex-wrap rounded-bl-lg rounded-br-lg h-7 gap-2 mt-3 mb-2`}
      >
        <SelectOptions
          selected={
            limitOrderSlippage === null ? t('trade.slippageNone') : `${limitOrderSlippage}%`
          }
          options={limitOrderSlippagePresets.map((slippage) =>
            slippage === null ? t('trade.slippageNone') : `${slippage}%`,
          )}
          onClick={(option) =>
            onSlippageChange(
              option === t('trade.slippageNone') ? null : Number(option.replace('%', '')),
            )
          }
        />
      </div>

      {side === 'short' && tokenA.symbol !== 'USDC' ? (
        <ErrorDisplay errorMessage={t('trade.onlyUsdcAllowed')} />
      ) : (
        errorMessage && <ErrorDisplay errorMessage={errorMessage} />
      )}

      <Button
        className={twMerge(
          'w-full justify-center mt-2 mb-1 sm:mb-2',
          side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
        )}
        size="lg"
        title={t('trade.addLimitOrder')}
        disabled={
          limitOrderTriggerPrice === null ||
          insufficientAmount ||
          errorMessage !== null
        }
        onClick={onAddLimitOrder}
      />
    </>
  )

};
