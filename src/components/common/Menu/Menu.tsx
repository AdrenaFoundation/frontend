import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useOnClickOutside } from '@/hooks/onClickOutside';

export default function Menu({
  trigger,
  className,
  openMenuClassName,
  children,
  withBorder,
  disabled,
}: {
  trigger: ReactNode;
  className?: string;
  openMenuClassName?: string;
  children: ReactNode;
  withBorder?: boolean;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Note 1: Clicks outside of parent trigger onClose
  // Note 2: Parent require 'relative' class
  useOnClickOutside(ref, () => {
    setIsMenuOpen(!isMenuOpen);
  });

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      <div
        className={twMerge('relative', className)}
        onClick={() => !disabled && setIsMenuOpen(!isMenuOpen)}
      >
        <div
          className={twMerge(
            'flex h-full w-full border border-transparent',
            isMenuOpen && withBorder ? 'border-white' : '',
          )}
        >
          {trigger}
        </div>

        {isMenuOpen && (
          <motion.div
            ref={ref}
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.3 }}
            className={twMerge(
              'absolute flex flex-col bg-dark overflow-hidden z-50 border mt-2',
              withBorder ? 'border border-white' : '',
              openMenuClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
