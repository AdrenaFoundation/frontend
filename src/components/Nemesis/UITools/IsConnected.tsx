import { ToolInvocation } from 'ai';
import React, { memo, useMemo } from 'react';

import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const IsConnected = ({
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
      case 'result':
        return (
          <ToolWrapper>
            {toolInvocation.result === 'Yes' ? (
              <div className="flex flex-row items-center gap-2 justify-between w-full">
                <p className="font-mono text-green">Wallet Connected</p>
              </div>
            ) : (
              <WalletConnection disableSubtext={true} />
            )}
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

export default memo(IsConnected);
