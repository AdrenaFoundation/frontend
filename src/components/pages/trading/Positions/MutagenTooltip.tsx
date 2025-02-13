import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import React, { ReactElement } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';

interface MutagenTooltipProps {
  pointsPnlVolumeRatio: number;
  pointsDuration: number;
  closeSizeMultiplier: number;
  pointsMutations: number;
  children: ReactElement;
}

const MutagenTooltip: React.FC<MutagenTooltipProps> = ({ pointsPnlVolumeRatio, pointsDuration, closeSizeMultiplier, pointsMutations, children }) => {
  const content = (
    <div className="">
      <div className="flex justify-between">
        <span>Trading performance:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={pointsPnlVolumeRatio} isDecimalDimmed={false} precisionIfPriceDecimalsBelow={12} className="text-mutagen" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Duration:</span>
        <span className="ml-4 inline-block text-mutagen">
          <FormatNumber nb={pointsDuration} isDecimalDimmed={false} precisionIfPriceDecimalsBelow={12} className="text-mutagen" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Mutations:</span>
        <span className="ml-4 inline-block text-mutagen">
          <FormatNumber nb={pointsMutations} isDecimalDimmed={false} precisionIfPriceDecimalsBelow={12} className="text-mutagen" />
        </span>
      </div>
      <div className="flex justify-between">
        <span>Size multiplier:</span>
        <span className="ml-4 inline-block">
          <FormatNumber nb={closeSizeMultiplier} suffix="x" isDecimalDimmed={false} precisionIfPriceDecimalsBelow={12} />
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

export default MutagenTooltip;
