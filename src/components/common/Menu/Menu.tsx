import { ReactNode, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Menu({
  className,
  children,
  open,
  onClose,
}: {
  className?: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Note 1: Clicks outside of parent trigger onClose
  // Note 2: Parent require 'relative' class
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target;

      // Click happened inside of parent, do nothing
      if (target && ref.current?.parentNode?.contains(target as Node)) {
        return;
      }

      // Click happened outside of parent, close the menu
      return onClose();
    };

    window.addEventListener('mousedown', clickHandler);

    return () => {
      window.removeEventListener('mousedown', clickHandler);
    };
  }, [onClose, ref]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={twMerge(
        'bg-main',
        'p-4',
        'absolute',
        'border',
        'border-grey',
        'flex',
        'flex-col',
        'items-start',
        className,
      )}
    >
      {children}
    </div>
  );
}
