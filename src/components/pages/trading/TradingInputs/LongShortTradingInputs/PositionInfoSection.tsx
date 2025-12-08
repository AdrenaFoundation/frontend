import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
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
}: PositionInfoSectionProps) => {
    const { t } = useTranslation();
    return (
        <>
            <div className="flex items-center mt-1 mb-2">
                <h5 className="hidden sm:flex items-center">{t('trade.positionInfo')}</h5>
                <Tippy
                    content={
                        <p className="text-txtfade">
                            {t('trade.positionInfoTooltip')}
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
                    openedPosition ? 'h-[4.8em]' : 'h-[4em]'
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
                    openedPosition ? 'h-[4.8em]' : 'h-[4em]'
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
};

// Subcomponents for cleaner organization
const EntryPriceSection = ({ openedPosition, newPositionInfo, increasePositionInfo, tokenB }: {
    openedPosition: PositionExtended | null;
    newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
    increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
    tokenB: Token;
}) => {

    const { t } = useTranslation()

    return (
        <div className='w-1/2 flex items-center justify-center'>
            <TextExplainWrapper title={t('trade.entryPrice')} className="flex-col mt-7">
                <FormatNumber
                    nb={openedPosition ? increasePositionInfo?.weightedAverageEntryPrice : newPositionInfo.entryPrice}
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
    )
}

const LiquidationPriceSection = ({
    openedPosition,
    newPositionInfo,
    increasePositionInfo,
    tokenB
}: {
    openedPosition: PositionExtended | null;
    newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
    increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
    tokenB: Token;
}) => {

    const { t } = useTranslation()

    return (
        <div className='w-1/2 flex items-center justify-center'>
            <TextExplainWrapper title={t('trade.liquidationPrice')} className="flex-col mt-7">
                <FormatNumber
                    nb={openedPosition ? increasePositionInfo?.estimatedLiquidationPrice : newPositionInfo.liquidationPrice}
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
    )
}

const LeverageSection = ({
    openedPosition,
    newPositionInfo,
    increasePositionInfo
}: {
    openedPosition: PositionExtended | null;
    newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
    increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
}) => {

    const { t } = useTranslation()

    return (
        <div className='w-1/2 flex items-center justify-center'>
            <TextExplainWrapper title={t('trade.initialLeverage')} className="flex-col mt-6">
                <FormatNumber
                    nb={openedPosition
                        ? increasePositionInfo?.newOverallLeverage
                        : newPositionInfo.sizeUsd / newPositionInfo.collateralUsd
                    }
                    format="number"
                    prefix="x"
                    className={`text-base ${openedPosition
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
    )
}

const SizeSection = ({
    openedPosition,
    newPositionInfo,
    increasePositionInfo
}: {
    openedPosition: PositionExtended | null;
    newPositionInfo: NonNullable<PositionInfoSectionProps['newPositionInfo']>;
    increasePositionInfo: PositionInfoSectionProps['increasePositionInfo'];
}) => {

    const { t } = useTranslation()

    return (
        <div className='w-1/2 flex items-center justify-center'>
            <TextExplainWrapper title={t('trade.sizeUsd')} className="flex-col mt-6">
                <FormatNumber
                    nb={openedPosition
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
    )
}

const LoadingPlaceholder = () => (
    <div className="flex w-full justify-evenly items-center">
        <div className="w-20 h-4 bg-gray-800 rounded-md" />
        <div className="h-full w-[1px] bg-gray-800" />
        <div className="w-20 h-4 bg-gray-800 rounded-md" />
    </div>
);
