import { TokenSymbol } from '@/types';

import {
  EntityId,
  IChartingLibraryWidget,
  StudyInputValue,
  StudyOverrides,
  StudyPriceScale,
} from '../../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_STUDIES } from '../constants';

interface StudyInfo {
  id: EntityId;
  name: string;
  isShown?: boolean;
  isLocked?: boolean;
  isVisible?: boolean;
  inputs?: Record<string, StudyInputValue>;
  overrides?: StudyOverrides;
  options: {
    priceScale: 'left' | 'right' | 'overlay';
    paneIndex?: number;
    paneHeight?: number;
  };
}

// ============= Helper Functions =============

/**
 * Helper function to sort studies by pane index
 */
function sortStudiesByPaneIndex(studies: StudyInfo[]): StudyInfo[] {
  return [...studies].sort((a, b) => {
    const aIndex = a.options?.paneIndex ?? 1;
    const bIndex = b.options?.paneIndex ?? 1;
    if (aIndex === 0 && bIndex !== 0) return -1;
    if (bIndex === 0 && aIndex !== 0) return 1;
    return aIndex - bIndex;
  });
}

/**
 * Helper function to convert our price scale type to TradingView's StudyPriceScale
 */
function toStudyPriceScale(
  scale: 'left' | 'right' | 'overlay',
): StudyPriceScale {
  switch (scale) {
    case 'overlay':
      return 'no-scale';
    case 'left':
      return 'new-left';
    case 'right':
    default:
      return 'new-right';
  }
}

/**
 * Helper function to wait for main pane to be ready
 */
function waitForMainPane(widget: IChartingLibraryWidget): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkMainPane = () => {
      attempts++;
      try {
        const chart = widget.activeChart();
        const panes = chart.getPanes();

        if (panes.length > 0) {
          const mainPane = panes[0];
          const leftScales = mainPane.getLeftPriceScales();
          const rightScales = mainPane.getRightPriceScales();

          if (leftScales.length > 0 || rightScales.length > 0) {
            resolve();
            return;
          }
        }

        if (attempts >= maxAttempts) {
          console.warn(
            'Max attempts reached waiting for main pane, proceeding anyway',
          );
          resolve();
          return;
        }

        setTimeout(checkMainPane, 100);
      } catch (error) {
        console.error('Error checking main pane:', error);
        if (attempts >= maxAttempts) {
          console.warn('Max attempts reached after error, proceeding anyway');
          resolve();
          return;
        }
        setTimeout(checkMainPane, 100);
      }
    };

    setTimeout(checkMainPane, 100);
  });
}

/**
 * Helper function to safely extract token symbol from the active chart
 */
function getSymbolFromChart(
  widget: IChartingLibraryWidget,
): TokenSymbol | null {
  try {
    if (!widget) return null;

    let chart;
    try {
      chart = widget.activeChart();
    } catch {
      return null;
    }

    if (!chart) return null;

    let fullSymbol;
    try {
      fullSymbol = chart.symbol();
    } catch {
      return null;
    }

    if (!fullSymbol) return null;

    const parts = fullSymbol.split('.');
    if (parts.length > 1) {
      const symbolPart = parts[1].split('/')[0];
      return symbolPart as TokenSymbol;
    }
    return null;
  } catch {
    console.debug('Chart symbol extraction skipped - chart likely unmounted');
    return null;
  }
}

/**
 * Helper function to convert symbol to its base form
 */
function normalizeSymbol(symbol: TokenSymbol): TokenSymbol {
  return symbol === 'JITOSOL' ? 'SOL' : symbol === 'WBTC' ? 'BTC' : symbol;
}

/**
 * Helper function to get saved studies for a symbol from localStorage
 */
