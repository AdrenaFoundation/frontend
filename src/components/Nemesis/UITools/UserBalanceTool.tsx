import { ToolInvocation } from 'ai';
import React, { memo, useMemo } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import { TOKEN_SYMBOL_IMG } from '@/constant';
import { useSelector } from '@/store/store';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const UserBalanceTool = ({
  toolInvocation,
  i,
  sep,
}: {
  toolInvocation: ToolInvocation;
  i: number;
  sep: boolean;
}) => {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const Content = useMemo(() => {
    switch (toolInvocation.state) {
      case 'partial-call':
        return (
          <ToolWrapper className="flex flex-col gap-2 items-start">
            <p className="font-mono text-orange">checking wallet balance...</p>
          </ToolWrapper>
        );
      case 'call':
        return (
          <ToolWrapper className="flex flex-col gap-2 items-start">
            <p className="font-mono text-orange">checking wallet balance...</p>
          </ToolWrapper>
        );
      case 'result':
        return (
          <ToolWrapper className="flex flex-col gap-3 items-start">
            <div>
              <p className="font-boldy opacity-50 mb-1">Wallet Balance</p>
              <FormatNumber
                nb={Object.keys(toolInvocation.result).reduce(
                  (acc, token) =>
                    acc +
                    Number(
                      (tokenPrices[token] ?? 1) * toolInvocation.result[token],
                    ),
                  0,
                )}
                format="currency"
                className="text-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {Object.keys(toolInvocation.result).map((token) => {
                if (!toolInvocation.result[token]) {
                  return null;
                }
                return (
                  <div
                    key={token}
                    className="flex flex-row items-center gap-2 bg-[#0D1925] border border-bcolor p-1 px-2 rounded-lg flex-1"
                  >
                    <img
                      src={TOKEN_SYMBOL_IMG[token]}
                      width={20}
                      height={20}
                      alt="token icon"
                    />

                    <div className="flex flex-col gap-0">
                      <FormatNumber
                        nb={toolInvocation.result[token]}
                        suffix={token}
                        className="text-base"
                      />

                      <FormatNumber
                        nb={Number(
                          (tokenPrices[token] ?? 1) *
                          toolInvocation.result[token],
                        )}
                        format="currency"
                        className="text-xs opacity-50"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ToolWrapper>
        );
      default:
        <></>;
    }
  }, [toolInvocation.state, tokenPrices['SOL']]);

  return (
    <ToolStepCounter toolInvocation={toolInvocation} i={i} sep={sep}>
      {Content}
    </ToolStepCounter>
  );
};

export default memo(UserBalanceTool);
