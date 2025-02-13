import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

import NetValueTooltip from '../../TradingInputs/NetValueTooltip';

interface NetValueProps {
    position: PositionExtended;
}

export const NetValue = ({ position }: NetValueProps) => {
    return (
        <div className="flex flex-col items-center">
            <div className="flex w-full font-mono text-xs text-txtfade justify-end items-center">
                Net value
            </div>

            <div className="flex">
                {position.pnl ? (
                    <NetValueTooltip position={position}>
                        <span className="underline-dashed text-xs">
                            <FormatNumber
                                nb={position.collateralUsd + position.pnl}
                                format="currency"
                                className="text-sm"
                                minimumFractionDigits={2}
                            />
                        </span>
                    </NetValueTooltip>
                ) : (
                    '-'
                )}
            </div>
        </div>
    );
};