function getSavedStudies(symbol: TokenSymbol): StudyInfo[] {
  try {
    const normalizedSymbol = normalizeSymbol(symbol);
    console.debug(
      `Getting saved studies for symbol: ${symbol} (normalized: ${normalizedSymbol})`,
    );

    const savedStudies = JSON.parse(
      localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
    );
    console.debug('All saved studies in localStorage:', savedStudies);

    const symbolStudies = savedStudies[normalizedSymbol] as
      | StudyInfo[]
      | undefined;
    console.debug('Saved studies for normalized symbol:', symbolStudies);

    if (!symbolStudies || !Array.isArray(symbolStudies)) {
      console.debug(`No saved studies found for symbol ${normalizedSymbol}`);
      return [];
    }

    return symbolStudies;
  } catch (error) {
    console.error('Error getting saved studies:', error);
    return [];
  }
}

/**
 * Helper function to safely get the chart instance
 */
function safeGetChart(widget: IChartingLibraryWidget | null) {
  if (!widget) {
    console.error('Widget not ready for studies subscription');
    return null;
  }

  let chart;
  try {
    chart = widget.activeChart();
  } catch {
    console.error('Widget not ready for studies subscription');
    return null;
  }

  if (!chart) {
    console.error('Chart not ready for studies subscription');
    return null;
  }

  if (typeof chart.getAllStudies !== 'function') {
    console.error('Invalid chart instance for studies subscription');
    return null;
  }

  return chart;
}

let isChangingSymbol = false;
let isCreatingStudies = false;
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_DELAY = 500;
let currentSymbol: TokenSymbol | null = null;

/**
 * Function to load studies from localStorage during initial chart load
 */
async function loadStudies(
  widget: IChartingLibraryWidget,
  symbol: TokenSymbol,
) {
  console.debug(
    `[Load Studies] Starting to load studies for symbol: ${symbol}`,
  );
  if (!widget || !symbol || isCreatingStudies) {
    console.debug(
      '[Load Studies] Cannot load studies - widget or symbol not available',
    );
    return;
  }

  const normalizedSymbol = normalizeSymbol(symbol);
  if (symbol !== normalizedSymbol) {
    console.debug(
      `[Load Studies] Converted symbol from ${symbol} to ${normalizedSymbol}`,
    );
  }

  try {
    isCreatingStudies = true;
    const savedStudies = getSavedStudies(normalizedSymbol);
    console.debug(
      `[Load Studies] Loaded ${savedStudies.length} saved studies for symbol ${normalizedSymbol}`,
    );

    if (savedStudies.length > 0) {
      await createStudies(widget, savedStudies);
    } else {
      console.debug('[Load Studies] No saved studies found for symbol');
    }
  } catch (error) {
    console.error(
      `[Load Studies] Error loading studies for ${normalizedSymbol}:`,
      error,
    );
  } finally {
    isCreatingStudies = false;
  }
}

/**
 * Function to load studies for a specific symbol, called by TradingChart when symbol changes
 */
export function loadStudiesForSymbol(
  widget: IChartingLibraryWidget,
  symbol: TokenSymbol,
) {
  console.log('calling loadStudies at symbol change');
  isChangingSymbol = true;
  currentSymbol = symbol;
  loadStudiesForSymbolChange(widget, symbol).finally(() => {
    isChangingSymbol = false;
  });
}

/**
 * Function to load studies during symbol change
 */
