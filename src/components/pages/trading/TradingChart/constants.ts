export const STORAGE_KEY_RESOLUTION = 'trading_chart_resolution';
export const STORAGE_KEY_TIMEZONE = 'trading_chart_timezone';
export const STORAGE_KEY_DRAWINGS = 'chart_drawings';
export const STORAGE_KEY_STUDIES = 'chart_studies';

export const DEFAULT_RESOLUTION = 'H';
export const DEFAULT_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const CHART_BACKGROUND = '#0d1118';
export const CHART_PRICE_LINE_COLOR = '#FFFF05';
export const CHART_TEXT_COLOR = '#B3B5BE';

export const FAVORITE_INTERVALS = [
  '1',
  '3',
  '5',
  '15',
  '1h',
  '4h',
  'D',
] as const;

export const FAVORITE_CHART_TYPES = ['Candles'] as const;

export const DISABLED_FEATURES = [
  'header_symbol_search',
  'header_chart_type',
  'header_compare',
  'display_market_status',
  'create_volume_indicator_by_default',
  'header_undo_redo',
  'symbol_info',
  'symbol_info_long_description',
  'symbol_info_price_source',
] as const;

export const ENABLED_FEATURES = [
  'hide_left_toolbar_by_default',
  'header_indicators',
  'header_fullscreen_button',
  'header_settings',
] as const;
