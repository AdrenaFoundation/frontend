/**
 * Performance monitoring utilities for wallet operations
 */

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private enabled = process.env.NODE_ENV === 'development';

  startMeasure(componentName: string): () => void {
    if (!this.enabled) return () => {};

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      this.updateMetrics(componentName, renderTime);
    };
  }

  private updateMetrics(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      totalRenderTime: 0,
    };

    existing.renderCount++;
    existing.lastRenderTime = renderTime;
    existing.totalRenderTime += renderTime;
    existing.averageRenderTime =
      existing.totalRenderTime / existing.renderCount;

    this.metrics.set(componentName, existing);

    // Log performance warnings
    if (existing.renderCount > 10 && existing.averageRenderTime > 5) {
      console.warn(
        `🐌 Performance Warning: ${componentName} averaging ${existing.averageRenderTime.toFixed(2)}ms per render (${existing.renderCount} renders)`,
      );
    }

    if (existing.renderCount > 50) {
      console.error(
        `🚨 Performance Critical: ${componentName} has rendered ${existing.renderCount} times! Check for render loops.`,
      );
    }
  }

  getMetrics(): Record<string, PerformanceMetrics> {
    return Object.fromEntries(this.metrics);
  }

  reset() {
    this.metrics.clear();
  }

  logSummary() {
    if (!this.enabled) return;

    console.group('📊 Performance Summary');
    for (const [component, metrics] of this.metrics) {
      console.log(`${component}:`, {
        renders: metrics.renderCount,
        avgTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
        totalTime: `${metrics.totalRenderTime.toFixed(2)}ms`,
      });
    }
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Hook for easy component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return;

  const endMeasure = performanceMonitor.startMeasure(componentName);

  // End measurement on next tick
  setTimeout(endMeasure, 0);
}