async function loadStudiesForSymbolChange(
  widget: IChartingLibraryWidget,
  symbol: TokenSymbol,
) {
  console.debug(
    `[Load Studies] Starting to load studies for symbol change: ${symbol}`,
  );
  if (!widget || !symbol || isCreatingStudies) {
    console.debug(
      '[Load Studies] Cannot load studies - widget or symbol not available',
    );
    return;
  }

  const normalizedSymbol = normalizeSymbol(symbol);
  if (symbol !== normalizedSymbol) {
    console.debug(
      `[Load Studies] Converted symbol from ${symbol} to ${normalizedSymbol}`,
    );
  }

  try {
    isCreatingStudies = true;
    // First, remove all existing studies
    const currentStudies = widget.activeChart().getAllStudies();
    console.debug(
      `[Load Studies] Found ${currentStudies.length} current studies on chart`,
    );

    // Remove all existing studies
    const removalPromises = currentStudies.map(async (study) => {
      console.debug(
        `[Load Studies] Removing study ${study.name} (${study.id})`,
      );
      try {
        await widget.activeChart().removeEntity(study.id);
        console.debug(
          `[Load Studies] Successfully removed study ${study.name} (${study.id})`,
        );
      } catch (error) {
        console.error(
          `[Load Studies] Error removing study ${study.name} (${study.id}):`,
          error,
        );
      }
    });

    await Promise.all(removalPromises);

    const savedStudies = getSavedStudies(normalizedSymbol);
    console.debug(
      `[Load Studies] Loaded ${savedStudies.length} saved studies for symbol ${normalizedSymbol}`,
    );

    if (savedStudies.length > 0) {
      await createStudies(widget, savedStudies);
    } else {
      console.debug('[Load Studies] No saved studies found for symbol');
    }
  } catch (error) {
    console.error(
      `[Load Studies] Error loading studies for ${normalizedSymbol}:`,
      error,
    );
  } finally {
    isCreatingStudies = false;
  }
}

/**
 * Helper function to create studies from saved studies
 */
