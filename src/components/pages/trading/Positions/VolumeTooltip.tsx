import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import React, { ReactElement } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';

interface VolumeTooltipProps {
  entrySize: number;
  increaseSize: number;
  exitSize: number;
  children: ReactElement;
}

const VolumeTooltip: React.FC<VolumeTooltipProps> = ({ entrySize, increaseSize, exitSize, children }) => {
  const content = (
    <div className="">
      <div className="flex justify-between">
        <span>Entry Size:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={entrySize} isDecimalDimmed={true} precisionIfPriceDecimalsBelow={12} format="currency" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Increase Size:</span>
        <span className="ml-4 inline-block text-mutagen">
          <FormatNumber nb={increaseSize} isDecimalDimmed={true} precisionIfPriceDecimalsBelow={12} format="currency" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Exit Size:</span>
        <span className="ml-4 inline-block text-mutagen">
          <FormatNumber nb={exitSize} isDecimalDimmed={true} precisionIfPriceDecimalsBelow={12} format="currency" />
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

export default VolumeTooltip;
