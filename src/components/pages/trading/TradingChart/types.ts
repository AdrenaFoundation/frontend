import { MutableRefObject } from 'react';

import {
  EnrichedPositionApi,
  LimitOrder,
  PositionExtended,
  Token,
} from '@/types';

import {
  IChartingLibraryWidget,
  IDatafeedChartApi,
} from '../../../../../public/charting_library/charting_library';

export type Widget = IChartingLibraryWidget;

export interface ChartOptions {
  token: Token;
  positions: PositionExtended[] | null;
  positionHistory: EnrichedPositionApi[] | null;
  allActivePositions: PositionExtended[] | null;
  limitOrders: LimitOrder[] | null;
  showBreakEvenLine: boolean;
  toggleSizeUsdInChart: boolean;
  chartPreferences: ChartPreferences;
  getMarksCallback: IDatafeedChartApi['getMarks'];
}

export interface ChartState {
  widget: Widget | null;
  widgetReady: boolean | null;
  isLoading: boolean;
  loadingCounter: number;
}

export interface ChartPreferences {
  // showBreakEvenLine: boolean; TODO: these to move to chart preferences
  // toggleSizeUsdInChart: boolean;
  // showLiquidationPrice: boolean;
  showAllActivePositions: boolean;
  updateTPSLByDrag: boolean;
  showAllActivePositionsLiquidationLines: boolean;
  showPositionHistory: boolean;
}

export type ChartLoadCallback = (() => void) | null;
export type ChartLoadRef = MutableRefObject<ChartLoadCallback>;
