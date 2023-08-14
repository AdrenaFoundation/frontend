import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { useOnClickOutside } from '@/hooks/onClickOutside';

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
  useOnClickOutside(ref, () => {
    onClose();
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.1 }}
          className={twMerge(
            'absolute flex flex-col border border-gray-200 bg-dark rounded-lg shadow-lg mt-2 overflow-hidden z-10 w-full',
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
