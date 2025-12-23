import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { RATE_DECIMALS } from '@/constant';
import { BorrowRatesState } from '@/reducers/borrowRatesReducer';
import { CustodyExtended, PositionExtended } from '@/types';

import fireImg from '../../../../../../public/images/fire.png';
import infoIcon from '../../../../../../public/images/Icons/info.svg';
import PositionFeesTooltip from './PositionFeesTooltip';
import { PositionInfoState } from './types';

interface FeesSectionProps {
    openedPosition: PositionExtended | null;
    custody: CustodyExtended | null;
    usdcCustody: CustodyExtended | null;
    side: 'long' | 'short';
    borrowRates: BorrowRatesState;
    newPositionInfo: PositionInfoState['newPositionInfo'] | null;
    isInfoLoading: boolean;
}

export const FeesSection = ({
    openedPosition,
    custody,
    usdcCustody,
    side,
    borrowRates,
    newPositionInfo,
    isInfoLoading,
}: FeesSectionProps) => {
    const [displayBorrowRateAsApr, setDisplayBorrowRateAsApr] = useState(false);

    const { t } = useTranslation()

    const highSwapFeeTippyContent = (
        <div className="gap-4 flex flex-col">
            <div className='text-txtfade text-sm'>
                {t('trade.feesSection.swapFeeTooltip')}
            </div>
        </div>
    );

    const borrowRateHourly = useMemo(() => {
        return ((custody && usdcCustody && (borrowRates[side === "long" ? custody.pubkey.toBase58() : usdcCustody.pubkey.toBase58()])) ?? 0) * 100;
    }, [borrowRates, custody, side, usdcCustody]);

    const borrowRateApr = useMemo(() => {
        return borrowRateHourly * 24 * 365.4;
    }, [borrowRateHourly]);

    return (
        <>
            <h5 className="hidden sm:flex items-center mt-2 mb-2">
                {t('trade.feesSection.fees')}
                <span className="ml-1">
                    <Tippy
                        content={
                            <p className="text-txtfade">
                                {t('trade.feesSection.feeInfoPara1')} {newPositionInfo && newPositionInfo.swapFeeUsd ? t('trade.feesSection.feeInfoPara2') : ''}. 🎊 {t('trade.feesSection.feeInfoPara3')} 🎊
                            </p>
                        }
                    >
                        <Image
                            src={infoIcon}
                            width={14}
                            height={14}
                            alt="info icon"
                        />
                    </Tippy>
                </span>
            </h5>

            <PositionFeesTooltip
                borrowRate={(custody && custody.borrowFee) ?? null}
                positionInfos={newPositionInfo}
                openedPosition={openedPosition}
            >
                <StyledSubSubContainer
                    className={twMerge(
                        'flex items-center justify-center mt-2 sm:mt-0',
                        openedPosition ? 'h-[13em]' : 'h-[10em]',
                    )}
                >
                    {newPositionInfo && !isInfoLoading ? (
                        <AutoScalableDiv className='' bodyClassName="flex-col items-center justify-center mt-6">
                            {openedPosition && (
                                <>
                                    <TextExplainWrapper
                                        title={t('trade.feesSection.currentFees')}
                                        className="flex-col"
                                        position="top"
                                    >
                                        <FormatNumber
                                            nb={openedPosition.exitFeeUsd + (openedPosition.borrowFeeUsd ?? 0)}
                                            format="currency"
                                            className="text-base"
                                        />
                                    </TextExplainWrapper>
                                    <span className="text-base ml-1 mr-1 mb-6">+</span>
                                </>
                            )}

                            {newPositionInfo.swapFeeUsd ? (
                                <TextExplainWrapper
                                    title={openedPosition ? t('trade.feesSection.additionalFees') : t('trade.feesSection.feesSwapExit')}
                                    className="flex items-center justify-center"
                                >
                                    <span className="text-xl">(</span>
                                    {newPositionInfo.highSwapFees ? (
                                        <Tippy content={highSwapFeeTippyContent}>
                                            <div className='flex items-center'>
                                                <Image
                                                    className="opacity-100"
                                                    src={fireImg}
                                                    height={18}
                                                    width={18}
                                                    alt="Fire icon"
                                                />
                                                <FormatNumber
                                                    nb={newPositionInfo.swapFeeUsd}
                                                    format="currency"
                                                    className="text-base"
                                                />
                                            </div>
                                        </Tippy>
                                    ) : (
                                        <FormatNumber
                                            nb={newPositionInfo.swapFeeUsd}
                                            format="currency"
                                            className="text-base"
                                        />
                                    )}
                                    <span className="text-base ml-2 mr-2">+</span>
                                    <FormatNumber
                                        nb={newPositionInfo.exitFeeUsd}
                                        format="currency"
                                        className="text-base"
                                    />
                                    <span className="text-xl">)</span>
                                </TextExplainWrapper>
                            ) : (
                                <TextExplainWrapper
                                    title={t('trade.feesSection.exitFees')}
                                    className="flex items-center justify-center"
                                >
                                    <FormatNumber
                                        nb={newPositionInfo.exitFeeUsd}
                                        format="currency"
                                        className="text-base"
                                    />
                                </TextExplainWrapper>
                            )}

                            {newPositionInfo.highSwapFees && (
                                <Tippy content={highSwapFeeTippyContent}>
                                    <div className='text-xs text-orange font-semibold underline-dashed'>
                                        {t('trade.feesSection.warningHighSwapFees')}
                                    </div>
                                </Tippy>
                            )}

                            <span className="text-base ml-1 mr-1 mb-6">+</span>

                            <TextExplainWrapper
                                title={t('trade.feesSection.dynamicBorrowRate')}
                                className="flex-col"
                                onClick={() => setDisplayBorrowRateAsApr(!displayBorrowRateAsApr)}
                            >
                                {displayBorrowRateAsApr ? <FormatNumber
                                    nb={borrowRateApr}
                                    precision={2}
                                    suffix="%"
                                    isDecimalDimmed={false}
                                    className="text-base"
                                />
                                    : <FormatNumber
                                        nb={borrowRateHourly}
                                        precision={RATE_DECIMALS}
                                        minimumFractionDigits={4}
                                        suffix="%/hr"
                                        isDecimalDimmed={false}
                                        className="text-base"
                                    />}
                            </TextExplainWrapper>
                        </AutoScalableDiv>
                    ) : (
                        <div className="flex h-full justify-center items-center">
                            <div className="w-40 h-4 bg-gray-800 rounded-md" />
                        </div>
                    )}
                </StyledSubSubContainer>
            </PositionFeesTooltip>
        </>
    );
};
