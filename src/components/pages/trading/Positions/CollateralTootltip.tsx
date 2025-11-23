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
  decreaseCollateralAmount: number;
  decreaseCollateralAmountNative: number;
  closeCollateralAmount: number;
  closeCollateralAmountNative: number;
  exitAmountNative: number;
  children: ReactElement;
}

const CollateralTooltip: React.FC<CollateralTooltipProps> = ({
  token,
  entryCollateralAmount,
  entryCollateralAmountNative,
  increaseCollateralAmount,
  increaseCollateralAmountNative,
  decreaseCollateralAmount,
  decreaseCollateralAmountNative,
  closeCollateralAmount,
  closeCollateralAmountNative,
  exitAmountNative,
  children,
}) => {
  const tokenImage = token.image;

  const content = (
    <div className="">
      <div>
        <div className="flex justify-between items-center">
          <span>Entry Collateral:</span>
          <span className="ml-4 inline-block">
            <FormatNumber
              nb={entryCollateralAmount}
              format="currency"
              isDecimalDimmed={false}
              className="text-xs"
            />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center text-sm">
            <FormatNumber
              nb={entryCollateralAmountNative}
              isDecimalDimmed={false}
              precision={token.displayAmountDecimalsPrecision}
              className="text-xs"
            />
            <span className="text-xs text-txtfade mt-0.5 ml-1">
              {token.symbol}
            </span>
            <Image
              className="w-4 h-4 rounded-full ml-1"
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
        <div className="flex justify-between items-center">
          <span>Increase / Remove Collateral:</span>
          <span className="ml-4 inline-block">
            <FormatNumber
              nb={increaseCollateralAmount}
              format="currency"
              isDecimalDimmed={false}
              className="text-xs"
            />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center text-sm">
            <FormatNumber
              nb={increaseCollateralAmountNative}
              isDecimalDimmed={false}
              precision={token.displayAmountDecimalsPrecision}
              className="text-xs"
            />
            <span className="text-xs text-txtfade mt-0.5 ml-1">
              {token.symbol}
            </span>
            <Image
              className="w-4 h-4 rounded-full ml-1"
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
        <div className="flex justify-between items-center">
          <span>Decrease Collateral:</span>
          <span className="ml-4 inline-block">
            <FormatNumber
              nb={decreaseCollateralAmount}
              format="currency"
              isDecimalDimmed={false}
              className="text-xs"
            />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center text-sm">
            <FormatNumber
              nb={decreaseCollateralAmountNative}
              isDecimalDimmed={false}
              precision={token.displayAmountDecimalsPrecision}
              className="text-xs"
            />
            <span className="text-xs text-txtfade mt-0.5 ml-1">
              {token.symbol}
            </span>
            <Image
              className="w-4 h-4 rounded-full ml-1"
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
        <div className="flex justify-between items-center">
          <span>Close Collateral:</span>
          <span className="ml-4 inline-block">
            <FormatNumber
              nb={closeCollateralAmount}
              format="currency"
              isDecimalDimmed={false}
              className="text-xs"
            />
          </span>
        </div>
        <div className="flex justify-end">
          <span className="ml-4 flex items-center text-sm">
            <FormatNumber
              nb={closeCollateralAmountNative}
              isDecimalDimmed={false}
              precision={token.displayAmountDecimalsPrecision}
              className="text-xs"
            />
            <span className="text-xs text-txtfade mt-0.5 ml-1">
              {token.symbol}
            </span>
            <Image
              className="w-4 h-4 rounded-full ml-1"
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
        <div className="flex justify-between items-center">
          <span>Total Exit Amount:</span>
          <div className="flex justify-end">
            <span className="ml-4 flex items-center text-sm">
              <FormatNumber
                nb={exitAmountNative}
                isDecimalDimmed={false}
                precision={token.displayAmountDecimalsPrecision}
                className="text-xs"
              />
              <span className="text-xs text-txtfade mt-0.5 ml-1">
                {token.symbol}
              </span>
              <Image
                className="w-4 h-4 rounded-full ml-1"
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
