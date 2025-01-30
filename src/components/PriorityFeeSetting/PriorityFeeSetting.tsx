import React from 'react';
import { twMerge } from 'tailwind-merge';

import { SOL_DECIMALS } from '@/constant';
import usePriorityFee from '@/hooks/usePriorityFees';
import { PriorityFeeOption } from '@/types';
import { DEFAULT_MAX_PRIORITY_FEE, formatNumber } from '@/utils';

import prioFeeSettingsIcon from '../../../public/images/Icons/fuel-pump-fill.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Modal from '../common/Modal/Modal';
import DisplayInfo from '../DisplayInfo/DisplayInfo';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function PriorityFeeSetting({
  priorityFeeOption,
  setPriorityFeeOption,
  maxPriorityFee,
  setMaxPriorityFee,
  setCloseMobileModal,
  isMobile = false,
}: {
  priorityFeeOption: PriorityFeeOption;
  setPriorityFeeOption: (priorityFee: PriorityFeeOption) => void;
  maxPriorityFee: number | null;
  setMaxPriorityFee: (maxPriorityFee: number | null) => void;
  setCloseMobileModal: (close: boolean) => void;
  isMobile?: boolean;
}) {
  const priorityFeeAmounts = usePriorityFee();

  const currentPriorityFeeValue =
    priorityFeeAmounts[priorityFeeOption] || priorityFeeAmounts.medium;

  const content = (
    <div className="flex flex-col mb-3">
      <h2 className="flex">Priority Fees</h2>

      <DisplayInfo
        className="mt-2 mb-2"
        body={
          <div>
            Speed up your transactions with Dynamic Priority Fees following the
            market rate.
          </div>
        }
      />

      <div className="flex gap-2 mt-2">
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
          <div className="flex w-1/3 flex-col items-center" key={title}>
            <Button
              onClick={() => {
                setPriorityFeeOption(title as PriorityFeeOption);
              }}
              variant={title === priorityFeeOption ? 'outline' : 'text'}
              className="w-20"
              title={title}
            />
          </div>
        ))}
      </div>

      <div
        className={twMerge(
          'flex items-center justify-center mt-2 border-t pt-2 text-txtfade text-xs',
        )}
      >
        Now @ {formatNumber(currentPriorityFeeValue, 0)} μLamport / CU
        <InfoAnnotation
          className="w-3 h-3"
          text={
            'The Medium/High/Ultra options are based on the 35th/50th/90th percentile of the current market rate. Accurate values are fetched right before each transaction.'
          }
        />
      </div>

      <div className="mt-2">
        <div className="w-full flex flex-col border p-2 bg-third">
          <div className="flex w-full">
            <div className="w-1/2 items-center justify-center flex text-xs font-boldy">
              TX Size
            </div>
            <div className="w-1/2 items-center justify-center flex text-xs font-boldy">
              Extra Fee
            </div>
          </div>

          <div className="flex flex-col w-full mt-1">
            <div className="flex w-full text-xs">
              <div className="w-1/2 items-center justify-center flex text-txtfade">
                Small (200,000 cu)
              </div>
              <div className="w-1/2 items-center justify-center flex text-txtfade">
                {formatNumber(
                  (200000 * currentPriorityFeeValue) / 1000000 / 1000000000,
                  SOL_DECIMALS,
                )}{' '}
                SOL
              </div>
            </div>

            <div className="flex w-full text-xs">
              <div className="w-1/2 items-center justify-center flex text-txtfade">
                Average (400,000 cu)
              </div>
              <div className="w-1/2 items-center justify-center flex text-txtfade">
                {formatNumber(
                  (400000 * currentPriorityFeeValue) / 1000000 / 1000000000,
                  SOL_DECIMALS,
                )}{' '}
                SOL
              </div>
            </div>

            <div className="flex w-full text-xs">
              <div className="w-1/2 items-center justify-center flex text-txtfade">
                Big (700,000 cu)
              </div>
              <div className="w-1/2 items-center justify-center flex text-txtfade">
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

      <div className="mt-4">
        <div
          className={twMerge(
            'flex items-center justify-center mt-2 border-t pt-2 text-txtfade text-xs',
          )}
        >
          Max Priority Fee per TX (SOL)
          <InfoAnnotation
            className="w-3 h-3"
            text={
              'Maximum amount of SOL to be spent on priority fees per transaction, this ensure you never go over your limit.'
            }
          />
        </div>

        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            name="maxPriorityFee"
            id="maxPriorityFee"
            className="focus:ring-primary focus:border-primary block w-full pl-2 pr-12 sm:text-sm border-gray-300 rounded-md bg-third"
            placeholder={DEFAULT_MAX_PRIORITY_FEE.toString()}
            step="0.000000001"
            min="0.000000001"
            value={maxPriorityFee ?? ''}
            onChange={(e) => setMaxPriorityFee(parseFloat(e.target.value))}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">
              Currency
            </label>
            <span className="text-gray-500 sm:text-sm mr-2">SOL</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Modal
        close={() => setCloseMobileModal(false)}
        className="flex flex-col w-full p-5 relative overflow-visible"
      >
        {content}
      </Modal>
    );
  }

  return (
    <Menu
      trigger={
        <Button
          variant={'lightbg'}
          leftIcon={prioFeeSettingsIcon}
          className={'w-7 h-7 p-0'}
          iconClassName="w-3 h-3 opacity-75 hover:opacity-100"
        />
      }
      openMenuClassName={twMerge(
        'rounded-lg w-[300px] bg-secondary border border-bcolor p-3 shadow-lg transition duration-300 right-0',
      )}
      disableOnClickInside={true}
      isDim={true}
    >
      {content}
    </Menu>
  );
}
