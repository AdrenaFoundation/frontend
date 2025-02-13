import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { PositionExtended } from '@/types';

import shareIcon from '../../../../../../public/images/Icons/share-fill.svg';
import { POSITION_BLOCK_STYLES } from './PositionBlockStyles';

interface ButtonGroupProps {
    position: PositionExtended;
    closableIn: number | null;
    isCompact: boolean;
    isMedium: boolean;
    isMini: boolean;
    isBig: boolean;
    isBiggest: boolean;
    triggerEditPositionCollateral?: (p: PositionExtended) => void;
    triggerStopLossTakeProfit?: (p: PositionExtended) => void;
    triggerClosePosition?: (p: PositionExtended) => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const ButtonGroup = ({
    position,
    closableIn,
    isCompact,
    isBig,
    isBiggest,
    isMedium,
    isMini,
    triggerEditPositionCollateral,
    triggerStopLossTakeProfit,
    triggerClosePosition,
    setIsOpen
}: ButtonGroupProps) => {
    const containerClasses = twMerge(
        "flex gap-2",
        isMini && "col-span-2 w-full",
        isMedium && "col-span-2 col-start-2 row-start-4 w-full",
        isCompact && "col-span-2 col-start-3 row-start-3 w-full items-center",
        isBig && "col-span-2 col-start-6 row-start-2 w-full grid grid-cols-4 gap-2 items-center",
        isBiggest && "flex-row justify-center items-center"
    );

    const buttonClasses = twMerge(
        POSITION_BLOCK_STYLES.button.base,
        (isCompact) || isMedium || isMini
            ? POSITION_BLOCK_STYLES.button.filled
            : ""
    );

    const buttons = [
        {
            title: "Edit",
            onClick: () => triggerEditPositionCollateral?.(position)
        },
        {
            title: "TP/SL",
            onClick: () => triggerStopLossTakeProfit?.(position)
        },
        {
            title: closableIn === 0 || closableIn === null ? "Close" : `Close (${Math.floor(closableIn / 1000)}s)`,
            onClick: () => triggerClosePosition?.(position),
            disabled: closableIn !== 0
        },
        {
            title: "",
            leftIcon: shareIcon,
            onClick: () => setIsOpen(true)
        }
    ];

    return (
        <div className={containerClasses}>
            {buttons.map((button, index) => (
                <Button
                    key={index}
                    size="xs"
                    className={buttonClasses}
                    title={button.title}
                    leftIcon={button.leftIcon}
                    rounded={false}
                    disabled={button.disabled}
                    onClick={button.onClick}
                />
            ))}
        </div>
    );
};
