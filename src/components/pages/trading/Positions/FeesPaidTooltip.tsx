import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import React, { ReactElement } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';

interface FeesPaidTooltipProps {
  entryFees: number;
  exitFees: number;
  borrowFees: number;
  children: ReactElement;
}

const FeesPaidTooltip: React.FC<FeesPaidTooltipProps> = ({ entryFees, exitFees, borrowFees, children }) => {
  const content = (
    <div className="">
      <div className="flex justify-between">
        <span>Entry Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={entryFees} format="currency" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Exit Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={exitFees} format="currency" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Borrow Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={borrowFees} format="currency" />
        </span>
      </div>
    </div>
  );

  return (
    <Tippy content={content} placement="auto">
      {children}
    </Tippy>
  );
};

export default FeesPaidTooltip;