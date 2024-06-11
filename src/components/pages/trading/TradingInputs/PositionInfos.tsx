import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { RATE_DECIMALS } from '@/constant';
import { PositionExtended, Token } from '@/types';

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

    setFeesNbChar(nb);
  }, [openedPosition, positionInfos]);

  return (
    <>
      <h5 className="flex items-center ml-4 mt-3 mb-2">Position in and out</h5>

      <StyledSubSubContainer
        className={twMerge('flex-col p-2 h-[5em] items-center justify-center')}
      >
        {positionInfos && !isInfoLoading ? (
          <div className="flex w-full justify-evenly">
            <TextExplainWrapper title="Entry Price" className="flex-col mt-8">
              <FormatNumber
                nb={positionInfos.entryPrice}
                format="currency"
                className="text-lg"
              />

              {openedPosition ? (
                <FormatNumber
                  nb={openedPosition.price}
                  format="currency"
                  className="text-txtfade text-xs self-center line-through"
                  isDecimalDimmed={false}
                />
              ) : null}
            </TextExplainWrapper>

            <div className="h-full w-[1px] bg-gray-800" />

            <TextExplainWrapper
              title="Liquidation Price"
              className="flex-col mt-8"
            >
              <FormatNumber
                nb={positionInfos.liquidationPrice}
                format="currency"
                className="text-lg"
              />

              {openedPosition && openedPosition.liquidationPrice ? (
                <FormatNumber
                  nb={openedPosition.liquidationPrice}
                  format="currency"
                  className="text-txtfade text-xs self-center line-through"
                  isDecimalDimmed={false}
                />
              ) : null}
            </TextExplainWrapper>
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
                <TextExplainWrapper
                  title="Existing Fees"
                  className="flex-col mt-8"
                >
                  <FormatNumber
                    nb={
                      openedPosition.entryFeeUsd +
                      openedPosition.exitFeeUsd +
                      (openedPosition.borrowFeeUsd ?? 0)
                    }
                    format="currency"
                    className="text-lg"
                  />
                </TextExplainWrapper>

                <span className="text-xl ml-2 mr-2 mt-8">+</span>
              </>
            ) : null}

            <TextExplainWrapper
              title={!openedPosition ? 'Entry/Close Fees' : 'New Fees'}
              className="flex-col mt-8"
            >
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
                className="text-lg"
              />
            </TextExplainWrapper>

            <span className="text-xl ml-2 mr-2 mt-8">+</span>

            <TextExplainWrapper title="Borrow Rate" className="flex-col mt-8">
              <FormatNumber
                nb={custody && tokenB && custody.borrowFee}
                precision={RATE_DECIMALS}
                suffix="%/hr"
                isDecimalDimmed={false}
                className="text-lg"
              />
            </TextExplainWrapper>
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
