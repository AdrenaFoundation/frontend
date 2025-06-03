import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React, { ReactElement } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import { Token } from '@/types';

interface CollateralTooltipProps {
  token: Token;
  entryCollateralAmount: number;
  entryCollateralAmountNative: number;
  increaseCollateralAmount: number;
  increaseCollateralAmountNative: number;
  collateralAmount: number;
  collateralAmountNative: number;
  exitAmountNative: number;
  children: ReactElement;
}

const CollateralTooltip: React.FC<CollateralTooltipProps> = ({
  token,
  entryCollateralAmount,
  entryCollateralAmountNative,
  increaseCollateralAmount,
  increaseCollateralAmountNative,
  collateralAmount,
  collateralAmountNative,
  exitAmountNative,
  children,
}) => {
  const tokenImage = token.image;

  const content = (
    <div className="">
      <div>
        <div className="flex justify-between">
          <span>Entry Collateral:</span>
          <span className="ml-4 inline-block">
            <FormatNumber nb={entryCollateralAmount} format="currency" isDecimalDimmed={false} />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center gap-2 text-sm">
            <FormatNumber nb={entryCollateralAmountNative} isDecimalDimmed={false} precision={token.decimals} />
            <Image
              className="w-4 h-4 rounded-full"
              src={tokenImage}
              width={200}
              height={200}
              alt={`${token.symbol} logo`}
            />
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-whiteLabel/10 mt-2 mb-2" />

      <div>
        <div className="flex justify-between">
          <span>Increase / Remove Collateral:</span>
          <span className="ml-4 inline-block">
            <FormatNumber nb={increaseCollateralAmount} format="currency" isDecimalDimmed={false} />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center gap-2 text-sm">
            <FormatNumber nb={increaseCollateralAmountNative} isDecimalDimmed={false} precision={token.decimals} />
            <Image
              className="w-4 h-4 rounded-full"
              src={tokenImage}
              width={200}
              height={200}
              alt={`${token.symbol} logo`}
            />
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-whiteLabel/10 mt-2 mb-2" />

      <div>
        <div className="flex justify-between">
          <span>Total Collateral Amount:</span>
          <span className="ml-4 inline-block">
            <FormatNumber nb={collateralAmount} format="currency" isDecimalDimmed={false} />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center gap-2 text-sm">
            <FormatNumber nb={collateralAmountNative} isDecimalDimmed={false} precision={token.decimals} />
            <Image
              className="w-4 h-4 rounded-full"
              src={tokenImage}
              width={200}
              height={200}
              alt={`${token.symbol} logo`}
            />
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-whiteLabel/10 mt-2 mb-2" />

      <div>
        <div className="flex justify-between">
          <span>Exit Amount:</span>
          <div className="flex justify-end">
            <span className="ml-4 flex items-center gap-2 text-sm">
              <FormatNumber nb={exitAmountNative} isDecimalDimmed={false} precision={token.decimals} />
              <Image
                className="w-4 h-4 rounded-full"
                src={tokenImage}
                width={200}
                height={200}
                alt={`${token.symbol} logo`}
              />
            </span>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <Tippy content={content} placement="auto">
      {children}
    </Tippy>
  );
};

export default CollateralTooltip;
