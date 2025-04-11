import { TokenSymbol } from '@/types';

import { IChartingLibraryWidget } from '../../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_DRAWINGS } from '../constants';

export function setupDrawingEventSubscription(widget: IChartingLibraryWidget) {
  widget.subscribe('drawing_event', () => {
    const symbol = widget
      .activeChart()
      .symbol()
      .split('.')[1]
      .split('/')[0] as TokenSymbol;

    const parsedChartShapes = JSON.parse(
      localStorage.getItem(STORAGE_KEY_DRAWINGS) ?? '{}',
    );

    const userDrawings = widget
      .activeChart()
      .getAllShapes()
      .map((line) => {
        const points = widget.activeChart().getShapeById(line.id).getPoints();

        const shape = widget
          .activeChart()
          .getShapeById(line.id)
          .getProperties();

        // Uses text to filter out our drawings
        if (shape.text.includes('long') || shape.text.includes('short')) {
          return null;
        }

        // Save user drawn line
        return {
          id: line.id,
          points,
          name: line.name,
          options: shape,
        };
      })
      .filter((line) => line);

    localStorage.setItem(
      STORAGE_KEY_DRAWINGS,
      JSON.stringify({
        ...parsedChartShapes,
        [symbol]: userDrawings,
      }),
    );
  });
}
