import Tippy from '@tippyjs/react';

import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { EnrichedPositionApi, PositionExtended } from '@/types';

interface PnLProps {
    position: PositionExtended | EnrichedPositionApi;
    showAfterFees: boolean;
    isHistory?: boolean;
    setShowAfterFees: (show: boolean) => void;
}

const PnlBlock = (position: PositionExtended | EnrichedPositionApi, showAfterFees: boolean, fees: number) => {
    return position.pnl ? <div className="flex items-center">
        <FormatNumber
            nb={showAfterFees ? position.pnl : position.pnl - fees}
            format="currency"
            minimumFractionDigits={2}
            className={`mr-0.5 font-bold text-sm text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'green' : 'redbright'}`}
            isDecimalDimmed={false}
        />
        <FormatNumber
            nb={((showAfterFees ? position.pnl : position.pnl - fees) / ('entryCollateralAmount' in position ? position.entryCollateralAmount : position.collateralUsd)) * 100}
            format="percentage"
            prefix="("
            suffix=")"
            suffixClassName={`ml-0 text-sm text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'green' : 'redbright'}`}
            precision={2}
            minimumFractionDigits={2}
            isDecimalDimmed={false}
            className={`text-xs text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'green' : 'redbright'}`}
        />
    </div> : <div className="flex items-center">-</div>
}

const PnlTooltip = (position: PositionExtended | EnrichedPositionApi, showAfterFees: boolean, fees: number, decreaseFees: number, closeFees: number) => {
    return <Tippy
        content={
            <div className="min-w-max">
                {'decreasePnl' in position && position.decreasePnl !== undefined && position.decreasePnl !== 0 ? (
                    <>
                        <div className="flex justify-between">
                            <span className="whitespace-nowrap">Decrease PnL:</span>
                            <span className="ml-4 inline-block">
                                <FormatNumber
                                    nb={showAfterFees ? position.decreasePnl : position.decreasePnl - decreaseFees}
                                    format="currency"
                                    minimumFractionDigits={2}
                                    className={`text-${position.decreasePnl > 0 ? 'green' : 'redbright'}`}
                                    isDecimalDimmed={false}
                                />
                            </span>
                        </div>
                    </>
                ) : null}

                {'closePnl' in position && position.closePnl !== undefined && position.closePnl !== 0 ? (
                    <div className="flex justify-between">
                        <span className="whitespace-nowrap">Close PnL:</span>
                        <span className="ml-4 inline-block">
                            <FormatNumber
                                nb={showAfterFees ? position.closePnl : position.closePnl - closeFees}
                                format="currency"
                                minimumFractionDigits={2}
                                className={`text-${position.closePnl > 0 ? 'green' : 'redbright'}`}
                                isDecimalDimmed={false}
                            />
                        </span>
                    </div>
                ) : null}
            </div>
        }
        placement="auto"
        interactive={true}
    >
        <div className="underline-dashed">
            {PnlBlock(position, showAfterFees, fees)}
        </div>
    </Tippy>;
}

export const PnL = ({ position, showAfterFees, isHistory, setShowAfterFees }: PnLProps) => {
    const fees = -(('exitFees' in position ? position.exitFees : position.exitFeeUsd) + ('borrowFees' in position ? position.borrowFees : position.borrowFeeUsd ?? 0));
    const decreaseFees = -(('totalDecreaseFees' in position ? position.totalDecreaseFees : 0));
    const closeFees = -(('totalCloseFees' in position ? position.totalCloseFees : 0));

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 w-full font-mono text-xs text-txtfade justify-center items-center">
                PnL
                <label className="flex items-center cursor-pointer">
                    <Switch
                        className="mr-0.5"
                        checked={showAfterFees}
                        onChange={() => setShowAfterFees(!showAfterFees)}
                        size="small"
                    />
                    <span className="ml-0.5 text-xs text-gray-600 whitespace-nowrap w-6 text-center">
                        {showAfterFees ? 'w/ fees' : 'w/o fees'}
                    </span>
                </label>
            </div>
            {
                isHistory ? (
                    'decreasePnl' in position && position.decreasePnl !== undefined && position.decreasePnl !== 0 ?
                        PnlTooltip(position, showAfterFees, fees, decreaseFees, closeFees) : PnlBlock(position, showAfterFees, fees)
                ) : PnlBlock(position, showAfterFees, fees)
            }
        </div>
    );
};
