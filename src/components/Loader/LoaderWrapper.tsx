import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function LoaderWrapper({
  children,
  height,
  isLoading,
  className,
  loaderClassName,
}: {
  children: React.ReactNode;
  height: string;
  isLoading: boolean;
  className?: string;
  loaderClassName?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {!isLoading && (
        <motion.div
          key="children"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={twMerge(
            'bg-[#050D14] animate-loader rounded-md border border-white/10',
            loaderClassName,
          )}
          style={{ height }}
        />
      )}
    </AnimatePresence>
  );
}
