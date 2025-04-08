import { TokenSymbol } from '@/types';

import {
  IChartingLibraryWidget,
  StudyInputValue,
  StudyOverrides,
  EntityId,
  IPaneApi,
  ISeriesApi,
  StudyPriceScale,
} from '../../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_STUDIES } from '../constants';

interface StudyInfo {
  id: EntityId;
  name: string;
  isShown?: boolean;
  isLocked?: boolean;
  inputs?: Record<string, StudyInputValue>;
  overrides?: StudyOverrides;
  options: {
    priceScale: 'left' | 'right' | 'overlay';
    visible: boolean;
    paneIndex?: number; // The index of the pane (0 is main chart pane)
    paneHeight?: number; // The height of the pane
  };
}

// ============= Helper Functions =============

/**
 * Helper function to sort studies by pane index
 * Ensures overlay studies (paneIndex = 0) are created first
 */
function sortStudiesByPaneIndex(studies: StudyInfo[]): StudyInfo[] {
  return [...studies].sort((a, b) => {
    // Ensure overlay studies (paneIndex = 0) are always first
    const aIndex = a.options?.paneIndex ?? 1;
    const bIndex = b.options?.paneIndex ?? 1;

    // If one is an overlay (index 0) and the other isn't, overlay comes first
    if (aIndex === 0 && bIndex !== 0) return -1;
    if (bIndex === 0 && aIndex !== 0) return 1;

    // Otherwise, sort by pane index
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
  console.log('Starting to wait for main pane...');
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds maximum wait time

    const checkMainPane = () => {
      attempts++;
      try {
        console.log(`Checking main pane (attempt ${attempts})...`);
        const chart = widget.activeChart();
        const panes = chart.getPanes();
        console.log(`Found ${panes.length} panes`);

        if (panes.length > 0) {
          const mainPane = panes[0];
          const leftScales = mainPane.getLeftPriceScales();
          const rightScales = mainPane.getRightPriceScales();

          console.log('Main pane scales:', {
            left: leftScales.length,
            right: rightScales.length,
          });

          if (leftScales.length > 0 || rightScales.length > 0) {
            console.log('Main pane is ready with price scales');
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

    // Start checking after a small initial delay
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
 * Helper function to get saved studies for a symbol from localStorage
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

// ============= Exported Functions =============

/**
 * Sets up subscription to save and restore studies/indicators
 */
export function setupStudiesSubscription(widget: IChartingLibraryWidget) {
  if (!widget || !widget.activeChart) {
    console.error('Widget not ready for studies subscription');
    return;
  }

  let isInitialLoad = true;
  let isChangingSymbol = false;
  let saveTimeout: NodeJS.Timeout | null = null;
  const SAVE_DEBOUNCE_DELAY = 500;
  let pendingSaveSymbol: TokenSymbol | null = null;
  let currentSymbol: TokenSymbol | null = null;
  let hasLoadedInitialStudies = false;

  // Function to save studies with debounce
  const debouncedSaveStudies = () => {
    // Get the current symbol
    const newSymbol = getSymbolFromChart(widget);
    if (!newSymbol) return;

    // If we're in the middle of a symbol change, ignore saves from the old symbol
    if (currentSymbol && newSymbol !== currentSymbol) {
      console.log(
        'Ignoring save from old symbol:',
        newSymbol,
        'current:',
        currentSymbol,
      );
      return;
    }

    pendingSaveSymbol = newSymbol;
    console.log('Queuing save for symbol:', pendingSaveSymbol);

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      try {
        // Don't save if we're in the middle of changing symbols
        if (isChangingSymbol) {
          console.log('Skipping save during symbol change');
          pendingSaveSymbol = null;
          return;
        }

        // additional check to prevent errors when widget is destroyed
        if (
          !widget ||
          !widget.activeChart ||
          typeof widget.activeChart !== 'function'
        ) {
          pendingSaveSymbol = null;
          return;
        }

        // Use the captured symbol instead of getting it again
        const symbol = pendingSaveSymbol;
        if (!symbol) return;

        const chart = widget.activeChart();
        if (!chart || typeof chart.getAllStudies !== 'function') {
          pendingSaveSymbol = null;
          return;
        }

        // Get all current studies/indicators on the chart
        const studies = chart.getAllStudies();

        // Don't save empty studies during initial load
        if (studies.length === 0 && isInitialLoad) {
          isInitialLoad = false;
          pendingSaveSymbol = null;
          return;
        }

        console.log(
          `Saving studies for captured symbol ${symbol}:`,
          studies.map((s) => `${s.name} (${s.id})`),
        );

        // Get all panes to determine study positions
        const panes = chart.getPanes();
        const mainPane = panes[0]; // Main chart pane

        // Create a Set to track processed study IDs to avoid duplicates
        const processedStudyIds = new Set<EntityId>();

        // Get detailed study information including price scale settings
        const detailedStudies = studies
          .filter((study) => {
            // Skip if we've already processed this study ID
            if (processedStudyIds.has(study.id)) {
              return false;
            }
            // Add to processed set and keep this study
            processedStudyIds.add(study.id);
            return true;
          })
          .map((study) => {
            try {
              // Get the study instance
              const studyApi = chart.getStudyById(study.id);
              if (!studyApi) {
                return null;
              }

              // Get study properties including visibility
              const isVisible = studyApi.isVisible();

              // Create a properly typed study info object with initialized options
              const studyInfo: StudyInfo = {
                id: study.id,
                name: study.name,
                options: {
                  visible: isVisible,
                  priceScale: 'right', // Temporary default
                },
              };

              // Try to determine the pane and price scale position
              try {
                // Find which pane contains this study
                const studyPane = panes.find((pane) => {
                  const leftPriceScales = pane.getLeftPriceScales();
                  const rightPriceScales = pane.getRightPriceScales();

                  // Check if study is on any price scale in this pane
                  return [...leftPriceScales, ...rightPriceScales].some(
                    (scale) => {
                      const studies = scale.getStudies();
                      return studies.includes(study.id);
                    },
                  );
                });

                if (studyPane) {
                  // Save pane information
                  const paneIndex = panes.indexOf(studyPane);
                  studyInfo.options.paneIndex = paneIndex;

                  // Get the actual current height of the pane
                  try {
                    const currentHeight = studyPane.getHeight();
                    console.log(
                      `Saving pane ${paneIndex} height:`,
                      currentHeight,
                    );
                    studyInfo.options.paneHeight = currentHeight;
                  } catch (error) {
                    console.error(
                      `Error getting pane ${paneIndex} height:`,
                      error,
                    );
                  }

                  const leftScales = studyPane.getLeftPriceScales();
                  const rightScales = studyPane.getRightPriceScales();

                  const isOnLeftScale = leftScales.some((scale) => {
                    const studies = scale.getStudies();
                    return studies.includes(study.id);
                  });

                  const isOnRightScale = rightScales.some((scale) => {
                    const studies = scale.getStudies();
                    return studies.includes(study.id);
                  });

                  // Determine if study is overlay or on its own scale
                  if (studyPane === mainPane || paneIndex === 0) {
                    studyInfo.options.priceScale = 'overlay';
                    studyInfo.options.paneIndex = 0;
                    // Don't save height for overlay studies
                    delete studyInfo.options.paneHeight;
                  } else if (isOnLeftScale) {
                    studyInfo.options.priceScale = 'left';
                  } else if (isOnRightScale) {
                    studyInfo.options.priceScale = 'right';
                  }

                  // Get study inputs if available
                  try {
                    const inputValues = studyApi.getInputValues();
                    if (inputValues) {
                      // Convert array of input values to record
                      const inputs: Record<string, StudyInputValue> = {};
                      inputValues.forEach((input) => {
                        if (input.id && input.value !== undefined) {
                          inputs[input.id] = input.value;
                        }
                      });
                      studyInfo.inputs = inputs;
                    }
                  } catch (error) {
                    console.error('Error getting study inputs:', error);
                  }
                }
              } catch (error) {
                console.error(
                  'Error getting pane and price scale info:',
                  error,
                );
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

        // Log the studies with their pane heights before saving
        console.log(
          'Studies to save with heights:',
          detailedStudies.map((study) => ({
            name: study.name,
            id: study.id,
            paneIndex: study.options.paneIndex,
            paneHeight: study.options.paneHeight,
          })),
        );

        // Get saved studies from localStorage
        const savedStudies = JSON.parse(
          localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
        );

        // Check if any of the current study IDs exist in other symbols
        const studyIdsInUse = new Set<EntityId>();
        Object.entries(savedStudies).forEach(([savedSymbol, studies]) => {
          if (savedSymbol !== symbol && Array.isArray(studies)) {
            (studies as StudyInfo[]).forEach((study) => {
              studyIdsInUse.add(study.id);
            });
          }
        });

        // Filter out studies that have IDs already used by other symbols
        const validStudies = detailedStudies.filter((study) => {
          if (studyIdsInUse.has(study.id)) {
            console.log(
              `Skipping save for study ${study.name} (${study.id}) - ID already exists in another symbol`,
            );
            return false;
          }
          return true;
        });

        // Update studies for current symbol only if we have valid studies or if the key already exists
        if (validStudies.length > 0 || savedStudies[symbol]) {
          // Compare with existing studies to avoid unnecessary updates
          const existingStudies = savedStudies[symbol] || [];

          // Create maps for faster comparison
          const existingStudyMap = new Map(
            existingStudies.map((study: StudyInfo) => [study.id, study]),
          );
          const newStudyMap = new Map(
            validStudies.map((study) => [study.id, study]),
          );

          // Check if there are any changes by comparing study IDs and their properties
          const hasChanges =
            existingStudies.length !== validStudies.length ||
            validStudies.some((study) => {
              const existingStudy = existingStudyMap.get(study.id);
              return (
                !existingStudy ||
                JSON.stringify(study) !== JSON.stringify(existingStudy)
              );
            });

          if (hasChanges) {
            localStorage.setItem(
              STORAGE_KEY_STUDIES,
              JSON.stringify({
                ...savedStudies,
                [symbol]: validStudies,
              }),
            );
            console.log(
              `Saved ${validStudies.length} studies for ${symbol}:`,
              validStudies.map((s) => `${s.name} (${s.id})`),
            );
          }
        }
      } catch (error) {
        console.error('Error saving studies:', error);
      }
    }, SAVE_DEBOUNCE_DELAY);
  };

  // Save studies when they are modified
  widget.subscribe('study_event', (event) => {
    if (!event) return;
    if (!isChangingSymbol) {
      console.log('Study event triggered save');
      debouncedSaveStudies();
    }
  });

  // Add subscription for property changes
  widget.subscribe('series_properties_changed', () => {
    if (!isChangingSymbol) {
      console.log('Properties changed triggered save');
      debouncedSaveStudies();
    }
  });

  // Add subscription for price scale changes
  widget.subscribe('chart_load_requested', () => {
    if (!isChangingSymbol) {
      console.log('Chart load triggered save');
      debouncedSaveStudies();
    }
  });

  // Add subscription for pane resizing
  let resizeTimeout: NodeJS.Timeout | null = null;
  widget.subscribe('layout_changed', () => {
    if (!isChangingSymbol) {
      // Debounce the resize event to avoid too many saves
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        console.log('Layout changed (pane resize) triggered save');
        debouncedSaveStudies();
      }, 300); // Wait for resize to finish
    }
  });

  // Add subscription for pane changes (split/merge)
  widget.subscribe('panes_height_changed', () => {
    if (!isChangingSymbol) {
      console.log('Pane height changed triggered save');
      debouncedSaveStudies();
    }
  });

  // Update current symbol and load studies when chart is ready
  widget.onChartReady(() => {
    currentSymbol = getSymbolFromChart(widget);
    console.log('Chart ready, current symbol:', currentSymbol);

    // Only load studies on initial chart ready
    if (!hasLoadedInitialStudies && currentSymbol) {
      console.log('Loading initial studies');
      hasLoadedInitialStudies = true;
      loadStudiesForSymbol(widget, currentSymbol);
    }
  });

  return {
    setChangingSymbol: (changing: boolean) => {
      isChangingSymbol = changing;
      if (changing) {
        // Clear any pending saves when changing symbols
        if (saveTimeout) {
          clearTimeout(saveTimeout);
          saveTimeout = null;
        }
        pendingSaveSymbol = null;
      } else {
        // Update current symbol when symbol change is complete
        currentSymbol = getSymbolFromChart(widget);
        console.log('Symbol change complete, current symbol:', currentSymbol);
      }
    },
  };
}

/**
 * Function to load studies for a specific symbol
 * This should be called from the TradingChart component when the symbol changes
 * or when the chart is initially ready
 */
export function loadStudiesForSymbol(
  widget: IChartingLibraryWidget,
  symbol: TokenSymbol,
) {
  if (!widget || !symbol) return;

  // Handle special case for JITOSOL
  symbol = symbol === 'JITOSOL' ? 'SOL' : symbol;

  console.log(`Loading studies for ${symbol}`);

  try {
    // Get current studies on the chart
    const currentStudies = widget.activeChart().getAllStudies();
    console.log('Current studies on chart:', {
      count: currentStudies.length,
      details: currentStudies.map((s) => ({ id: s.id, name: s.name })),
    });

    // Load saved studies for this symbol from localStorage
    const savedStudies = getSavedStudies(symbol);
    console.log('Saved studies for symbol:', {
      count: savedStudies.length,
      details: savedStudies.map((s) => ({ id: s.id, name: s.name })),
    });

    // Create maps for faster lookups using study ID
    const savedStudyMap = new Map(
      savedStudies.map((study) => [study.id, study]),
    );
    const currentStudyMap = new Map(
      currentStudies.map((study) => [study.id, study]),
    );

    console.log('Study Maps:', {
      savedStudyIds: Array.from(savedStudyMap.keys()),
      currentStudyIds: Array.from(currentStudyMap.keys()),
    });

    // 1. Remove studies that shouldn't be there
    const studyRemovalPromises = currentStudies.map(async (study) => {
      console.log('Checking study for removal:', {
        id: study.id,
        name: study.name,
        isInSavedMap: savedStudyMap.has(study.id),
      });
      if (!savedStudyMap.has(study.id)) {
        try {
          console.log(
            `Removing study not in saved list: ${study.name} (${study.id})`,
          );
          await widget.activeChart().removeEntity(study.id);
        } catch (error) {
          console.error(
            `Error removing study ${study.name} (${study.id}):`,
            error,
          );
        }
      }
    });

    // 2. Add missing studies
    Promise.all(studyRemovalPromises).then(async () => {
      // Sort saved studies to ensure proper order (overlays first)
      const newStudies = savedStudies.filter((study) => {
        const shouldCreate = !currentStudyMap.has(study.id);
        console.log('Study creation check:', {
          id: study.id,
          name: study.name,
          isInCurrentMap: currentStudyMap.has(study.id),
          shouldCreate,
        });
        return shouldCreate;
      });

      const sortedNewStudies = sortStudiesByPaneIndex(newStudies);

      console.log('Studies to create:', {
        beforeSort: newStudies.map((s) => ({
          id: s.id,
          name: s.name,
          paneIndex: s.options.paneIndex,
        })),
        afterSort: sortedNewStudies.map((s) => ({
          id: s.id,
          name: s.name,
          paneIndex: s.options.paneIndex,
        })),
      });

      // Wait for main pane to be ready before adding new studies
      await waitForMainPane(widget);

      // Track pane heights to apply after all studies are created
      const paneHeights = new Map<number, number>();

      // Add each missing study sequentially
      for (const study of sortedNewStudies) {
        try {
          const isOverlay =
            study.options.priceScale === 'overlay' ||
            study.options.paneIndex === 0;
          const priceScale = toStudyPriceScale(study.options.priceScale);

          // Prepare study overrides including price scale and visibility
          const studyOverrides = {
            ...study.overrides,
            visible: study.options.visible,
          };

          console.log('[Study Creation] Creating:', {
            name: study.name,
            id: study.id,
            isOverlay,
            priceScale,
            inputs: study.inputs,
            overrides: studyOverrides,
            paneHeight: study.options.paneHeight,
          });

          // Create the study with all properties set during creation
          const studyId = await widget.activeChart().createStudy(
            study.name,
            isOverlay, // forceOverlay
            false, // lock
            study.inputs,
            studyOverrides,
          );

          if (!studyId) {
            console.error('[Study Creation] Failed:', study.name);
            continue;
          }

          console.log('[Study Creation] Success:', {
            name: study.name,
            oldId: study.id,
            newId: studyId,
            isOverlay,
            priceScale,
          });

          // For non-overlay studies, set the price scale and pane position
          if (!isOverlay) {
            const studyApi = widget.activeChart().getStudyById(studyId);
            if (studyApi) {
              studyApi.changePriceScale(priceScale);

              // Move to correct pane if specified
              if (
                study.options.paneIndex !== undefined &&
                study.options.paneIndex > 0
              ) {
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

                  // Store pane height to apply later
                  if (study.options.paneHeight) {
                    paneHeights.set(
                      study.options.paneIndex,
                      study.options.paneHeight,
                    );
                  }
                }
              }
            }
          }

          // Small delay between studies to ensure proper initialization
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `Error creating study ${study.name} (${study.id}):`,
            error,
          );
        }
      }

      // Function to apply pane heights with retries
      const applyPaneHeights = async (retryCount = 0, maxRetries = 5) => {
        console.log(
          `Attempting to apply pane heights (attempt ${retryCount + 1})`,
        );
        const panes = widget.activeChart().getPanes();
        let allHeightsApplied = true;

        paneHeights.forEach((height, paneIndex) => {
          if (paneIndex < panes.length) {
            try {
              const currentHeight = panes[paneIndex].getHeight();
              console.log(
                `Pane ${paneIndex} - Current height: ${currentHeight}, Target height: ${height}`,
              );

              if (currentHeight !== height) {
                console.log(`Setting pane ${paneIndex} height to ${height}`);
                panes[paneIndex].setHeight(height);
                allHeightsApplied = false;
              }
            } catch (error) {
              console.error(
                `Error setting height for pane ${paneIndex}:`,
                error,
              );
              allHeightsApplied = false;
            }
          }
        });

        if (!allHeightsApplied && retryCount < maxRetries) {
          console.log(
            `Not all heights applied correctly, retrying in 200ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return applyPaneHeights(retryCount + 1, maxRetries);
        }
      };

      // Wait for a bit to let the chart layout stabilize, then apply heights
      console.log(
        'Waiting for chart layout to stabilize before applying pane heights...',
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Apply pane heights with retries
      if (paneHeights.size > 0) {
        console.log('Applying pane heights:', Object.fromEntries(paneHeights));
        await applyPaneHeights();
      }
    });
  } catch (error) {
    console.error(`Error loading studies for ${symbol}:`, error);
  }
}
