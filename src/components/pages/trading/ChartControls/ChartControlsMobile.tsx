import { useCookies } from 'react-cookie';

import { ChartPreferences } from '../TradingChart/types';
import ChartToggleButton from './ChartToggleButton';

interface ChartControlsMobileProps {
  chartPreferences: ChartPreferences;
  setChartPreferences: React.Dispatch<React.SetStateAction<ChartPreferences>>;
  showBreakEvenLine: boolean;
  setShowBreakEvenLine: (value: boolean) => void;
  toggleSizeUsdInChart: boolean;
  setToggleSizeUsdInChart: (value: boolean) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
}

export default function ChartControlsMobile({
  chartPreferences,
  setChartPreferences,
  showBreakEvenLine,
  setShowBreakEvenLine,
  toggleSizeUsdInChart,
  setToggleSizeUsdInChart,
  isResizing,
  setIsResizing,
}: ChartControlsMobileProps) {
  const [, setCookie] = useCookies([
    'showBreakEvenLine',
    'toggleSizeUsdInChart',
  ]);

  const handleBreakEvenToggle = () => {
    setCookie('showBreakEvenLine', !showBreakEvenLine);
    setShowBreakEvenLine(!showBreakEvenLine);
  };

  const handleSizeToggle = () => {
    setCookie('toggleSizeUsdInChart', !toggleSizeUsdInChart);
    setToggleSizeUsdInChart(!toggleSizeUsdInChart);
  };

  return (
    <div className="flex sm:hidden flex-col p-3 space-y-3">
      {/* Primary buttons - always visible */}
      <div className="flex gap-2 justify-center">
        <ChartToggleButton
          isActive={chartPreferences.showAllActivePositionsLiquidationLines}
          onClick={() => {
            setChartPreferences({
              ...chartPreferences,
              showAllActivePositionsLiquidationLines:
                !chartPreferences.showAllActivePositionsLiquidationLines,
            });
          }}
        >
          Liquidations
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
          History
        </ChartToggleButton>

        <div
          className="px-2.5 py-1.5 bg-gray-200/5 rounded-md flex justify-center items-center cursor-pointer transition-all outline outline-1 outline-offset-[-1px] outline-white/30"
          onClick={() => setIsResizing(!isResizing)}
        >
          <div className="text-center text-xs font-bold text-white">
            {isResizing ? '−' : '+'}
          </div>
        </div>
      </div>

      {/* Secondary buttons - collapsible */}
      {isResizing && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <ChartToggleButton
              isActive={showBreakEvenLine}
              onClick={handleBreakEvenToggle}
            >
              Break Even
            </ChartToggleButton>

            <ChartToggleButton
              isActive={toggleSizeUsdInChart}
              onClick={handleSizeToggle}
            >
              Size
            </ChartToggleButton>
          </div>
        </div>
      )}
    </div>
  );
}
