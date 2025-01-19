import { AnimatePresence, motion } from 'framer-motion';
import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

import { useOnClickOutside } from '@/hooks/onClickOutside';

export default function Menu({
  trigger,
  className,
  openMenuClassName,
  menuOpenBorderClassName,
  children,
  withBorder,
  disabled,
  disableOnClickInside = false,
  isDim = false,
  openMenuTriggerType = 'click',
}: {
  trigger: ReactNode;
  className?: string;
  openMenuClassName?: string;
  menuOpenBorderClassName?: string;
  children: ReactNode;
  withBorder?: boolean;
  disabled?: boolean;
  disableOnClickInside?: boolean;
  isDim?: boolean;
  openMenuTriggerType?: 'click' | 'hover';
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Note 1: Clicks outside of parent trigger onClose
  useOnClickOutside(ref, () => {
    setIsMenuOpen(!isMenuOpen);
  });

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const closeMenu = (el: ReactMouseEvent<HTMLDivElement>) => {
    el.stopPropagation();

    if (ref.current?.contains(el.target as Node) && disableOnClickInside) {
      return;
    }

    setIsMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        <div
          className={twMerge('relative', className)}
          onClick={() => {
            if (openMenuTriggerType !== 'click') return;
            if (disabled) return;

            setIsMenuOpen(!isMenuOpen);
          }}
          onMouseEnter={() => {
            if (openMenuTriggerType !== 'hover') return;
            if (disabled) return;

            setIsMenuOpen(true);
          }}
          onMouseLeave={() => {
            if (openMenuTriggerType !== 'hover') return;
            if (disabled) return;

            setIsMenuOpen(false);
          }}
        >
          <div
            className={twMerge(
              'flex h-full w-full border border-transparent',
              isMenuOpen && withBorder
                ? twMerge('bg-secondary', menuOpenBorderClassName)
                : '',
            )}
          >
            {trigger}
          </div>

          {isMenuOpen ? (
            <motion.div
              ref={ref}
              initial="hidden"
              animate="visible"
              onClick={(e) => closeMenu(e)}
              variants={variants}
              transition={{ duration: 0.3 }}
              className={twMerge(
                'absolute flex flex-col bg-third overflow-hidden z-50 border mt-2 rounded-md',
                withBorder ? 'border bg-third shadow-lg' : '',
                openMenuClassName,
              )}
            >
              {children}
            </motion.div>
          ) : null}
        </div>
      </AnimatePresence>

      {isDim && isMenuOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-full h-full bg-black/75 z-30"
        />
      ) : null}
    </>
  );
}
