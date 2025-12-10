import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import { setSettings } from '@/actions/settingsActions';
import { SOL_DECIMALS } from '@/constant';
import usePriorityFee from '@/hooks/usePriorityFees';
import { useDispatch, useSelector } from '@/store/store';
import { PriorityFeeOption } from '@/types';
import { DEFAULT_MAX_PRIORITY_FEE, formatNumber } from '@/utils';

import prioFeeSettingsIcon from '../../../public/images/Icons/fuel-pump-fill.svg';
import Menu from '../common/Menu/Menu';
import Modal from '../common/Modal/Modal';
import { Radio } from '../pages/monitoring/FilterSidebar/FilterSidebar';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function PriorityFeeSetting({
  setCloseMobileModal,
  isMobile = false,
  isOpen,
  setIsOpen,
}: {
  setCloseMobileModal?: (close: boolean) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const priorityFeeAmounts = usePriorityFee();

  const maxPriorityFee = useSelector((state) => state.settings.maxPriorityFee);
  const priorityFeeOption = useSelector(
    (state) => state.settings.priorityFeeOption,
  );

  const currentPriorityFeeValue =
    priorityFeeAmounts[priorityFeeOption] || priorityFeeAmounts.medium;

  const content = (
    <div className="flex flex-col">
      <h4 className="font-semibold">{t('footer.priorityFees')}</h4>

      <p className="opacity-50 text-sm mt-0">
        {t('footer.speedUpTransactions')}
      </p>

      <div className="flex gap-2 w-full mt-4">
        {[
          {
            title: 'medium',
          },
          {
            title: 'high',
          },
          {
            title: 'ultra',
          },
        ].map(({ title }) => (
          <Radio
            label={t(`footer.${title}`)}
            checked={priorityFeeOption === title}
            className="w-full"
            onClick={() => {
              dispatch(
                setSettings({
                  priorityFeeOption: title as PriorityFeeOption,
                }),
              );
            }}
            key={title}
          />
        ))}
      </div>

      <div
        className={twMerge(
          'flex gap-1 items-center mt-6 font-semibold text-xs',
        )}
      >
        <InfoAnnotation
          className="w-3 h-3 ml-0"
          text={t('footer.priorityFeeOptionsExplanation')}
        />
        {t('footer.nowAt', { value: formatNumber(currentPriorityFeeValue, 0) })}
      </div>

      <div className="mt-2">
        <div className="w-full flex flex-col border items-center justify-center p-2 bg-third rounded-md">
          <div className="flex w-full">
            <div className="w-1/2 items-center flex text-xs font-semibold">
              TX Size
            </div>
            <div className="w-1/2 items-center flex text-xs font-semibold">
              {t('footer.extraFee')}
            </div>
          </div>

          <div className="flex flex-col w-full mt-1">
            <div className="flex w-full text-xs">
              <div className="w-1/2 items-center flex opacity-50">
                Small (200,000 cu)
              </div>
              <div className="w-1/2 items-center flex opacity-50">
                {formatNumber(
                  (200000 * currentPriorityFeeValue) / 1000000 / 1000000000,
                  SOL_DECIMALS,
                )}{' '}
                SOL
              </div>
            </div>

            <div className="flex w-full text-xs">
              <div className="w-1/2 items-center flex opacity-50">
                Average (400,000 cu)
              </div>
              <div className="w-1/2 items-center flex opacity-50">
                {formatNumber(
                  (400000 * currentPriorityFeeValue) / 1000000 / 1000000000,
                  SOL_DECIMALS,
                )}{' '}
                SOL
              </div>
            </div>

            <div className="flex w-full text-xs">
              <div className="w-1/2 items-center flex opacity-50">
                Big (700,000 cu)
              </div>
              <div className="w-1/2 items-center flex opacity-50">
                {formatNumber(
                  (700000 * currentPriorityFeeValue) / 1000000 / 1000000000,
                  SOL_DECIMALS,
                )}{' '}
                SOL
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div
          className={twMerge(
            'flex items-center gap-1 mb-1 text-xs font-semibold',
          )}
        >
          <InfoAnnotation
            className="w-3 h-3 ml-0"
            text={t('footer.maxPriorityFeeExplanation')}
          />
          {t('footer.maxPriorityFeePerTx')}
        </div>

        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            name="maxPriorityFee"
            id="maxPriorityFee"
            className="font-mono block w-full p-3 pr-12 sm:text-sm border border-white/20 rounded-md bg-inputcolor"
            placeholder={DEFAULT_MAX_PRIORITY_FEE.toString()}
            step="0.000000001"
            min="0.000000001"
            value={maxPriorityFee ?? ''}
            onChange={(e) => {
              dispatch(
                setSettings({
                  maxPriorityFee: parseFloat(e.target.value),
                }),
              );
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">
              Currency
            </label>
            <span className="opacity-50 sm:text-sm mr-3 font-semibold">SOL</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Modal
        close={() => setCloseMobileModal?.(false)}
        className="flex flex-col w-full p-5 relative overflow-visible"
      >
        {content}
      </Modal>
    );
  }

  return (
    <Menu
      trigger={
        <div className="p-1.5 px-2 hover:bg-third transition-colors cursor-pointer">
          <Image
            src={prioFeeSettingsIcon}
            alt={t('footer.priorityFeeSettings')}
            width={0}
            height={0}
            style={{ width: '12px', height: '12px' }}
            className="w-3 h-3"
          />
        </div>
      }
      className="border-r border-[#414E5E]"
      openMenuClassName={twMerge(
        'rounded-md w-[18.75rem] bg-secondary border border-bcolor p-3 shadow-lg transition duration-300 right-0',
      )}
      disableOnClickInside={true}
      isDim={true}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      bgClassName="fixed"
    >
      {content}
    </Menu>
  );
}
