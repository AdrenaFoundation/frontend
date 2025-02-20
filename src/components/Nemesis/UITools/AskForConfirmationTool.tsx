import { ToolInvocation } from 'ai';
import React, { memo, useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';

import ToolStepCounter from './ToolStepCounter';
import ToolWrapper from './ToolWrapper';

const AskForConfirmationTool = ({
  toolInvocation,
  i,
  sep,
  addResult,
}: {
  toolInvocation: ToolInvocation;
  i: number;
  sep: boolean;
  addResult: (result: string) => void;
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
            <p className="font-mono text-xs opacity-50">
              {toolInvocation?.args?.message}
            </p>

            <div className="flex flex-row gap-3 mt-1 w-full">
              <Button
                variant="primary"
                title="Yes"
                className="w-full"
                onClick={() => addResult('Yes')}
              />
              <Button
                variant="outline"
                title="No"
                className="w-full border-bcolor"
                onClick={() => addResult('No')}
              />
            </div>
          </ToolWrapper>
        );
      case 'result':
        return <ToolWrapper>{toolInvocation.result}</ToolWrapper>;
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

export default memo(AskForConfirmationTool);
