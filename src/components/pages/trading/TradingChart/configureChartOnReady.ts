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

/**
 * Configures chart appearance and sets up event subscriptions when the chart is ready
 */
export function configureChartOnReady(
  widget: IChartingLibraryWidget,
  savedTimezone: string,
) {
  // Apply chart visual overrides
  widget.applyOverrides({
    'paneProperties.backgroundType': 'solid',
    'paneProperties.background': CHART_BACKGROUND,
    'paneProperties.legendProperties.showStudyArguments': false,
    'paneProperties.legendProperties.showStudyTitles': false,
    'paneProperties.legendProperties.showStudyValues': false,
    'paneProperties.legendProperties.showSeriesTitle': false,
    'paneProperties.legendProperties.showBarChange': false,
    'paneProperties.legendProperties.showSeriesOHLC': true,
    'mainSeriesProperties.priceLineColor': CHART_PRICE_LINE_COLOR,
    'scalesProperties.textColor': CHART_TEXT_COLOR,
    timezone: savedTimezone as Timezone,
  });

  // Set up event subscriptions
  setupDrawingEventSubscription(widget);
  setupResolutionChangeSubscription(widget);
}
