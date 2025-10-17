import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  startImmediately?: boolean;
}

const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0, 0, 0)',
  width,
  height,
  className,
  maxOpacity = 0.3,
  startImmediately = false,
  ...props
}: FlickeringGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(startImmediately);

  const gridStateRef = useRef<{
    squares: Float32Array;
    cols: number;
    rows: number;
    dpr: number;
    lastMaxOpacity: number;
  }>({
    squares: new Float32Array(0),
    cols: 0,
    rows: 0,
    dpr: 1,
    lastMaxOpacity: maxOpacity,
  });

  const memoizedColor = useMemo(() => {
    const toRGBA = (colorValue: string) => {
      if (typeof window === 'undefined') return `rgba(0,0,0,`;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tempCanvas.height = 1;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return `rgba(0,0,0,`;
      ctx.fillStyle = colorValue;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r},${g},${b},`;
    };
    return toRGBA(color);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    gridStateRef.current.dpr = dpr;

    const updateGridStructure = () => {
      const currentWidth = width || container.clientWidth;
      const currentHeight = height || container.clientHeight;

      if (
        canvas.width !== currentWidth * dpr ||
        canvas.height !== currentHeight * dpr
      ) {
        canvas.width = currentWidth * dpr;
        canvas.height = currentHeight * dpr;
        canvas.style.width = `${currentWidth}px`;
        canvas.style.height = `${currentHeight}px`;
      }

      // Calculate grid size based on container dimensions
      const maxCols = Math.ceil(currentWidth / (squareSize + gridGap));
      const maxRows = Math.ceil(currentHeight / (squareSize + gridGap));

      if (
        maxCols !== gridStateRef.current.cols ||
        maxRows !== gridStateRef.current.rows ||
        maxOpacity !== gridStateRef.current.lastMaxOpacity
      ) {
        gridStateRef.current.cols = maxCols;
        gridStateRef.current.rows = maxRows;

        // Use Uint8Array instead of Float32Array for smaller memory footprint
        const totalSquares = maxCols * maxRows;
        if (gridStateRef.current.squares.length !== totalSquares) {
          gridStateRef.current.squares = new Float32Array(totalSquares);
        }

        // Initialize with more efficient approach
        const squares = gridStateRef.current.squares;
        for (let i = 0; i < squares.length; i++) {
          squares[i] = Math.random() * maxOpacity;
        }
        gridStateRef.current.lastMaxOpacity = maxOpacity;
      }
    };

    updateGridStructure();
    const resizeObserver = new ResizeObserver(updateGridStructure);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [width, height, squareSize, gridGap, maxOpacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInView) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    const TARGET_FPS = 30; // Reduce from 60fps to 30fps
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;

      // Throttle to target FPS to reduce CPU/memory usage
      if (deltaTime < FRAME_INTERVAL) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      frameCount++;
      lastTime = time;
      const { squares, cols, rows, dpr } = gridStateRef.current;

      // Update fewer squares per frame to reduce computation
      const updatesPerFrame = Math.max(1, Math.floor(squares.length * 0.1)); // Only update 10% of squares per frame
      for (let i = 0; i < updatesPerFrame; i++) {
        const randomIndex = Math.floor(Math.random() * squares.length);
        if (Math.random() < flickerChance * (deltaTime / 1000)) {
          squares[randomIndex] = Math.random() * maxOpacity;
        }
        squares[randomIndex] = Math.min(squares[randomIndex], maxOpacity);
      }

      // Only clear and redraw every few frames to reduce canvas operations
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Batch similar operations together
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const index = i * rows + j;
            if (index < squares.length) {
              const currentOpacity = squares[index];
              // Only draw if opacity is above threshold to reduce draw calls
              if (currentOpacity > 0.01) {
                ctx.fillStyle = `${memoizedColor}${currentOpacity})`;
                ctx.fillRect(
                  i * (squareSize + gridGap) * dpr,
                  j * (squareSize + gridGap) * dpr,
                  squareSize * dpr,
                  squareSize * dpr,
                );
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, memoizedColor, flickerChance, maxOpacity, squareSize, gridGap]);

  useEffect(() => {
    if (startImmediately) {
      if (!isInView) setIsInView(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    let currentEntry: IntersectionObserverEntry | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        currentEntry = entry;
        if (entry) setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(canvas);

    // Add cleanup for memory management
    const cleanup = () => {
      if (!document.hidden && currentEntry && !currentEntry.isIntersecting) {
        // Clear canvas when not visible to free memory
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    document.addEventListener('visibilitychange', cleanup);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', cleanup);
    };
  }, [startImmediately, isInView]);

  return (
    <div
      ref={containerRef}
      className={twMerge('h-full w-full', className)}
      {...props}
    >
      <canvas ref={canvasRef} className="pointer-events-none" />
    </div>
  );
};

interface GeneratedGridSettings {
  color: string;
  maxOpacity: number;
  flickerChance: number;
  squareSize: number;
  gridGap: number;
}

const GeneratedFlickerEffect = ({
  svgDataUrlForEffect,
  svgMaskGridSettingsForEffect = {
    color: '#FF5F1F',
    maxOpacity: 0.75,
    flickerChance: 0.08, // Reduced from 0.18
    squareSize: 4, // Increased from 3 to reduce grid count
    gridGap: 6, // Increased from 4 to reduce grid count
  },
  backgroundGridSettingsForEffect = {
    color: '#28282D',
    maxOpacity: 0.3, // Reduced from 0.4
    flickerChance: 0.2, // Reduced from 0.45
    squareSize: 4, // Increased from 3 to reduce grid count
    gridGap: 6, // Increased from 4 to reduce grid count
  },
  className,
}: {
  className?: string;
  svgDataUrlForEffect: string;
  svgMaskGridSettingsForEffect?: GeneratedGridSettings;
  backgroundGridSettingsForEffect?: GeneratedGridSettings;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add intersection observer to only run when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const maskStyle: React.CSSProperties | undefined = svgDataUrlForEffect
    ? {
        WebkitMaskImage: `url('${svgDataUrlForEffect}')`,
        WebkitMaskSize: 'contain',
        WebkitMaskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
        maskImage: `url('${svgDataUrlForEffect}')`,
        maskSize: 'contain',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={twMerge(
        'relative w-full h-full bg-transparent overflow-hidden',
        className,
      )}
    >
      <FlickeringGrid
        className="absolute inset-0 z-0"
        {...backgroundGridSettingsForEffect}
        startImmediately={isVisible}
      />
      {maskStyle && isVisible && (
        <div className="absolute inset-0 z-10" style={maskStyle}>
          <FlickeringGrid
            {...svgMaskGridSettingsForEffect}
            startImmediately={true}
          />
        </div>
      )}
    </div>
  );
};

export default GeneratedFlickerEffect;
