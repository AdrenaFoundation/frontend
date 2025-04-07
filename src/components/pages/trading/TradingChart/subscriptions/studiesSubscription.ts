import { TokenSymbol } from '@/types';

import {
  IChartingLibraryWidget,
  StudyInputValue,
  StudyOverrides,
} from '../../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_STUDIES } from '../constants';

interface StudyInfo {
  id: string;
  name: string;
  isShown?: boolean;
  isLocked?: boolean;
  inputs?: Record<string, StudyInputValue>;
  overrides?: StudyOverrides;
  priceScale?: {
    position?: string;
    vertLabelsAlign?: string;
    scaleSeriesOnly?: boolean;
  };
}

/**
 * Safely extracts token symbol from the active chart
 */
function getSymbolFromChart(
  widget: IChartingLibraryWidget,
): TokenSymbol | null {
  try {
    // First check if widget exists
    if (!widget) {
      return null;
    }

    // Try to get the chart instance safely
    let chart;
    try {
      chart = widget.activeChart();
    } catch {
      // If activeChart() throws, the widget is likely destroyed
      return null;
    }

    // If we got this far but chart is null, return early
    if (!chart) {
      return null;
    }

    // Try to get the symbol safely
    let fullSymbol;
    try {
      fullSymbol = chart.symbol();
    } catch {
      // If symbol() throws, the chart API is likely not available
      return null;
    }

    // Process the symbol if we have one
    if (!fullSymbol) {
      return null;
    }

    const parts = fullSymbol.split('.');
    if (parts.length > 1) {
      const symbolPart = parts[1].split('/')[0];
      return symbolPart as TokenSymbol;
    }
    return null;
  } catch {
    // We should never reach this with the above checks, but just in case
    console.debug('Chart symbol extraction skipped - chart likely unmounted');
    return null;
  }
}

/**
 * Gets the saved studies for a symbol from localStorage
 */
function getSavedStudies(symbol: TokenSymbol): StudyInfo[] {
  try {
    const savedStudies = JSON.parse(
      localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
    );
    const symbolStudies = savedStudies[symbol] as StudyInfo[] | undefined;

    if (!symbolStudies || !Array.isArray(symbolStudies)) {
      return [];
    }

    return symbolStudies;
  } catch (error) {
    console.error('Error getting saved studies:', error);
    return [];
  }
}

/**
 * Sets up subscription to save and restore studies/indicators
 */
export function setupStudiesSubscription(widget: IChartingLibraryWidget) {
  if (!widget || !widget.activeChart) {
    console.error('Widget not ready for studies subscription');
    return;
  }

  let isInitialLoad = true;
  let saveTimeout: NodeJS.Timeout | null = null;

  // Function to save studies with debounce to prevent excessive writes
  const saveStudies = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      try {
        // additional check to prevent errors when widget is destroyed
        if (
          !widget ||
          !widget.activeChart ||
          typeof widget.activeChart !== 'function'
        ) {
          return;
        }

        const symbol = getSymbolFromChart(widget);
        if (!symbol) return;

        const chart = widget.activeChart();
        if (!chart || typeof chart.getAllStudies !== 'function') {
          return;
        }

        // Get all current studies/indicators on the chart
        const studies = chart.getAllStudies();

        // Don't save empty studies during initial load to prevent wiping out saved studies
        if (studies.length === 0 && isInitialLoad) {
          isInitialLoad = false;
          return;
        }

        // Get saved studies from localStorage
        const savedStudies = JSON.parse(
          localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
        );

        // Update studies for current symbol only if we have studies or if the key already exists
        if (studies.length > 0 || savedStudies[symbol]) {
          localStorage.setItem(
            STORAGE_KEY_STUDIES,
            JSON.stringify({
              ...savedStudies,
              [symbol]: studies,
            }),
          );
        }
      } catch (error) {
        console.error('Error saving studies:', error);
      }
    }, 500);
  };

  // Save studies when they are modified
  widget.subscribe('study_event', (event) => {
    if (!event) return;
    saveStudies();
  });

  // Initial load function that will be called once the chart is ready, only draws studies if there are any in local Storage
  const loadStudiesOnReady = () => {
    widget.onChartReady(() => {
      console.log('Chart ready, loading studies');

      try {
        const currentSymbol = getSymbolFromChart(widget);
        if (!currentSymbol) return;

        // Update initialization flag
        isInitialLoad = false;

        // Load studies from localStorage
        const studiesForSymbol = getSavedStudies(currentSymbol);

        // Add each study
        if (studiesForSymbol.length > 0) {
          for (const study of studiesForSymbol) {
            try {
              widget
                .activeChart()
                .createStudy(
                  study.name,
                  study.isShown ?? true,
                  study.isLocked ?? false,
                  study.inputs ?? {},
                  study.overrides ?? {},
                );
            } catch (error) {
              console.error(`Error adding study ${study.name}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading studies on chart ready:', error);
      }
    });
  };

  // Call the initial load function - this is safe to call even if the chart is already ready
  loadStudiesOnReady();
}

/**
 * Function to load studies for a specific symbol
 * This should be called from the TradingChart component when the symbol changes
 */
export function loadStudiesForSymbol(
  widget: IChartingLibraryWidget,
  symbol: TokenSymbol,
) {
  if (!widget || !symbol) return;

  // Handle special case for JITOSOL
  symbol = symbol === 'JITOSOL' ? 'SOL' : symbol;

  // This is overkill since called by event on TradingChart onChartReady on symbol change but doesn't cost anything
  widget.onChartReady(() => {
    try {
      console.log(
        `Loading studies for ${symbol} after chart ready on symbol change`,
      );

      // Get current studies on the chart
      const currentStudies = widget.activeChart().getAllStudies();

      // Load saved studies for this symbol from localStorage
      const savedStudies = getSavedStudies(symbol);

      // Create maps for faster lookups
      const savedStudyMap = new Map(
        savedStudies.map((study) => [study.name, study]),
      );

      const currentStudyMap = new Map(
        currentStudies.map((study) => [study.name, study]),
      );

      // 1. First remove studies that aren't in the saved list
      for (const study of currentStudies) {
        if (!savedStudyMap.has(study.name)) {
          try {
            widget.activeChart().removeEntity(study.id);
          } catch (error) {
            console.error(`Error removing study ${study.name}:`, error);
          }
        }
      }

      // 2. Then add studies that are in saved list but not currently on the chart
      for (const study of savedStudies) {
        if (!currentStudyMap.has(study.name)) {
          try {
            widget
              .activeChart()
              .createStudy(
                study.name,
                study.isShown ?? true,
                study.isLocked ?? false,
                study.inputs ?? {},
                study.overrides ?? {},
              );
          } catch (error) {
            console.error(`Error adding study ${study.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error loading studies for ${symbol}:`, error);
    }
  });
}
