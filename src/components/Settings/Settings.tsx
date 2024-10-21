import { Connection } from '@solana/web3.js';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { SOL_DECIMALS } from '@/constant';
import usePriorityFee from '@/hooks/usePriorityFees';
import { PriorityFeeOption as PriorityFeeOption } from '@/types';
import { addNotification, DEFAULT_MAX_PRIORITY_FEE, formatNumber } from '@/utils';

import settingsIcon from '../../../public/images/Icons/settings.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Switch from '../common/Switch/Switch';
import DisplayInfo from '../DisplayInfo/DisplayInfo';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function Settings({
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  priorityFeeOption,
  setPriorityFeeOption,
  maxPriorityFee,
  setMaxPriorityFee,
  isGenesis = false,
}: {
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  isIcon?: boolean;
  priorityFeeOption: PriorityFeeOption;
  setPriorityFeeOption: (priorityFee: PriorityFeeOption) => void;
  maxPriorityFee: number | null;
  setMaxPriorityFee: (maxPriorityFee: number | null) => void;
  isGenesis?: boolean;
}) {
  const [editCustomRpcUrl, setEditCustomRpcUrl] = useState<string | null>(
    customRpcUrl,
  );

  const priorityFeeAmounts = usePriorityFee();

  const currentPriorityFeeValue = priorityFeeAmounts[priorityFeeOption] || priorityFeeAmounts.medium;

  return (
    <Menu
      trigger={
        <Button
          variant={isGenesis ? 'text' : 'lightbg'}
          leftIcon={settingsIcon}
          className={'w-7 h-7 p-0'}
          iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
        />
      }
      openMenuClassName={twMerge(
        'rounded-lg w-[300px] bg-secondary border border-bcolor p-3 shadow-lg',
        isGenesis ? 'sm:right-0 right-[-175px]' : 'right-0',
      )}
      disableOnClickInside={true}
      isDim={true}
    >
      <div className="flex mb-3">
        {window.adrena.cluster === 'devnet' ? (
          <h2 className="text-blue-500 pr-1">Devnet</h2>
        ) : null}
        <h2 className="flex">RPC endpoints</h2>
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-1 items-center">
          <p className="font-medium">Automatic switch</p>
          <InfoAnnotation
            text={
              <p>
                Automatically selects the best RPC endpoint based on latency
              </p>
            }
            className="w-3"
          />
        </div>

        <Switch
          checked={autoRpcMode}
          onChange={() => {
            setAutoRpcMode(!autoRpcMode);

            addNotification({
              title: `Automatic switch ${autoRpcMode ? 'disabled' : 'enabled'}`,
              duration: 'fast',
            });
          }}
        />
      </div>

      <div className="w-full h-[1px] bg-bcolor my-3" />

      <div className="w-full flex mb-2">
        <div className="text-xs text-gray-500">Preferred</div>
        <div className="text-xs text-gray-500 ml-auto">Latency</div>
      </div>

      <ul
        className={twMerge(
          'flex flex-col gap-2 opacity-100 transition-opacity duration-300',
          autoRpcMode && 'opacity-30 pointer-events-none',
        )}
      >
        {[
          ...rpcInfos,
          {
            name: 'Custom RPC',
            latency: customRpcLatency,
          },
        ]?.map((rpc) => (
          <li className="flex flex-row flex-wrap" key={rpc.name}>
            <div
              className="w-full flex justify-between items-center cursor-pointer"
              onClick={() => {
                setFavoriteRpc(rpc.name);
              }}
            >
              <div className="flex flex-row gap-2 items-center">
                <div className="w-10 flex items-center justify-center">
                  <input
                    type="radio"
                    checked={rpc.name === favoriteRpc}
                    onChange={() => {
                      // Handle the click on the level above
                    }}
                    className="cursor-pointer"
                  />
                </div>

                <p
                  className={twMerge(
                    'text-sm font-medium opacity-50 transition-opacity duration-300 hover:opacity-100',
                    rpc.name === favoriteRpc && 'opacity-100',
                  )}
                >
                  {rpc.name}
                </p>

                {activeRpc.name === rpc.name ? (
                  <p className="opacity-50">active</p>
                ) : null}
              </div>

              {rpc.latency !== null ? (
                <div className="flex flex-row gap-1 items-center">
                  <div
                    className={twMerge(
                      'w-[5px] h-[5px] rounded-full',
                      (() => {
                        if (rpc.latency && rpc.latency < 100) return 'bg-green';
                        if (rpc.latency && rpc.latency < 500)
                          return 'bg-orange';
                        return 'bg-red';
                      })(),
                    )}
                  />
                  <p className="text-xs opacity-50 font-mono">
                    {rpc.latency}ms
                  </p>
                </div>
              ) : (
                <div className="text-gray-600 mr-4 text-sm">-</div>
              )}
            </div>

            {rpc.name === 'Custom RPC' ? (
              <div className="flex flex-row gap-2 items-center w-full mt-2">
                <div
                  className={twMerge(
                    'relative w-full  bg-black border border-bcolor rounded-lg overflow-hidden transition duration-300',
                  )}
                >
                  <input
                    type="text"
                    value={editCustomRpcUrl ?? ''}
                    onChange={(e) => {
                      setEditCustomRpcUrl(e.target.value);
                    }}
                    className={twMerge(
                      'w-full h-[40px] p-1 px-3 max-w-[195px] text-ellipsis text-sm bg-black transition duration-300',
                    )}
                    placeholder="Custom RPC URL"
                  />

                  <Button
                    title="Save"
                    disabled={customRpcUrl === editCustomRpcUrl}
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setCustomRpcUrl(editCustomRpcUrl);
                    }}
                    className={twMerge(
                      'text-xs absolute right-2 top-[8px] p-1 px-2 rounded-md',
                    )}
                  />
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className='h-[1px] w-full bg-bcolor mt-4 mb-4' />

      <div className="flex flex-col mb-3">
        <h2 className="flex">Priority Fees</h2>

        <DisplayInfo className='mt-2 mb-2' body={<div>Speed up your transactions with Dynamic Priority Fees following the market rate.</div>} />

        <div className='flex gap-2 mt-2'>
          {[
            { title: 'medium', microLamport: priorityFeeAmounts.medium },
            { title: 'high', microLamport: priorityFeeAmounts.high },
            { title: 'ultra', microLamport: priorityFeeAmounts.ultra },
          ].map(({ title, microLamport }) => (

            <div className='flex w-1/3 flex-col items-center' key={microLamport}>
              <Button
                onClick={() => {
                  setPriorityFeeOption(title as PriorityFeeOption);
                }}
                variant={title === priorityFeeOption ? 'outline' : 'text'}
                className='w-20'
                title={title}
                key={title}
              />
            </div>
          ))}
        </div>

        <div className={twMerge('flex items-center justify-center mt-2 border-t pt-2 text-txtfade text-xs')}>
          Now @ {formatNumber(currentPriorityFeeValue, 0)} μLamport / CU
          <InfoAnnotation className="w-3 h-3" text={"The Medium/High/Ultra options are based on the 55th/75th/90th percentile of the current market rate.Accurate values are fetched right before each transaction."} />
        </div>

        <div className='mt-2'>
          <div className='w-full flex flex-col border p-2 bg-third'>
            <div className='flex w-full'>
              <div className='w-1/2 items-center justify-center flex text-xs font-boldy'>TX Size</div>
              <div className='w-1/2 items-center justify-center flex text-xs font-boldy'>Extra Fee</div>
            </div>

            <div className='flex flex-col w-full mt-1'>
              <div className='flex w-full text-xs'>
                <div className='w-1/2 items-center justify-center flex text-txtfade'>Small (200,000 cu)</div>
                <div className='w-1/2 items-center justify-center flex text-txtfade'>{formatNumber(200000 * currentPriorityFeeValue / 1000000 / 1000000000, SOL_DECIMALS)} SOL</div>
              </div>

              <div className='flex w-full text-xs'>
                <div className='w-1/2 items-center justify-center flex text-txtfade'>Average (400,000 cu)</div>
                <div className='w-1/2 items-center justify-center flex text-txtfade'>{formatNumber(400000 * currentPriorityFeeValue / 1000000 / 1000000000, SOL_DECIMALS)} SOL</div>
              </div>

              <div className='flex w-full text-xs'>
                <div className='w-1/2 items-center justify-center flex text-txtfade'>Big (700,000 cu)</div>
                <div className='w-1/2 items-center justify-center flex text-txtfade'>{formatNumber(700000 * currentPriorityFeeValue / 1000000 / 1000000000, SOL_DECIMALS)} SOL</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className={twMerge('flex items-center justify-center mt-2 border-t pt-2 text-txtfade text-xs')}>
            Max Priority Fee per TX (SOL)
            <InfoAnnotation className="w-3 h-3" text={"Maximum amount of SOL to be spent on priority fees per transaction, this ensure you never go over your limit."} />
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
              <label htmlFor="currency" className="sr-only">Currency</label>
              <span className="text-gray-500 sm:text-sm mr-2">
                SOL
              </span>
            </div>
          </div>
        </div>

      </div>
    </Menu>
  );
}
