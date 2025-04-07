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
    const fullSymbol = widget.activeChart().symbol();
    const parts = fullSymbol.split('.');
    if (parts.length > 1) {
      const symbolPart = parts[1].split('/')[0];
      return symbolPart as TokenSymbol;
    }
    return null;
  } catch (error) {
    console.error('Error extracting symbol from chart:', error);
    return null;
  }
}

/**
 * Synchronizes studies on the chart with the saved studies for a symbol
 * Only removes studies that shouldn't be there and adds missing ones
 */
function syncStudiesForSymbol(
  widget: IChartingLibraryWidget,
  symbol: TokenSymbol,
) {
  if (!symbol) return;

  try {
    // Get all current studies on the chart
    const currentStudies = widget.activeChart().getAllStudies();

    // Get saved studies for this symbol
    const savedStudies = JSON.parse(
      localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
    );
    const symbolStudies = savedStudies[symbol] as StudyInfo[] | undefined;

    if (
      !symbolStudies ||
      !Array.isArray(symbolStudies) ||
      symbolStudies.length === 0
    ) {
      // If there are no saved studies for this symbol, remove all current studies
      for (const study of currentStudies) {
        widget.activeChart().removeEntity(study.id);
      }
      return;
    }

    // Create a map of saved studies by name for quick lookup
    const savedStudyMap = new Map();
    for (const study of symbolStudies) {
      savedStudyMap.set(study.name, study);
    }

    // Create a map of current studies by name
    const currentStudyMap = new Map();
    for (const study of currentStudies) {
      currentStudyMap.set(study.name, study);
    }

    // Remove studies that aren't in the saved list
    for (const study of currentStudies) {
      if (!savedStudyMap.has(study.name)) {
        widget.activeChart().removeEntity(study.id);
      }
    }

    // Add studies that are in saved list but not currently on the chart
    for (const study of symbolStudies) {
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
    console.error('Error in syncStudiesForSymbol:', error);
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
  let lastSymbol: TokenSymbol | null = null;
  let isProcessingSymbolChange = false;

  // Function to save studies with debounce to prevent excessive writes
  const saveStudies = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      try {
        const symbol = getSymbolFromChart(widget);
        if (!symbol) return;

        // Get all current studies/indicators on the chart
        const studies = widget.activeChart().getAllStudies();

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
    }, 500); // Increased debounce time to 500ms to reduce processing load
  };

  // Save studies when they are modified
  widget.subscribe('study_event', (event) => {
    if (!event) return;
    saveStudies();
  });

  // Load studies when symbol changes
  const handleSymbolChange = () => {
    if (isProcessingSymbolChange) return; // Prevent reentrant calls

    isProcessingSymbolChange = true;
    try {
      const symbol = getSymbolFromChart(widget);
      if (!symbol) {
        isProcessingSymbolChange = false;
        return;
      }

      // Only sync if the symbol actually changed
      if (lastSymbol !== symbol) {
        lastSymbol = symbol;
        isInitialLoad = false; // No longer initial load after symbol change
        syncStudiesForSymbol(widget, symbol);
      }
    } catch (error) {
      console.error('Error in symbol change handler:', error);
    } finally {
      isProcessingSymbolChange = false;
    }
  };

  widget.activeChart().onSymbolChanged().subscribe(null, handleSymbolChange);

  // Initial load - with a small delay to ensure chart is ready
  setTimeout(() => {
    try {
      const currentSymbol = getSymbolFromChart(widget);
      if (currentSymbol) {
        lastSymbol = currentSymbol;
        syncStudiesForSymbol(widget, currentSymbol);
      }
      isInitialLoad = false;
    } catch (error) {
      console.error('Error loading initial studies:', error);
    }
  }, 100);
}