async function createStudies(
  widget: IChartingLibraryWidget,
  savedStudies: StudyInfo[],
) {
  console.debug(
    `[Load Studies] Found ${savedStudies.length} saved studies to create`,
  );
  await waitForMainPane(widget);
  console.debug('[Load Studies] Main pane is ready');

  const sortedStudies = sortStudiesByPaneIndex(savedStudies);
  console.debug('[Load Studies] Sorted studies by pane index');

  const paneHeights = new Map<number, number>();

  for (const study of sortedStudies) {
    try {
      console.debug(
        `[Load Studies] Creating study ${study.name} (${study.id})`,
      );
      const isOverlay =
        study.options.priceScale === 'overlay' || study.options.paneIndex === 0;
      const priceScale = toStudyPriceScale(study.options.priceScale);

      const studyOverrides = {
        ...study.overrides,
        visible: study.isVisible ?? true,
      };

      const studyId = await widget
        .activeChart()
        .createStudy(
          study.name,
          isOverlay,
          false,
          study.inputs,
          studyOverrides,
        );

      if (!studyId) {
        console.error('[Load Studies] Study creation failed:', study.name);
        continue;
      }

      console.debug(
        `[Load Studies] Successfully created study ${study.name} with ID ${studyId}`,
      );

      if (!isOverlay) {
        const studyApi = widget.activeChart().getStudyById(studyId);
        if (studyApi) {
          console.debug(
            `[Load Studies] Setting price scale for study ${studyId} to ${priceScale}`,
          );
          studyApi.changePriceScale(priceScale);
          studyApi.setVisible(study.isVisible ?? true);

          if (
            study.options.paneIndex !== undefined &&
            study.options.paneIndex > 0
          ) {
            console.debug(
              `[Load Studies] Moving study ${studyId} to pane ${study.options.paneIndex}`,
            );
            const panes = widget.activeChart().getPanes();
            const currentPane = panes.find((pane) => {
              const scales = [
                ...pane.getLeftPriceScales(),
                ...pane.getRightPriceScales(),
              ];
              return scales.some((scale) =>
                scale.getStudies().includes(studyId),
              );
            });

            if (currentPane) {
              currentPane.moveTo(study.options.paneIndex);

              if (study.options.paneHeight) {
                console.debug(
                  `[Load Studies] Storing pane height ${study.options.paneHeight} for pane ${study.options.paneIndex}`,
                );
                paneHeights.set(
                  study.options.paneIndex,
                  study.options.paneHeight,
                );
              }
            }
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        `[Load Studies] Error creating study ${study.name} (${study.id}):`,
        error,
      );
    }
  }

  if (paneHeights.size > 0) {
    setTimeout(() => {
      const chart = safeGetChart(widget);
      if (chart) {
        const panes = chart.getPanes();
        paneHeights.forEach((height, paneIndex) => {
          if (paneIndex < panes.length) {
            try {
              panes[paneIndex].setHeight(height);
            } catch (error) {
              console.error(`[Load Studies] Error setting pane height:`, error);
            }
          }
        });
      }
    }, 1000);
  }
}

/**
 * Function to save studies to localStorage
 */
async function saveStudies(widget: IChartingLibraryWidget) {
  if (isChangingSymbol || isCreatingStudies) {
    console.debug(
      '[Save Studies] Skipping save during symbol change or study creation',
    );
    return;
  }

  if (!currentSymbol) {
    console.debug('[Save Studies] No current symbol available, skipping save');
    return;
  }

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    const chart = safeGetChart(widget);
    if (!chart) {
      console.error('Chart not available for saving studies');
      return;
    }

    const normalizedSymbol = normalizeSymbol(currentSymbol as TokenSymbol);
    console.debug(
      `[Save Studies] Saving studies for symbol: ${currentSymbol} (normalized: ${normalizedSymbol})`,
    );

    try {
      const studies = chart.getAllStudies();
      console.debug(`[Save Studies] Found ${studies.length} studies on chart`);

      // Get the current saved studies for this symbol
      const savedStudies = JSON.parse(
        localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
      );
      const currentSymbolStudies = savedStudies[normalizedSymbol] || [];

      // If there are no studies on the chart and no saved studies for this symbol, do nothing
      if (studies.length === 0 && currentSymbolStudies.length === 0) {
        console.debug(
          '[Save Studies] No studies to save and no existing studies for symbol',
        );
        return;
      }

      const panes = chart.getPanes();
      const mainPane = panes[0];

      const processedStudyIds = new Set<EntityId>();
      const detailedStudies = studies
        .filter((study) => {
          if (processedStudyIds.has(study.id)) return false;
          processedStudyIds.add(study.id);
          return true;
        })
        .map((study) => {
          try {
            const studyApi = chart.getStudyById(study.id);
            if (!studyApi) return null;

            const studyInfo: StudyInfo = {
              id: study.id,
              name: study.name,
              options: { priceScale: 'right' },
            };

            const studyPane = panes.find((pane) => {
              const leftPriceScales = pane.getLeftPriceScales();
              const rightPriceScales = pane.getRightPriceScales();
              return [...leftPriceScales, ...rightPriceScales].some((scale) =>
                scale.getStudies().includes(study.id),
              );
            });

            if (studyPane) {
              const paneIndex = panes.indexOf(studyPane);
              studyInfo.options.paneIndex = paneIndex;

              try {
                const currentHeight = studyPane.getHeight();
                studyInfo.options.paneHeight = currentHeight;
              } catch (error) {
                console.error(`Error getting pane ${paneIndex} height:`, error);
              }

              const leftScales = studyPane.getLeftPriceScales();
              const rightScales = studyPane.getRightPriceScales();

              const isOnLeftScale = leftScales.some((scale) =>
                scale.getStudies().includes(study.id),
              );
              const isOnRightScale = rightScales.some((scale) =>
                scale.getStudies().includes(study.id),
              );

              if (studyPane === mainPane || paneIndex === 0) {
                studyInfo.options.priceScale = 'overlay';
                studyInfo.options.paneIndex = 0;
                delete studyInfo.options.paneHeight;
              } else if (isOnLeftScale) {
                studyInfo.options.priceScale = 'left';
              } else if (isOnRightScale) {
                studyInfo.options.priceScale = 'right';
              }

              try {
                const inputValues = studyApi.getInputValues();
                if (inputValues) {
                  const inputs: Record<string, StudyInputValue> = {};
                  inputValues.forEach((input) => {
                    if (input.id && input.value !== undefined) {
                      inputs[input.id] = input.value;
                    }
                  });
                  studyInfo.inputs = inputs;
                }
                studyInfo.isVisible = studyApi.isVisible();
              } catch (error) {
                console.error('Error getting study inputs:', error);
              }
            }

            return studyInfo;
          } catch (error) {
            console.error(
              `Error getting study details for ${study.name} (${study.id}):`,
              error,
            );
            return null;
          }
        })
        .filter((study): study is StudyInfo => study !== null);

      console.debug('[Save Studies] Current saved studies:', savedStudies);

      // Only update if there are actual changes
      if (detailedStudies.length > 0) {
        // Check if the studies are different from the saved ones
        const hasChanges =
          JSON.stringify(detailedStudies) !==
          JSON.stringify(currentSymbolStudies);

        if (hasChanges) {
          console.debug(
            `[Save Studies] Saving ${detailedStudies.length} studies for symbol ${normalizedSymbol}`,
          );
          const updatedStudies = {
            ...savedStudies,
            [normalizedSymbol]: detailedStudies,
          };
          localStorage.setItem(
            STORAGE_KEY_STUDIES,
            JSON.stringify(updatedStudies),
          );
          console.debug(
            '[Save Studies] Updated saved studies:',
            updatedStudies,
          );
        } else {
          console.debug(
            '[Save Studies] No changes detected in studies, skipping save',
          );
        }
      } else if (currentSymbolStudies.length > 0) {
        // If there are no studies but we have saved studies for this symbol, remove them
        console.debug(
          `[Save Studies] No studies found for ${normalizedSymbol}, removing saved studies`,
        );
        const updatedStudies = { ...savedStudies };
        delete updatedStudies[normalizedSymbol];
        localStorage.setItem(
          STORAGE_KEY_STUDIES,
          JSON.stringify(updatedStudies),
        );
      } else {
        console.debug(
          '[Save Studies] No studies to save and no existing studies for symbol',
        );
      }
    } catch (error) {
      console.error('[Save Studies] Error saving studies:', error);
    }
  }, SAVE_DEBOUNCE_DELAY);
}

