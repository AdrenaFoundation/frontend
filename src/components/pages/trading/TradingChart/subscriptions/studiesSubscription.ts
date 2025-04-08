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

  // Function to save studies with debounce to prevent excessive writes
  const saveStudies = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      try {
        // Don't save if we're in the middle of changing symbols
        if (isChangingSymbol) {
          console.log('Skipping save during symbol change');
          return;
        }

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
                  studyInfo.options.paneHeight = studyPane.getHeight();

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

        // Get saved studies from localStorage
        const savedStudies = JSON.parse(
          localStorage.getItem(STORAGE_KEY_STUDIES) ?? '{}',
        );

        // Update studies for current symbol only if we have studies or if the key already exists
        if (detailedStudies.length > 0 || savedStudies[symbol]) {
          // Compare with existing studies to avoid unnecessary updates
          const existingStudies = savedStudies[symbol] || [];

          // Create maps for faster comparison
          const existingStudyMap = new Map(
            existingStudies.map((study: StudyInfo) => [study.id, study]),
          );
          const newStudyMap = new Map(
            detailedStudies.map((study) => [study.id, study]),
          );

          // Check if there are any changes by comparing study IDs and their properties
          const hasChanges =
            existingStudies.length !== detailedStudies.length ||
            detailedStudies.some((study) => {
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
                [symbol]: detailedStudies,
              }),
            );
            console.log(
              `Saved ${detailedStudies.length} studies for ${symbol}:`,
              detailedStudies.map((s) => `${s.name} (${s.id})`),
            );
          }
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

  // Add subscription for property changes
  widget.subscribe('series_properties_changed', () => {
    saveStudies();
  });

  // Add subscription for price scale changes
  widget.subscribe('chart_load_requested', () => {
    saveStudies();
  });

  /**
   * Initial load function that will be called once the chart is ready
   */
  const loadStudiesOnReady = () => {
    widget.onChartReady(() => {
      console.log('Chart ready, loading studies');
      try {
        const currentSymbol = getSymbolFromChart(widget);
        if (!currentSymbol) {
          console.log('No symbol found, skipping study load');
          return;
        }

        console.log(`Loading studies for symbol: ${currentSymbol}`);

        // Load studies from localStorage
        const studiesForSymbol = getSavedStudies(currentSymbol);
        console.log('Studies found in localStorage:', studiesForSymbol);

        if (studiesForSymbol.length === 0) {
          console.log('No saved studies found for symbol');
          return;
        }

        // Sort studies by pane index to ensure correct order
        const sortedStudies = sortStudiesByPaneIndex(studiesForSymbol);
        console.log('Sorted studies to create:', sortedStudies);

        // Create a map to track created studies and their promises
        const studyCreationPromises: Promise<void>[] = [];
        const createdStudyIds = new Map<number, EntityId>();

        // Wait for main pane to be ready before adding studies
        waitForMainPane(widget).then(() => {
          console.log('Main pane ready, creating studies');

          // Add each study sequentially
          const createStudySequentially = async () => {
            for (const study of sortedStudies) {
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
                  isOverlay,
                  priceScale,
                  inputs: study.inputs,
                  overrides: studyOverrides,
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

                // Store the created study ID with its target pane index
                createdStudyIds.set(study.options.paneIndex ?? 0, studyId);

                console.log('[Study Creation] Success:', {
                  name: study.name,
                  id: studyId,
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

                        // Set pane height if specified
                        if (study.options.paneHeight) {
                          currentPane.setHeight(study.options.paneHeight);
                        }
                      }
                    }
                  }
                }

                // Small delay between studies to ensure proper initialization
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (error) {
                console.error(`Error creating study ${study.name}:`, error);
              }
            }
          };

          // Start the sequential creation process
          createStudySequentially().then(() => {
            console.log('Finished creating all studies');
          });
        });
      } catch (error) {
        console.error('Error loading studies on chart ready:', error);
      }
    });
  };

  // Call the initial load function
  loadStudiesOnReady();

  return {
    setChangingSymbol: (changing: boolean) => {
      isChangingSymbol = changing;
    },
  };
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

  widget.onChartReady(() => {
    try {
      console.log(`Loading studies for ${symbol} after symbol change`);

      // Get current studies on the chart
      const currentStudies = widget.activeChart().getAllStudies();
      console.log('Current studies on chart:', currentStudies);

      // Load saved studies for this symbol from localStorage
      const savedStudies = getSavedStudies(symbol);
      console.log('Saved studies for symbol:', savedStudies);

      // Create maps for faster lookups using study ID
      const savedStudyMap = new Map(
        savedStudies.map((study) => [study.id, study]),
      );
      const currentStudyMap = new Map(
        currentStudies.map((study) => [study.id, study]),
      );

      // 1. Remove studies that shouldn't be there
      const studyRemovalPromises = currentStudies.map(async (study) => {
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
        const sortedNewStudies = sortStudiesByPaneIndex(
          savedStudies.filter((study) => !currentStudyMap.has(study.id)),
        );

        console.log('New studies to create:', sortedNewStudies);

        // Wait for main pane to be ready before adding new studies
        await waitForMainPane(widget);

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

                    // Set pane height if specified
                    if (study.options.paneHeight) {
                      currentPane.setHeight(study.options.paneHeight);
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
      });
    } catch (error) {
      console.error(`Error loading studies for ${symbol}:`, error);
    }
  });
}
