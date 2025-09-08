import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended, Token } from '@/types';

import infoIcon from '../../../../../../public/images/Icons/info.svg';

interface PositionInfoSectionProps {
  openedPosition: PositionExtended | null;
  newPositionInfo: {
    entryPrice: number;
    liquidationPrice: number;
    sizeUsd: number;
    collateralUsd: number;
  } | null;
  increasePositionInfo: {
    weightedAverageEntryPrice: number;
    estimatedLiquidationPrice: number | null;
    newOverallLeverage: number;
    currentLeverage: number;
    isLeverageIncreased: boolean;
    newSizeUsd: number;
  } | null;
  isInfoLoading: boolean;
  tokenB: Token;
}

export const PositionInfoSection = ({
  openedPosition,
  newPositionInfo,
  increasePositionInfo,
  isInfoLoading,
  tokenB,
}: PositionInfoSectionProps) => (
  <>
    <div className="flex items-center mt-1 mb-2">
      <h5 className="hidden sm:flex items-center">Position info</h5>
      <Tippy
        content={
          <p className="font-medium text-txtfade">
            The values shown are estimates based on current prices. Actual
            results may vary at execution, especially if a token swap is
            involved. This means your initial leverage and liquidation price
            might differ slightly.
          </p>
        }
      >
        <Image
          src={infoIcon}
          width={14}
          height={14}
          alt="info icon"
          className="ml-1 cursor-pointer"
        />
      </Tippy>
    </div>

    <StyledSubSubContainer
      className={twMerge(
        'flex pl-3 pr-3 items-center justify-center mt-2 sm:mt-0 border-b-0 rounded-bl-none rounded-br-none',
        openedPosition ? 'h-[4.8em]' : 'h-[4em]',
      )}
    >
      {newPositionInfo && !isInfoLoading ? (
        <div className="flex w-full justify-evenly">
          <EntryPriceSection
            openedPosition={openedPosition}
            newPositionInfo={newPositionInfo}
            increasePositionInfo={increasePositionInfo}
            tokenB={tokenB}
          />

          <div className="h-full w-[1px] bg-gray-800" />

          <LiquidationPriceSection
            openedPosition={openedPosition}
            newPositionInfo={newPositionInfo}
            increasePositionInfo={increasePositionInfo}
            tokenB={tokenB}
          />
        </div>
      ) : (
        <LoadingPlaceholder />
      )}
    </StyledSubSubContainer>

    <StyledSubSubContainer
      className={twMerge(
        'flex pl-3 pr-3 pt-0 pb-3 items-center justify-center border-t-0 rounded-tl-none rounded-tr-none',
        openedPosition ? 'h-[4.8em]' : 'h-[4em]',
      )}
    >
      {newPositionInfo && !isInfoLoading ? (
        <div className="flex w-full justify-evenly">
          <LeverageSection
            openedPosition={openedPosition}
            newPositionInfo={newPositionInfo}
            increasePositionInfo={increasePositionInfo}
          />

          <div className="h-full w-[1px] bg-gray-800" />

          <SizeSection
            openedPosition={openedPosition}
            newPositionInfo={newPositionInfo}
            increasePositionInfo={increasePositionInfo}
          />
        </div>
      ) : (
        <LoadingPlaceholder />
      )}
    </StyledSubSubContainer>
  </>
);

// Subcomponents for cleaner organization
const EntryPriceSection = ({
  openedPosition,
  newPositionInfo,
  increasePositionInfo,
  tokenB,
}: {
  openedPosition: PositionExtended | null;
  newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
  increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
  tokenB: Token;
}) => (
  <div className="w-1/2 flex items-center justify-center">
    <TextExplainWrapper title="Entry Price" className="flex-col mt-7">
      <FormatNumber
        nb={
          openedPosition
            ? increasePositionInfo?.weightedAverageEntryPrice
            : newPositionInfo.entryPrice
        }
        format="currency"
        className="text-base"
        precision={tokenB.displayPriceDecimalsPrecision}
      />
      {openedPosition && (
        <FormatNumber
          nb={openedPosition.price}
          format="currency"
          className="text-txtfade text-xs self-center line-through"
          isDecimalDimmed={false}
          precision={tokenB.displayPriceDecimalsPrecision}
        />
      )}
    </TextExplainWrapper>
  </div>
);

const LiquidationPriceSection = ({
  openedPosition,
  newPositionInfo,
  increasePositionInfo,
  tokenB,
}: {
  openedPosition: PositionExtended | null;
  newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
  increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
  tokenB: Token;
}) => (
  <div className="w-1/2 flex items-center justify-center">
    <TextExplainWrapper title="Liquidation Price" className="flex-col mt-7">
      <FormatNumber
        nb={
          openedPosition
            ? increasePositionInfo?.estimatedLiquidationPrice
            : newPositionInfo.liquidationPrice
        }
        format="currency"
        className="text-base text-orange"
        precision={tokenB.displayPriceDecimalsPrecision}
      />
      {openedPosition && openedPosition.liquidationPrice && (
        <FormatNumber
          nb={openedPosition.liquidationPrice}
          format="currency"
          className="text-txtfade text-xs self-center line-through"
          isDecimalDimmed={false}
          precision={tokenB.displayPriceDecimalsPrecision}
        />
      )}
    </TextExplainWrapper>
  </div>
);

const LeverageSection = ({
  openedPosition,
  newPositionInfo,
  increasePositionInfo,
}: {
  openedPosition: PositionExtended | null;
  newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
  increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
}) => (
  <div className="w-1/2 flex items-center justify-center">
    <TextExplainWrapper title="Init. Leverage" className="flex-col mt-6">
      <FormatNumber
        nb={
          openedPosition
            ? increasePositionInfo?.newOverallLeverage
            : newPositionInfo.sizeUsd / newPositionInfo.collateralUsd
        }
        format="number"
        prefix="x"
        className={`text-base ${
          openedPosition
            ? increasePositionInfo?.isLeverageIncreased
              ? 'text-orange'
              : 'text-green'
            : 'text-white'
        }`}
      />
      {openedPosition && increasePositionInfo?.currentLeverage && (
        <FormatNumber
          nb={increasePositionInfo.currentLeverage}
          format="number"
          prefix="x"
          className="text-txtfade text-xs self-center line-through"
          isDecimalDimmed={false}
        />
      )}
    </TextExplainWrapper>
  </div>
);

const SizeSection = ({
  openedPosition,
  newPositionInfo,
  increasePositionInfo,
}: {
  openedPosition: PositionExtended | null;
  newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
  increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
}) => (
  <div className="w-1/2 flex items-center justify-center">
    <TextExplainWrapper title="Size (usd)" className="flex-col mt-6">
      <FormatNumber
        nb={
          openedPosition
            ? openedPosition.sizeUsd + (increasePositionInfo?.newSizeUsd ?? 0)
            : newPositionInfo.sizeUsd
        }
        format="number"
        className="text-base"
      />
      {openedPosition && openedPosition.sizeUsd && (
        <FormatNumber
          nb={openedPosition.sizeUsd}
          format="number"
          className="text-txtfade text-xs self-center line-through"
          isDecimalDimmed={false}
        />
      )}
    </TextExplainWrapper>
  </div>
);

const LoadingPlaceholder = () => (
  <div className="flex w-full justify-evenly items-center">
    <div className="w-20 h-4 bg-gray-800 rounded-xl" />
    <div className="h-full w-[1px] bg-gray-800" />
    <div className="w-20 h-4 bg-gray-800 rounded-xl" />
  </div>
);
