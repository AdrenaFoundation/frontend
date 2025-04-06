# Trading Chart Component

This directory contains the implementation of the TradingView chart integration for the trading interface.

## Structure

The trading chart implementation has been organized into several files for better maintainability:

- **TradingChart.tsx**: Main component that renders the chart and integrates all the pieces
- **types.ts**: Type definitions specific to the chart functionality
- **constants.ts**: Constants used throughout the chart implementation
- **createTradingViewWidget.ts**: Logic for creating and configuring the TradingView widget
- **configureChartOnReady.ts**: Configuration to apply when the chart is ready
- **subscriptions/**: Directory containing event subscription handlers
  - **drawingSubscription.ts**: Handles saving user drawings
  - **resolutionSubscription.ts**: Handles chart resolution changes
- **useChartState.ts**: Custom hook managing chart state and initialization
- **datafeed.ts**: Implementation of the data feed for TradingView
- **streaming.ts**: Implementation of real-time data streaming

## Key Features

- Integration with TradingView charting library
- Real-time price updates
- Position and limit order visualization on the chart
- Chart drawing tools with persistent storage
- Customizable chart appearance

## Usage

```tsx
<TradingChart
  token={selectedToken}
  positions={positions}
  limitOrders={limitOrders}
  showBreakEvenLine={showBreakEvenLine}
  toggleSizeUsdInChart={toggleSizeUsdInChart}
/>
```

## Implementation Details

The chart implementation uses a modular approach:

1. **Chart State Management**: The `useChartState` hook handles widget creation, script loading, and chart state
2. **Widget Creation**: The `createTradingViewWidget` function encapsulates the widget configuration
3. **Initial Configuration**: The `configureOnReady` function applies settings when the chart is ready
4. **Event Subscriptions**: Dedicated modules in the subscriptions directory handle specific events
5. **Position Drawing**: The `useChartDrawing` hook (from src/hooks) handles drawing positions and orders on the chart
6. **Data Feed**: The datafeed and streaming implementations connect to price data sources
