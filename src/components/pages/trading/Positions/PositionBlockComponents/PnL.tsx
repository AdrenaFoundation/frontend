import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended, PositionHistoryExtended } from '@/types';

interface PnLProps {
    position: PositionExtended | PositionHistoryExtended;
    showAfterFees: boolean;
    setShowAfterFees: (show: boolean) => void;
}

export const PnL = ({ position, showAfterFees, setShowAfterFees }: PnLProps) => {
    const fees = -(('exitFees' in position ? position.exitFees : position.exitFeeUsd) + ('borrowFees' in position ? position.borrowFees : position.borrowFeeUsd ?? 0));

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
            {position.pnl ? (
                <div className="flex items-center">
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
                </div>
            ) : (
                '-'
            )}
        </div>
    );
};
