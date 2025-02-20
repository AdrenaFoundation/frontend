import { ToolInvocation } from 'ai';
import React, { memo, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const DefaultTools = ({
  toolInvocation,
  i,
  sep,
}: {
  toolInvocation: ToolInvocation;
  i: number;
  sep: boolean;
}) => {
  console.log('toolInvocation', toolInvocation.toolName);

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
          <ToolWrapper>
            <p className="font-mono text-orange">
              Calling {toolInvocation.toolName}...
            </p>
          </ToolWrapper>
        );
      case 'result':
        return (
          <ToolWrapper>
            {typeof toolInvocation.result === 'object' ? (
              JSON.stringify(toolInvocation.result)
            ) : (
              <p
                className={twMerge(
                  'font-mono',
                  toolInvocation.result.includes('Failed Error')
                    ? 'text-red'
                    : 'text-green',
                )}
              >
                {toolInvocation.result}
              </p>
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

export default memo(DefaultTools);
