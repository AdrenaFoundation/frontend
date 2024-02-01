import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useOnClickOutside } from '@/hooks/onClickOutside';

export default function Menu({
  trigger,
  className,
  children,
}: {
  trigger: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Note 1: Clicks outside of parent trigger onClose
  // Note 2: Parent require 'relative' class
  useOnClickOutside(ref, () => {
    setIsMenuOpen(!isMenuOpen);
  });

  return (
    <AnimatePresence>
      <div className="relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {trigger}
        {isMenuOpen && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.1 }}
            className={twMerge(
              'absolute flex flex-col border border-gray-200 bg-dark rounded-xl shadow-lg mt-2 overflow-hidden z-10 w-full',
              className,
            )}
          >
            {children}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
