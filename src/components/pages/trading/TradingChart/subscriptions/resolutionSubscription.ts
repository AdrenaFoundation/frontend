import { SUPPORTED_RESOLUTIONS } from '@/constant';

import {
  IChartingLibraryWidget,
  ResolutionString,
} from '../../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_RESOLUTION } from '../constants';

export function setupResolutionChangeSubscription(
  widget: IChartingLibraryWidget,
) {
  widget
    .activeChart()
    .onIntervalChanged()
    .subscribe(null, (newInterval: ResolutionString) => {
      if (!isSupportedResolution(newInterval)) {
        localStorage.setItem(STORAGE_KEY_RESOLUTION, '1D');
        return;
      }

      localStorage.setItem(STORAGE_KEY_RESOLUTION, newInterval);
    });
}

export function isSupportedResolution(resolution: string): boolean {
  // List of supported resolutions

  return SUPPORTED_RESOLUTIONS.includes(resolution as ResolutionString);
}
