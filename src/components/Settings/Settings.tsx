import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import useRPC from '@/hooks/useRPC';
import { addNotification, verifyRPCConnection } from '@/utils';

import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Switch from '../common/Switch/Switch';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function Settings({
  activeRPC,
  setActiveRPC,
  setCustomRPCUrl,
  customRPCUrl,
}: {
  activeRPC: string;
  setActiveRPC: (rpc: string) => void;
  setCustomRPCUrl: (rpc: string) => void;
  customRPCUrl: string;
}) {
  const [cookies, setCookies] = useCookies([
    'activeRPC',
    'isAutoRPC',
    'customRPC',
  ]);

  const [customRPC, setCustomRPC] = useState<string>(customRPCUrl ?? '');
  const [isAutoRPC, setIsAutoRPC] = useState<boolean>(
    cookies?.isAutoRPC === 'true',
  );

  const [isEditCustomRPCMode, setIsEditCustomRPCMode] =
    useState<boolean>(false);

  const [rpcOptions] = useRPC({
    customRPCUrl,
  });

  useEffect(() => {
    const activeRPCLatency = rpcOptions?.find(
      (rpcOption) => rpcOption.name === activeRPC,
    )?.latency;

    if (!activeRPCLatency) return;

    const isBetterRPCOption = rpcOptions?.some(
      (rpcOption) => rpcOption.latency && activeRPCLatency > rpcOption.latency,
    );

    if (isBetterRPCOption && isAutoRPC) {
      const betterOption = rpcOptions?.find(
        (rpcOption) =>
          rpcOption.latency && activeRPCLatency > rpcOption.latency,
      )?.name;

      if (!betterOption) return;

      handleRPCOption(betterOption);
    }
  }, [rpcOptions]);

  const handleRPCOption = (rpc: string) => {
    setActiveRPC(rpc);
    setCookies('activeRPC', rpc);
    setIsEditCustomRPCMode(false);
  };

  const saveCustomRPCUrl = async () => {
    const regExUrl = new RegExp(
      // eslint-disable-next-line no-useless-escape
      /^(http|https):\/\/[^ "]+$/,
    );

    if (customRPC !== '') {
      if (!regExUrl.test(customRPC)) {
        addNotification({
          title: 'Invalid URL',
          type: 'error',
          duration: 'fast',
          position: 'bottom-right',
        });
        return;
      }

      const isVerified = await verifyRPCConnection(customRPC);

      if (!isVerified) {
        addNotification({
          title: 'Invalid RPC endpoint',
          type: 'error',
          duration: 'fast',
          position: 'bottom-right',
        });
        return;
      }
    }

    setCustomRPCUrl(customRPC);
    setCookies('customRPC', customRPC);
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
          title="Settings"
          variant="outline"
          leftIconClassName="w-4 h-4"
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
        {rpcOptions?.map((rpcOption) => (
          <li
            className="flex flex-row justify-between items-center cursor-pointer opacity-100 hover:opacity-75 transition-opacity duration-300"
            onClick={() => {
              if (rpcOption.name === 'Custom RPC' && customRPCUrl === '')
                return;
              handleRPCOption(rpcOption.name);
              addNotification({
                title: 'RPC endpoint changed',
                duration: 'fast',
                position: 'bottom-right',
              });
            }}
            key={rpcOption.name}
          >
            <div className="flex flex-row gap-2 items-center">
              <input
                type="radio"
                checked={rpcOption.name === activeRPC}
                onChange={() => false}
              />
              <p className="text-sm font-medium">{rpcOption.name}</p>
            </div>
            {rpcOption.latency && (
              <div className="flex flex-row gap-1 items-center">
                <div
                  className={twMerge(
                    'w-[5px] h-[5px] rounded-full ',
                    (() => {
                      if (rpcOption.latency && rpcOption.latency < 100)
                        return 'bg-green';
                      if (rpcOption.latency && rpcOption.latency < 500)
                        return 'bg-orange';
                      return 'bg-red';
                    })(),
                  )}
                />
                <p className="text-xs opacity-50 font-mono">
                  {rpcOption.latency}ms
                </p>
              </div>
            )}
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
                value={!isEditCustomRPCMode ? customRPCUrl : customRPC}
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
                disabled={customRPC === customRPCUrl}
              />
            </div>
          </div>
        </li>
      </ul>
    </Menu>
  );
}
