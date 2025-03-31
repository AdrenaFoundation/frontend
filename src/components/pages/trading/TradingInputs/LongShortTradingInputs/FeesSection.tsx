import Tippy from '@tippyjs/react';
import Image from 'next/image';
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
    const highSwapFeeTippyContent = (
        <div className="gap-4 flex flex-col">
            <div className='text-txtfade text-sm'>
                The collateral you provided does not match the assets you&apos;r opening a position for, as such the platform will first have to do a Swap. Swap fees are dynamic and based on the Liquidity Pool&apos;s ratios, and currently that direction isn&apos;t favorable in term of fees. You can decide to go through or change the provided collateral.
            </div>
        </div>
    );

    return (
        <>
            <h5 className="hidden sm:flex items-center ml-4 mt-2 mb-2">
                Fees
                <span className="ml-1">
                    <Tippy
                        content={
                            <p className="font-medium text-txtfade">
                                0 BPS entry fees - 14 BPS exit fees{newPositionInfo && newPositionInfo.swapFeeUsd ? ' - dynamic swap fees' : ''}. 🎊 NO SIZE FEES! 🎊
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
                                        title="Current Fees"
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
                                    title={openedPosition ? 'Additional Fees (Swap + Exit)' : 'Fees (Swap + Exit)'}
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
                                    title='Exit Fees'
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
                                    <div className='text-xs text-orange font-boldy underline-dashed'>
                                        warning: high swap fees
                                    </div>
                                </Tippy>
                            )}

                            <span className="text-base ml-1 mr-1 mb-6">+</span>

                            <TextExplainWrapper
                                title="Dynamic Borrow Rate"
                                className="flex-col"
                            >
                                <FormatNumber
                                    nb={((custody && usdcCustody && (borrowRates[side === "long" ? custody.pubkey.toBase58() : usdcCustody.pubkey.toBase58()])) ?? 0) * 100}
                                    precision={RATE_DECIMALS}
                                    minimumFractionDigits={4}
                                    suffix="%/hr"
                                    isDecimalDimmed={false}
                                    className="text-base"
                                />
                            </TextExplainWrapper>
                        </AutoScalableDiv>
                    ) : (
                        <div className="flex h-full justify-center items-center">
                            <div className="w-40 h-4 bg-gray-800 rounded-xl" />
                        </div>
                    )}
                </StyledSubSubContainer>
            </PositionFeesTooltip>
        </>
    );
};
