import { useCookies } from 'react-cookie';

import { ChartPreferences } from '../TradingChart/types';
import ChartToggleButton from './ChartToggleButton';

interface ChartControlsDesktopProps {
    chartPreferences: ChartPreferences;
    setChartPreferences: React.Dispatch<React.SetStateAction<ChartPreferences>>;
    showBreakEvenLine: boolean;
    setShowBreakEvenLine: (value: boolean) => void;
    toggleSizeUsdInChart: boolean;
    setToggleSizeUsdInChart: (value: boolean) => void;
    isResizing: boolean;
    setIsResizing: (value: boolean) => void;
    isBigScreen: boolean;
}

export default function ChartControlsDesktop({
    chartPreferences,
    setChartPreferences,
    showBreakEvenLine,
    setShowBreakEvenLine,
    toggleSizeUsdInChart,
    setToggleSizeUsdInChart,
    isResizing,
    setIsResizing,
    isBigScreen,
}: ChartControlsDesktopProps) {
    const [, setCookie] = useCookies(['showBreakEvenLine', 'toggleSizeUsdInChart']);

    const handleBreakEvenToggle = () => {
        setCookie('showBreakEvenLine', !showBreakEvenLine);
        setShowBreakEvenLine(!showBreakEvenLine);
    };

    const handleSizeToggle = () => {
        setCookie('toggleSizeUsdInChart', !toggleSizeUsdInChart);
        setToggleSizeUsdInChart(!toggleSizeUsdInChart);
    };

    return (
        <div className="hidden sm:flex w-full rounded-lg justify-end items-center p-3">
            <div className="rounded-lg flex justify-center items-center gap-3">
                <ChartToggleButton
                    isActive={chartPreferences.updateTPSLByDrag}
                    onClick={() => {
                        setChartPreferences((prev) => ({
                            ...prev,
                            updateTPSLByDrag: !prev.updateTPSLByDrag,
                        }));
                    }}
                >
                    Draggable SL/TP
                </ChartToggleButton>

                <ChartToggleButton
                    isActive={chartPreferences.showPositionHistory}
                    onClick={() => {
                        setChartPreferences((prev) => ({
                            ...prev,
                            showPositionHistory: !prev.showPositionHistory,
                            showAllActivePositions: false,
                        }));
                    }}
                >
                    Position history
                </ChartToggleButton>

                <ChartToggleButton
                    isActive={chartPreferences.showAllActivePositionsLiquidationLines}
                    onClick={() => {
                        setChartPreferences({
                            ...chartPreferences,
                            showAllActivePositionsLiquidationLines: !chartPreferences.showAllActivePositionsLiquidationLines,
                        });
                    }}
                >
                    Liquidations
                </ChartToggleButton>

                <ChartToggleButton
                    isActive={showBreakEvenLine}
                    onClick={handleBreakEvenToggle}
                >
                    Break Even line
                </ChartToggleButton>

                <ChartToggleButton
                    isActive={toggleSizeUsdInChart}
                    onClick={handleSizeToggle}
                >
                    Show size in chart
                </ChartToggleButton>

                {isBigScreen && (
                    <ChartToggleButton
                        isActive={isResizing}
                        onClick={() => setIsResizing(!isResizing)}
                    >
                        Resize
                    </ChartToggleButton>
                )}
            </div>
        </div>
    );
}
