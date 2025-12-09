import Tippy from '@tippyjs/react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import SelectOptions from '@/components/common/SelectOptions/SelectOptions';

export const SwapSlippageSection = ({
  swapSlippage,
  setSwapSlippage,
  className,
  titleClassName,
}: {
  swapSlippage: number;
  setSwapSlippage: (slippage: number) => void;
  className?: string;
  titleClassName?: string;
}) => {
  const percentages = [0.1, 0.2, 0.3, 0.5, 1];

  const { t } = useTranslation()

  return (
    <div className={twMerge('flex flex-col w-full', className)}>
      <Tippy
        content={
          <div className="flex flex-col gap-2">
            <span>{t('trade.swapSlippageHint')}</span>
          </div>
        }
      >
        <div className="flex flex-col w-full gap-2">
          <h5 className={twMerge(titleClassName)}>{t('trade.swapSlippage')}</h5>
          <SelectOptions
            selected={swapSlippage}
            options={percentages}
            onClick={setSwapSlippage}
          />
        </div>
      </Tippy>
    </div>
  );
};
