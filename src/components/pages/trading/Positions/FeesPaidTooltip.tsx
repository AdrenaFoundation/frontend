import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import React, { ReactElement } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';

interface FeesPaidTooltipProps {
  entryFees: number;
  decreaseExitFees: number;
  closeExitFees: number;
  decreaseBorrowFees: number;
  closeBorrowFees: number;
  children: ReactElement;
}

const FeesPaidTooltip: React.FC<FeesPaidTooltipProps> = ({ entryFees, decreaseExitFees, closeExitFees, decreaseBorrowFees, closeBorrowFees, children }) => {
  const content = (
    <div className="">
      <div className="flex justify-between">
        <span>Entry Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={entryFees} format="currency" />
        </span>
      </div>

      <div className="h-px w-full bg-whiteLabel/10 mt-2 mb-2" />

      <div className="flex justify-between">
        <span>Decrease Borrow Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={decreaseBorrowFees} format="currency" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Decrease Exit Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={decreaseExitFees} format="currency" />
        </span>
      </div>

      <div className="h-px w-full bg-whiteLabel/10 mt-2 mb-2" />

      <div className="flex justify-between">
        <span>Close Borrow Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={closeBorrowFees} format="currency" />
        </span>
      </div>

      <div className="flex justify-between">
        <span>Close Exit Fee:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={closeExitFees} format="currency" />
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
