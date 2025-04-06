import { MutableRefObject } from 'react';

import { LimitOrder, PositionExtended, Token } from '@/types';

import { IChartingLibraryWidget } from '../../../../../public/charting_library/charting_library';

export type Widget = IChartingLibraryWidget;

export interface ChartOptions {
  token: Token;
  positions: PositionExtended[] | null;
  limitOrders: LimitOrder[] | null;
  showBreakEvenLine: boolean;
  toggleSizeUsdInChart: boolean;
}

export interface ChartState {
  widget: Widget | null;
  widgetReady: boolean | null;
  isLoading: boolean;
  loadingCounter: number;
}

export type ChartLoadCallback = (() => void) | null;
export type ChartLoadRef = MutableRefObject<ChartLoadCallback>;
