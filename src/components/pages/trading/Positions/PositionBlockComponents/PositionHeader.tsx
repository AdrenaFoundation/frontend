import { twMerge } from 'tailwind-merge';

import { POSITION_BLOCK_STYLES } from './PositionBlockStyles';

interface PositionHeaderProps {
    readOnly: boolean;
    positionName: React.ReactNode;
    ownerInfo?: React.ReactNode;
    pnl: React.ReactNode;
    netValue?: React.ReactNode;
    isHistory?: boolean;
    isMini?: boolean;
    isMedium?: boolean;
    isCompact?: boolean;
}

export const PositionHeader = ({
    readOnly,
    positionName,
    ownerInfo,
    pnl,
    netValue,
    isHistory,
    isMini,
    isMedium,
    isCompact,
}: PositionHeaderProps) => {
    const isSmallScreen = isMini || isMedium || isCompact;

    if (isSmallScreen) {
        return (
            <div className="flex flex-col w-full items-center">
                {readOnly && !history ? (
                    <div className="border-b flex-1 flex w-full justify-between pb-3">
                        {positionName}
                        {ownerInfo}
                    </div>
                ) : (
                    <div className="border-b flex-1 flex w-full justify-center pb-3">
                        {positionName}
                    </div>
                )}
                {!isHistory ? (
                    <div className="border-b flex-1 flex w-full p-2">
                        <div className="flex flex-col">
                            {pnl}
                        </div>
                        <div className="flex flex-col ml-auto">
                            {netValue}
                        </div>
                    </div>
                ) : (
                    <div className="border-b flex-1 flex w-full p-2 justify-center">
                        <div className="flex flex-col">
                            {pnl}
                        </div>
                    </div>
                )}
            </div >
        );
    }

    const headerClasses = twMerge(
        POSITION_BLOCK_STYLES.base.header,
        isHistory && "mt-0.5 pb-[0.8em]",
        readOnly ? "justify-between" : "items-center"
    );

    if (isHistory) {
        return (
            <div className={headerClasses}>
                <div className="flex items-center">{positionName}</div>
                <div className="ml-auto 2xl:absolute 2xl:left-1/2 2xl:-translate-x-1/2">{pnl}</div>
                <div className="ml-auto">{netValue}</div>
            </div>
        );
    }

    if (readOnly) {
        return (
            <div className={headerClasses}>
                {positionName}
                {ownerInfo}
                {pnl}
                {netValue}
            </div>
        );
    }

    return (
        <div className={headerClasses}>
            <div className="flex items-center">{positionName}</div>
            <div className="ml-auto 2xl:absolute 2xl:left-1/2 2xl:-translate-x-1/2">{pnl}</div>
            <div className="ml-auto">{netValue}</div>
        </div>
    );
};
