import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * This div automatically apply scale() effect to the children, so it fits the container width.
 */
export default function AutoScalableDiv({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const wrapperDiv = useRef<HTMLDivElement>(null);
  const containerDiv = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleResize = useCallback(() => {
    if (wrapperDiv.current && containerDiv.current) {
      const containerWidth = containerDiv.current.scrollWidth;
      const wrapperWidth = wrapperDiv.current.offsetWidth;

      const scale = wrapperWidth / containerWidth;

      containerDiv.current.style.transform = `scale(${scale})`;

      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, wrapperDiv, containerDiv]);

  useEffect(() => {
    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());

    if (wrapperDiv.current) {
      resizeObserver.observe(wrapperDiv.current);
    }

    if (containerDiv.current) {
      resizeObserver.observe(containerDiv.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  return (
    <div
      className={twMerge(
        'w-full h-full overflow-visible max-w-full flex items-center justify-center',
        className,
      )}
      ref={wrapperDiv}
    >
      <div
        className={twMerge(
          'w-auto h-auto flex shrink-0',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
        ref={containerDiv}
      >
        {children}
      </div>
    </div>
  );
}
