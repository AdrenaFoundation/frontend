import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplain from '@/components/common/TextExplain/TextExplain';
import FormatNumber from '@/components/Number/FormatNumber';
import { RATE_DECIMALS } from '@/constant';
import { PositionExtended, Token } from '@/types';

import InfoAnnotation from '../../monitoring/InfoAnnotation';

export default function PositionInfos({
  positionInfos,
  tokenB,
  openedPosition,
  isInfoLoading,
}: {
  positionInfos: {
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    openPositionFeeUsd: number;
    totalOpenPositionFeeUsd: number;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
  } | null;
  tokenB: Token;
  openedPosition: PositionExtended | null;
  isInfoLoading: boolean;
}) {
  const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;
  const [feesNbChar, setFeesNbChar] = useState<number | null>(null);

  useEffect(() => {
    let nb =
      typeof positionInfos?.totalOpenPositionFeeUsd !== 'undefined' &&
      typeof positionInfos?.exitFeeUsd !== 'undefined'
        ? (
            positionInfos.totalOpenPositionFeeUsd + positionInfos.exitFeeUsd
          ).toString().length + 1
        : 0;

    // The + sign between new fees and borrow fees
    nb += 1;

    nb += '%/hr'.length;

    if (openedPosition) {
      nb +=
        (
          openedPosition.entryFeeUsd +
          openedPosition.exitFeeUsd +
          (openedPosition.borrowFeeUsd ?? 0)
        ).toString().length + 1;

      // The + sign
      nb += 1;
    }

    console.log('NB CHAR', nb);

    setFeesNbChar(nb);
  }, [openedPosition, positionInfos]);

  //  {positionInfos ? (
  return (
    <>
      <h5 className="flex items-center ml-4 mt-3 mb-2">Position in and out</h5>

      <StyledSubSubContainer
        className={twMerge('flex-col p-2 h-[5em] items-center justify-center')}
      >
        {positionInfos && !isInfoLoading ? (
          <div className="flex w-full justify-evenly">
            <div className="flex relative items-center">
              <TextExplain title="Entry Price" className="top-[0.2em]" />

              <div className="flex flex-col">
                <FormatNumber
                  nb={positionInfos.entryPrice}
                  format="currency"
                  className="pt-8 text-lg"
                />

                {openedPosition ? (
                  <FormatNumber
                    nb={openedPosition.price}
                    format="currency"
                    className="text-txtfade text-xs self-center line-through"
                    isDecimalDimmed={false}
                  />
                ) : null}
              </div>
            </div>

            <div className="h-full w-[1px] bg-gray-800" />

            <div className="flex relative items-center">
              <TextExplain title="Liquidation Price" className="top-[0.2em]" />

              <div className="flex flex-col">
                <FormatNumber
                  nb={positionInfos.liquidationPrice}
                  format="currency"
                  className="pt-8 text-lg"
                />

                {openedPosition && openedPosition.liquidationPrice ? (
                  <FormatNumber
                    nb={openedPosition.liquidationPrice}
                    format="currency"
                    className="text-txtfade text-xs self-center line-through"
                    isDecimalDimmed={false}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full justify-evenly items-center">
            <div className="w-20 h-4 bg-gray-800 rounded-xl" />

            <div className="h-full w-[1px] bg-gray-800" />

            <div className="w-20 h-4 bg-gray-800 rounded-xl" />
          </div>
        )}
      </StyledSubSubContainer>

      <h5 className="flex items-center ml-4 mt-4 mb-2">Fees</h5>

      <StyledSubSubContainer
        className={twMerge('flex p-2 h-[5em] items-center justify-center')}
      >
        {positionInfos && !isInfoLoading ? (
          <div
            className={twMerge(
              'flex',
              feesNbChar && feesNbChar > 30 ? 'scale-90' : 'scale-100',
            )}
          >
            {openedPosition ? (
              <>
                <div className="flex relative items-center">
                  <TextExplain title="Existing Fees" className="top-[0.2em]" />

                  <FormatNumber
                    nb={
                      openedPosition.entryFeeUsd +
                      openedPosition.exitFeeUsd +
                      (openedPosition.borrowFeeUsd ?? 0)
                    }
                    format="currency"
                    className="text-lg pt-8"
                  />
                </div>

                <span className="text-xl ml-2 mr-2 mt-8">+</span>
              </>
            ) : null}

            <div className="flex relative items-center">
              <TextExplain
                title={!openedPosition ? 'Entry/Close Fees' : 'New Fees'}
                className="top-[0.2em]"
              />

              <FormatNumber
                nb={
                  typeof positionInfos?.totalOpenPositionFeeUsd !==
                    'undefined' &&
                  typeof positionInfos?.exitFeeUsd !== 'undefined'
                    ? positionInfos.totalOpenPositionFeeUsd +
                      positionInfos.exitFeeUsd
                    : undefined
                }
                format="currency"
                className="text-lg pt-8"
              />
            </div>

            <span className="text-xl ml-2 mr-2 mt-8">+</span>

            <div className="flex relative items-center">
              <TextExplain title="Borrow Fees" className="top-[0.2em]" />

              <FormatNumber
                nb={custody && tokenB && custody.borrowFee}
                precision={RATE_DECIMALS}
                suffix="%/hr"
                isDecimalDimmed={false}
                className="text-lg pt-8"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full justify-center items-center">
            <div className="w-40 h-4 bg-gray-800 rounded-xl" />
          </div>
        )}
      </StyledSubSubContainer>
    </>
  );
}
