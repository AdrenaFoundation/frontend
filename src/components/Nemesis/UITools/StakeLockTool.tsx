import { ToolInvocation } from 'ai';
import React, { memo, useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import { ADX_LOCK_PERIODS, ALP_LOCK_PERIODS } from '@/constant';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const StakeLock = ({
  toolInvocation,
  i,
  sep,
  addResult,
  token,
}: {
  addResult: (result: string) => void;
  toolInvocation: ToolInvocation;
  i: number;
  sep: boolean;
  token: 'ADX' | 'ALP';
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
            <p className="font-xs font-mono opacity-50">
              Choose one of the following days to lock your {token}:
            </p>
            <div className="flex flex-row gap-3 items-center w-full">
              {(token === 'ADX' ? ADX_LOCK_PERIODS : ALP_LOCK_PERIODS).map(
                (d) => (
                  <Button
                    key={d}
                    title={`${d}d`}
                    variant="secondary"
                    rounded={false}
                    className="flex-grow text-xs bg-third border border-white/10 hover:border-white/20 rounded-lg flex-1 font-mono"
                    onClick={() => addResult(String(d))}
                  />
                ),
              )}
            </div>
          </ToolWrapper>
        );
      case 'result':
        return <ToolWrapper>{toolInvocation.result} days</ToolWrapper>;
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

export default memo(StakeLock);
