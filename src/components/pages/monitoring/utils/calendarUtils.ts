/**
 * Utility functions for ActivityCalendar component calculations
 */

export interface CalendarDimensions {
  blockSize: number; // in rem
  blockMargin: number; // in rem
  scaleFactor: number;
  position: number; // in rem
}

export function pxToRem(pixels: number, baseFontSize: number = 16): number {
  return pixels / baseFontSize;
}

export function remToPx(rem: number, baseFontSize: number = 16): number {
  return rem * baseFontSize;
}

export function calculateCalendarDimensions(
  containerWidth: number,
  totalDataPoints: number,
  baseFontSize: number = 16,
): CalendarDimensions {
  const totalColumns = Math.ceil(totalDataPoints / 7) || 1;
  const baseSize = 16; // Base size in pixels
  const maxBlockSize = 32; // Max size in pixels
  const baseMargin = 2; // Base margin in pixels

  const availableWidth = containerWidth - 40; // Account for padding
  const calculatedSize = Math.min(
    maxBlockSize,
    Math.max(
      baseSize,
      Math.floor((availableWidth - totalColumns * 4) / totalColumns),
    ),
  );

  const newScaleFactor = calculatedSize / baseSize;

  return {
    blockSize: pxToRem(calculatedSize, baseFontSize),
    blockMargin: pxToRem(baseMargin, baseFontSize),
    scaleFactor: newScaleFactor,
    position: 0, // Will be calculated separately for each month
  };
}

export function calculateMonthPosition(
  weekNumber: number,
  blockSize: number,
  blockMargin: number,
): number {
  return weekNumber * (blockSize + blockMargin);
}
