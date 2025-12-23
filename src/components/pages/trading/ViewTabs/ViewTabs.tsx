import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import crossIcon from '@/../public/images/Icons/cross.svg';
import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

import { POSITION_BLOCK_STYLES } from '../Positions/PositionBlockComponents/PositionBlockStyles';

export type ViewType = 'history' | 'positions' | 'limitOrder';

interface ViewTabsProps {
    view: ViewType;
    setView: (view: ViewType) => void;
    positionsCount: number;
    limitOrdersCount: number;
    isBigScreen: boolean;
    onCloseAllPositions?: () => void;
    onCancelAllLimitOrders?: () => void;
    positions?: PositionExtended[] | null;
    limitOrdersExist?: boolean;
    totalStats?: {
        totalPnL: number;
        totalCollateral: number;
    } | null;
}

export default function ViewTabs({
    view,
    setView,
    positionsCount,
    limitOrdersCount,
    isBigScreen,
    onCloseAllPositions,
    onCancelAllLimitOrders,
    positions,
    limitOrdersExist,
    totalStats,
}: ViewTabsProps) {
    const { t } = useTranslation();
    const tabClass = (isActive: boolean) =>
        twMerge(
            'cursor-pointer hover:opacity-100 transition-opacity duration-300 flex items-center gap-2',
            isActive ? 'opacity-100' : 'opacity-40',
        );

    const badgeClass = (isActive: boolean) =>
        twMerge(
            'h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor',
            isActive ? 'opacity-100' : 'opacity-40'
        );

    return (
        <div className='flex flex-col xl:flex-row gap-2 xl:items-center justify-between p-2 pb-0'>
            <div className="flex items-center justify-start gap-2 px-3 sm:px-4 text-sm">
                <div className={tabClass(view === 'positions')} onClick={() => setView('positions')}>
                    {t('trade.openPositions')}
                    {isBigScreen && (
                        <div className="h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor">
                            {positionsCount}
                        </div>
                    )}
                </div>

                {!isBigScreen && (
                    <div className={badgeClass(view === 'positions')}>
                        {positionsCount}
                    </div>
                )}

                <span className="opacity-20">|</span>

                <div className={tabClass(view === 'limitOrder')} onClick={() => setView('limitOrder')}>
                    {t('trade.limitOrders')}
                    {isBigScreen && (
                        <div className="h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor">
                            {limitOrdersCount}
                        </div>
                    )}
                </div>

                {!isBigScreen && (
                    <div className={badgeClass(view === 'limitOrder')}>
                        {limitOrdersCount}
                    </div>
                )}

                <span className="opacity-20">|</span>

                <span className={tabClass(view === 'history')} onClick={() => setView('history')}>
                    {t('trade.tradeHistoryLabel')}
                </span>

            </div>

            {totalStats ? (
                <div className='flex flex-row gap-3 items-center px-3'>
                    <div className="flex flex-row gap-1 border p-1 md:px-4 rounded-md w-full">
                        <p className="text-xs opacity-50 text-nowrap">{t('trade.totalPnl')}</p>
                        <FormatNumber
                            nb={totalStats.totalPnL}
                            format="currency"
                            minimumFractionDigits={2}
                            prefixClassName={twMerge(
                                totalStats.totalPnL < 0 ? 'text-redbright text-xs' : 'text-green text-xs',
                            )}
                            className={
                                twMerge('font-monobold', totalStats.totalPnL < 0 ? 'text-redbright text-xs' : 'text-green text-xs')
                            }
                            isDecimalDimmed={false}
                        />
                    </div>

                    <div className="items-center flex flex-row gap-1 border p-1 md:px-4 rounded-md w-full">
                        <p className="opacity-50 text-nowrap text-xs">{t('trade.totalCollateral')}</p>
                        <FormatNumber nb={
                            totalStats.totalCollateral
                        } format="currency" className="text-xs" />
                    </div>

                    {/* Action buttons */}
                    {view === 'positions' && positions?.length && onCloseAllPositions ? (
                        <Button
                            size="xs"
                            className={twMerge(
                                POSITION_BLOCK_STYLES.button.filled,
                                isBigScreen ? 'w-[13em] flex-none' : 'w-[3em] max-w-[3em] flex-none'
                            )}
                            title={isBigScreen ? t('trade.closeAllPositions') : ""}
                            icon={!isBigScreen ? crossIcon : undefined}
                            rounded={false}
                            onClick={onCloseAllPositions}
                        />
                    ) : null}
                    {view === 'limitOrder' && limitOrdersExist && onCancelAllLimitOrders ? (
                        <Button
                            size="xs"
                            className={twMerge(
                                POSITION_BLOCK_STYLES.button.filled,
                                isBigScreen ? 'w-[15em] flex-none' : 'w-[3em] max-w-[3em] flex-none'
                            )}
                            title={isBigScreen ? t('trade.cancelAllLimitOrder') : ""}
                            icon={!isBigScreen ? crossIcon : undefined}
                            rounded={false}
                            onClick={onCancelAllLimitOrders}
                        />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