/**
 * Sets up subscription to save and restore studies/indicators
 */
export function setupStudiesSubscription(widget: IChartingLibraryWidget) {
  if (!widget || !widget.activeChart) {
    console.error('Widget not ready for studies subscription');
    return;
  }

  // Function to save studies with debounce
  const debouncedSaveStudies = () => {
    if (isCreatingStudies) {
      console.debug('[Save Studies] Skipping save during study creation');
      return;
    }
    saveStudies(widget);
  };

  // Subscribe to study events
  widget.subscribe('study_event', () => {
    console.debug('Study event received, saving studies');
    debouncedSaveStudies();
  });

  widget.subscribe('study_properties_changed', () => {
    console.debug('Study properties changed event received, saving studies');
    debouncedSaveStudies();
  });

  widget.subscribe('series_properties_changed', () => {
    console.debug('Series properties changed event received, saving studies');
    debouncedSaveStudies();
  });

  widget.subscribe('chart_load_requested', () => {
    console.debug('Chart load requested event received, saving studies');
    debouncedSaveStudies();
  });

  // Add subscription for pane resizing
  let resizeTimeout: NodeJS.Timeout | null = null;
  widget.subscribe('layout_changed', () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      debouncedSaveStudies();
    }, 300);
  });

  widget.subscribe('panes_height_changed', () => {
    console.debug('Pane height changed event received, saving studies');
    debouncedSaveStudies();
  });

  // Load studies when chart is ready, only once
  widget.onChartReady(async () => {
    console.log('Chart ready, loading studies');
    const symbol = getSymbolFromChart(widget);
    if (symbol) {
      currentSymbol = symbol;
      console.debug(`Loading studies for symbol: ${symbol}`);
      await loadStudies(widget, symbol);
    }
  });
}
