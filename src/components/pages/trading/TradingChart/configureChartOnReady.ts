import {
  IChartingLibraryWidget,
  Timezone,
} from '../../../../../public/charting_library/charting_library';
import {
  CHART_BACKGROUND,
  CHART_PRICE_LINE_COLOR,
  CHART_TEXT_COLOR,
} from './constants';
import { setupDrawingEventSubscription } from './subscriptions/drawingSubscription';
import { setupResolutionChangeSubscription } from './subscriptions/resolutionSubscription';
import { setupStudiesSubscription } from './subscriptions/studiesSubscription';

/**
 * Configures chart appearance and sets up event subscriptions when the chart is ready
 */
export function configureChartOnReady(
  widget: IChartingLibraryWidget,
  savedTimezone: string,
) {
  // Apply all chart visual settings
  widget.applyOverrides({
    // Background settings
    'paneProperties.backgroundType': 'solid',
    'paneProperties.background': CHART_BACKGROUND,

    // Legend properties
    'paneProperties.legendProperties.showStudyArguments': true,
    'paneProperties.legendProperties.showStudyTitles': true,
    'paneProperties.legendProperties.showStudyValues': false,
    'paneProperties.legendProperties.showSeriesTitle': false,
    'paneProperties.legendProperties.showBarChange': false,
    'paneProperties.legendProperties.showSeriesOHLC': true,

    // Price line settings
    'mainSeriesProperties.priceLineColor': CHART_PRICE_LINE_COLOR,

    // High/Low lines styling
    'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesVisible': true,
    'mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible': true,
    'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesColor': '#858585', // Grey line
    'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesWidth': 1,

    // Text color
    'scalesProperties.textColor': CHART_TEXT_COLOR,

    // Timezone
    timezone: savedTimezone as Timezone,
  });

  // Set up event subscriptions
  setupDrawingEventSubscription(widget);
  setupResolutionChangeSubscription(widget);
  setupStudiesSubscription(widget);
}
