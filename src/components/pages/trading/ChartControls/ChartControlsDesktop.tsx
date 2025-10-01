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
}

export default function ChartControlsDesktop({
  chartPreferences,
  setChartPreferences,
  showBreakEvenLine,
  setShowBreakEvenLine,
  toggleSizeUsdInChart,
  setToggleSizeUsdInChart,
}: ChartControlsDesktopProps) {
  const [, setCookie] = useCookies([
    'showBreakEvenLine',
    'toggleSizeUsdInChart',
    'updateTPSLByDrag',
    'showPositionHistory',
    'showAllActivePositionsLiquidationLines',
  ]);

  const handleBreakEvenToggle = () => {
    setCookie('showBreakEvenLine', !showBreakEvenLine);
    setShowBreakEvenLine(!showBreakEvenLine);
  };

  const handleSizeToggle = () => {
    setCookie('toggleSizeUsdInChart', !toggleSizeUsdInChart);
    setToggleSizeUsdInChart(!toggleSizeUsdInChart);
  };

  const handleUpdateTPSLByDragToggle = () => {
    setCookie('updateTPSLByDrag', !chartPreferences.updateTPSLByDrag);
    setChartPreferences((prev) => ({
      ...prev,
      updateTPSLByDrag: !prev.updateTPSLByDrag,
    }));
  };
  const handlePositionHistoryToggle = () => {
    setCookie('showPositionHistory', !chartPreferences.showPositionHistory);
    setChartPreferences((prev) => ({
      ...prev,
      showPositionHistory: !prev.showPositionHistory,
      showAllActivePositions: false,
    }));
  };
  const handleLiquidationLinesToggle = () => {
    setCookie(
      'showAllActivePositionsLiquidationLines',
      !chartPreferences.showAllActivePositionsLiquidationLines,
    );
    setChartPreferences((prev) => ({
      ...prev,
      showAllActivePositionsLiquidationLines:
        !prev.showAllActivePositionsLiquidationLines,
    }));
  };

  return (
    <div className="hidden sm:flex w-full rounded-md justify-end items-center p-3">
      <div className="rounded-md flex justify-center items-center gap-3">
        <ChartToggleButton
          isActive={chartPreferences.updateTPSLByDrag}
          onClick={handleUpdateTPSLByDragToggle}
        >
          Drag. SL/TP
        </ChartToggleButton>

        <ChartToggleButton
          isActive={chartPreferences.showPositionHistory}
          onClick={handlePositionHistoryToggle}
        >
          Position history
        </ChartToggleButton>

        <ChartToggleButton
          isActive={chartPreferences.showAllActivePositionsLiquidationLines}
          onClick={handleLiquidationLinesToggle}
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
      </div>
    </div>
  );
}
