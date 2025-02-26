import { ToolInvocation } from 'ai';
import Image from 'next/image';
import React, { memo, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';
import {
  formatNumber,
  getAbbrevWalletAddress,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const PositionsListTool = ({
  toolInvocation,
  i,
  sep,
}: {
  toolInvocation: ToolInvocation;
  i: number;
  sep: boolean;
}) => {
  const Content = useMemo(() => {
    switch (toolInvocation.state) {
      case 'partial-call':
        return (
          <ToolWrapper className="flex flex-row gap-2">
            <p className="font-mono text-orange">loading...</p>
            <Loader width={40} />
          </ToolWrapper>
        );
      case 'call':
        return (
          <ToolWrapper className="flex flex-col gap-2 items-start">
            <p className="font-mono text-orange">calling...</p>
          </ToolWrapper>
        );
      case 'result':
        return (
          <ToolWrapper className="flex-col items-start">
            <p className="font-boldy mb-2">{toolInvocation.result.length > 0 ? 'Active positions' : 'No active position'}</p>
            {toolInvocation.result.map((position: PositionExtended) => {
              return (
                // TODO: fix typing 
                <div className="border w-full rounded-lg bg-[#0D1925]" key={position.pubkey as unknown as string}>
                  <div className="flex flex-row justify-between p-2 border-b">
                    <div className="flex flex-row gap-2 items-center">
                      <Image
                        src={getTokenImage(position.token)}
                        width={20}
                        height={20}
                        alt="token icon"
                      />
                      <div>
                        <div className="flex flex-row gap-2 items-center">
                          <p className="text-base font-boldy">
                            {getTokenSymbol(position.token.symbol)}
                          </p>
                          <p
                            className={`text-xs m-auto p-0.1 px-1 capitalize font-mono rounded-md ${position.side === 'long'
                              ? 'text-green bg-green/20'
                              : 'text-red bg-red/20'
                              }`}
                          >
                            {position.side}{' '}
                            {formatNumber(
                              Number(position.sizeUsd / position.collateralUsd),
                              2,
                            )}
                            x
                          </p>
                        </div>
                        <p className="text-xs opacity-50">
                          {new Date(
                            Number(position.nativeObject.openTime) * 1000,
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            minute: 'numeric',
                            hour: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-right opacity-50 font-boldy text-xs">PnL w/fees</p>

                      <FormatNumber
                        nb={position.pnl}
                        format="currency"
                        className={twMerge(
                          'text-right w-full',
                          Number(position.pnl) > 0
                            ? 'text-green'
                            : 'text-red',
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row justify-between p-2 items-center">
                    <p className="text-xs opacity-50 font-mono">
                      {getAbbrevWalletAddress(
                        position.pubkey as unknown as string,
                      )}
                    </p>
                    <p className="bg-[#0A1119] px-2 rounded-md border border-[#1D2A37] opacity-50 cursor-pointer hover:opacity-100 transition duration-300 text-xs">
                      View details
                    </p>
                  </div>
                </div>
              );
            })}
          </ToolWrapper>
        );
      default:
        <></>;
    }
  }, [toolInvocation.state]);

  return (
    <ToolStepCounter toolInvocation={toolInvocation} i={i} sep={sep}>
      {Content}
    </ToolStepCounter>
  );
};

export default memo(PositionsListTool);
