import { ToolInvocation } from 'ai';
import Image from 'next/image';
import React, { memo, useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import { TOKEN_SYMBOL_IMG } from '@/constant';
import useUserVest from '@/hooks/useUserVest';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const ClaimADXConfirmationTool = ({
  toolInvocation,
  addResult,
  i,
  sep,
  vestAmounts,
}: {
  toolInvocation: ToolInvocation;
  addResult: (result: string) => void;
  i: number;
  sep: boolean;
  vestAmounts: ReturnType<typeof useUserVest>['vestAmounts'];
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
            <div className="flex flex-row justify-between w-full p-3 rounded-lg border border-bcolor mb-3">
              <div className="text-center">
                <p className="text-xs font-boldy opacity-50">Vested</p>
                <FormatNumber
                  nb={vestAmounts.amount}
                  suffix="ADX"
                  className="text-base"
                  isDecimalDimmed={false}
                  isAbbreviate
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-boldy opacity-50">Claimed</p>
                <FormatNumber
                  nb={vestAmounts.claimedAmount}
                  suffix="ADX"
                  className="text-base"
                  isDecimalDimmed={false}
                  isAbbreviate
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-boldy opacity-50">Claimable</p>
                <FormatNumber
                  nb={vestAmounts.claimableAmount}
                  suffix="ADX"
                  className="text-base"
                  isDecimalDimmed={false}
                  isAbbreviate
                />
              </div>
            </div>

            <p className="font-mono text-xs opacity-50">
              {toolInvocation?.args?.message}
            </p>
            <div className="flex flex-row gap-2 items-center">
              <Image
                src={TOKEN_SYMBOL_IMG['ADX']}
                width={16}
                height={16}
                alt="ADX icon"
              />
              <FormatNumber
                nb={vestAmounts.claimableAmount}
                suffix="ADX"
                className="text-lg"
              />
            </div>

            <div className="flex flex-row gap-3 mt-1 w-full">
              <Button
                variant="primary"
                title="Claim"
                className="w-full"
                onClick={() => addResult('Yes')}
              />
              <Button
                variant="outline"
                title="Abort"
                className="w-full border-bcolor"
                onClick={() => addResult('No')}
              />
            </div>
          </ToolWrapper>
        );
      case 'result':
        return (
          <ToolWrapper className="flex flex-col gap-2 items-start">
            <p className="font-mono text-xs opacity-50">
              {toolInvocation?.args?.message}
            </p>
            {toolInvocation.result}
          </ToolWrapper>
        );
      default:
        <></>;
    }
  }, [toolInvocation.state, vestAmounts.claimableAmount]);

  return (
    <ToolStepCounter toolInvocation={toolInvocation} i={i} sep={sep}>
      {Content}
    </ToolStepCounter>
  );
};

export default memo(ClaimADXConfirmationTool);
