import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useRpc from '@/hooks/useRPC';
import {
  addNotification,
  verifyIfValidUrl,
  verifyRpcConnection,
} from '@/utils';

import settingsIcon from '../../../public/images/Icons/settings.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Switch from '../common/Switch/Switch';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function Settings({
  activeRpc,
  setActiveRpc,
  setCustomRpcUrl,
  customRpcUrl,
}: {
  activeRpc: string;
  setActiveRpc: (rpc: string) => void;
  setCustomRpcUrl: (rpc: string | null) => void;
  customRpcUrl: string | null;
}) {
  const [cookies, setCookies] = useCookies([
    'activeRpc',
    'isAutoRPC',
    'customRpc',
  ]);
  const isBigScreen = useBetterMediaQuery('(min-width: 500px)');

  const [customRpc, setCustomRPC] = useState<string>(customRpcUrl ?? '');
  const [isAutoRPC, setIsAutoRPC] = useState<boolean>(
    cookies?.isAutoRPC === 'true',
  );

  const [isEditCustomRPCMode, setIsEditCustomRPCMode] =
    useState<boolean>(false);

  const [rpcOptions] = useRpc({
    customRpcUrl,
  });

  useEffect(() => {
    if (!isAutoRPC) return;
    const activeRpcLatency = rpcOptions?.find(
      (rpcOption) => rpcOption.name === activeRpc,
    );

    if (!activeRpcLatency) return;

    const bestRpc = rpcOptions?.reduce((acc, curr) => {
      return curr.latency &&
        acc.latency &&
        curr.latency < acc.latency &&
        curr.latency - acc.latency >= 100
        ? curr
        : acc;
    });

    if (bestRpc?.name === activeRpc || !bestRpc) return;

    handleRPCOption(bestRpc.name);
  }, [isAutoRPC, rpcOptions]);

  const handleRPCOption = (rpc: string) => {
    if (rpc === 'Custom RPC' && customRpcUrl === null) return;
    setActiveRpc(rpc);
    setCookies('activeRpc', rpc);
    setIsEditCustomRPCMode(false);
  };

  const saveCustomRPCUrl = async () => {
    if (customRpc === '') {
      setCustomRpcUrl(null);
      setCookies('customRpc', null);
      setIsEditCustomRPCMode(false);
      return;
    }

    if (!verifyIfValidUrl(customRpc)) {
      addNotification({
        title: 'Invalid URL',
        type: 'error',
        duration: 'fast',
        position: 'bottom-right',
      });
      return;
    }

    const isVerified = await verifyRpcConnection(customRpc);

    if (!isVerified) {
      addNotification({
        title: 'Invalid RPC endpoint',
        type: 'error',
        duration: 'fast',
        position: 'bottom-right',
      });
      return;
    }

    setCustomRpcUrl(customRpc);
    setCookies('customRpc', customRpc);
    setIsEditCustomRPCMode(false);

    addNotification({
      title: 'Custom RPC endpoint saved',
      duration: 'fast',
      position: 'bottom-right',
    });
  };

  return (
    <Menu
      trigger={
        <Button
          title={isBigScreen ? 'Settings' : null}
          variant="outline"
          leftIcon={isBigScreen ? null : settingsIcon}
          className={isBigScreen ? '' : 'w-6 h-6 p-0'}
          iconClassName="w-4 h-4"
        />
      }
      openMenuClassName="right-0 rounded-lg w-[300px] bg-secondary border border-bcolor p-3 shadow-lg"
      disableOnClickInside={true}
      isDim={true}
    >
      <h2 className="mb-3">RPC endpoints</h2>

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
          checked={isAutoRPC}
          onChange={() => {
            setIsAutoRPC(!isAutoRPC);
            setCookies('isAutoRPC', !isAutoRPC);
            addNotification({
              title: `Automatic switch ${isAutoRPC ? 'disabled' : 'enabled'}`,
              duration: 'fast',
              position: 'bottom-right',
            });
          }}
        />
      </div>

      <div className="w-full h-[1px] bg-bcolor my-3" />

      <ul
        className={twMerge(
          'flex flex-col gap-2 opacity-100 transition-opacity duration-300',
          isAutoRPC && 'opacity-30 pointer-events-none',
        )}
      >
        {rpcOptions?.map((rpc) => (
          <li
            className="flex flex-row justify-between items-center cursor-pointer"
            onClick={() => {
              if (rpc.name === 'Custom RPC' && customRpcUrl === null) return;
              handleRPCOption(rpc.name);
              addNotification({
                title: 'RPC endpoint changed',
                duration: 'fast',
                position: 'bottom-right',
              });
            }}
            key={rpc.name}
          >
            <div className="flex flex-row gap-2 items-center">
              <input
                type="radio"
                checked={rpc.name === activeRpc}
                onChange={() => false}
              />
              <p
                className={twMerge(
                  'text-sm font-medium opacity-50 hover:opacity-100 transition-opacity duration-300',
                  rpc.name === activeRpc && 'opacity-100',
                )}
              >
                {rpc.name}
              </p>
            </div>
            {rpc.latency !== null ? (
              <div className="flex flex-row gap-1 items-center">
                <div
                  className={twMerge(
                    'w-[5px] h-[5px] rounded-full ',
                    (() => {
                      if (rpc.latency && rpc.latency < 100) return 'bg-green';
                      if (rpc.latency && rpc.latency < 500) return 'bg-orange';
                      return 'bg-red';
                    })(),
                  )}
                />
                <p className="text-xs opacity-50 font-mono">{rpc.latency}ms</p>
              </div>
            ) : null}
          </li>
        ))}
        <li className="flex flex-row justify-between items-center cursor-pointer">
          <div className="flex flex-row gap-2 items-center w-full">
            <div
              className={twMerge(
                'relative w-full  bg-black border border-bcolor rounded-lg overflow-hidden transition duration-300',
                !isEditCustomRPCMode &&
                  'bg-transparent font-regular font-medium',
              )}
            >
              <input
                type="text"
                value={!isEditCustomRPCMode ? customRpcUrl ?? '' : customRpc}
                onChange={(e) => {
                  setCustomRPC(e.target.value);
                  setIsEditCustomRPCMode(true);
                }}
                className={twMerge(
                  'w-full h-[40px] p-1 px-3 max-w-[195px] text-ellipsis text-sm bg-black transition duration-300',
                  !isEditCustomRPCMode && 'bg-transparent',
                )}
                placeholder="Custom RPC URLs"
              />
              <Button
                title="Save"
                size="sm"
                variant="primary"
                onClick={saveCustomRPCUrl}
                className={twMerge(
                  'text-xs absolute right-2 top-[8px] p-1 px-2 rounded-md',
                  !isEditCustomRPCMode && 'opacity-100',
                )}
                disabled={customRpc === customRpcUrl}
              />
            </div>
          </div>
        </li>
      </ul>
    </Menu>
  );
}
