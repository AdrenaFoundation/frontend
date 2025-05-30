import { twMerge } from 'tailwind-merge';

import crossIcon from '@/../public/images/Icons/cross.svg';
import Button from '@/components/common/Button/Button';
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
}: ViewTabsProps) {
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
        <div className="flex items-center justify-start gap-2 px-3 sm:px-4 pt-2 text-sm">
            <div className={tabClass(view === 'positions')} onClick={() => setView('positions')}>
                Open positions
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
                Limit orders
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
                Trade history
            </span>
            {/* Action buttons */}
            {view === 'positions' && positions?.length && onCloseAllPositions ? (
                <Button
                    size="xs"
                    className={twMerge(
                        POSITION_BLOCK_STYLES.button.filled,
                        isBigScreen ? 'w-[13em] ml-auto' : 'w-[3em] max-w-[3em] ml-auto'
                    )}
                    title={isBigScreen ? "Close All Positions" : ""}
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
                        isBigScreen ? 'w-[15em] ml-auto' : 'w-[3em] max-w-[3em] ml-auto'
                    )}
                    title={isBigScreen ? "Cancel All Limit Order" : ""}
                    icon={!isBigScreen ? crossIcon : undefined}
                    rounded={false}
                    onClick={onCancelAllLimitOrders}
                />
            ) : null}
        </div>
    );
}
