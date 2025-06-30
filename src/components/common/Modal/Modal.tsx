import { motion, useDragControls } from 'framer-motion';
import Image from 'next/image';
import { PointerEvent, ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

import adrenaLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import closeBtnIcon from '../../../../public/images/Icons/cross.svg';

// Create Portal container targeting specific id
export const PortalContainer = ({ children }: { children: ReactNode }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    // Look for container in the DOM
    const container = document.getElementById('modal-container');

    if (!container) {
      // Should never happens
      throw new Error('Portal container not found');
    }

    setPortalContainer(container);
  }, []);

  if (portalContainer === null) {
    return null;
  }

  return createPortal(children, portalContainer);
};

export default function Modal({
  title,
  children,
  close,
  className,
  wrapperClassName,
  customTitle,
  isWrapped = true,
  header = true,
  disableFade = false,
}: {
  title?: ReactNode;
  customTitle?: ReactNode;
  children: ReactNode;
  close: () => void;
  className?: string;
  wrapperClassName?: string;
  isWrapped?: boolean;
  header?: boolean;
  disableFade?: boolean;
}) {
  const isMobile = useBetterMediaQuery('(max-width: 955px)');
  const controls = useDragControls();

  function startDrag(event: PointerEvent<Element> | PointerEvent) {
    controls.start(event);
  }

  // disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handler = (evt: KeyboardEvent) => {
      if (evt.key !== 'Escape') return;

      close();
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <PortalContainer>
      <motion.div
        className="fixed w-full h-full flex justify-center items-center z-[100] overflow-y-auto"
        initial={{
          opacity: 0,
          transform: `translateY(${isMobile ? '20px' : '-20px'})`,
        }}
        animate={{ opacity: 1, transform: 'translateY(-0px)' }}
        exit={{
          opacity: 0,
          transform: `translateY(${isMobile ? '20px' : '-20px'})`,
        }}
      >
        <div
          className="absolute w-full h-full bg-black/70 z-[101] shadow-lg"
          onClick={() => close()}
        />

        <motion.div
          className={twMerge(
            'min-w-20 min-h-20 z-[102] bg-secondary rounded-lg border overflow-hidden flex flex-col items-center relative',
            !isMobile ? '-mt-[8%] mx-4' : 'mt-auto rounded-b-none w-full',
            wrapperClassName,
          )}
          role="dialog"
          drag="y"
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragControls={controls}
          onDragEnd={() => close()}
        >
          {header ? (
            <div
              className={twMerge(
                'h-12 w-full flex items-center justify-start border-b  pl-4 pr-4 relative overflow-hidden bg-secondary',
                !isWrapped && 'sm:hidden',
              )}
              onPointerDown={isMobile ? startDrag : undefined}
              style={{ touchAction: 'none' }}
            >
              {!isMobile && (
                <div className="flex text-md text-white/90 font-special h-full items-center justify-center opacity-80">
                  <Image
                    className="relative h-[1.4em] w-[1.4em]"
                    alt="adrena logo"
                    src={adrenaLogo}
                    width={40}
                    height={40}
                  />
                  {title && (
                    <div className="ml-4 text-xl font-archivo">{title}</div>
                  )}

                  {customTitle}
                </div>
              )}

              {isMobile && (
                <div className="w-32 h-1 bg-white rounded-full m-auto" />
              )}

              {!isMobile && (
                <div className="h-full absolute right-2 flex items-center justify-center pl-1 rounded-tr-lg">
                  <Image
                    className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300"
                    src={closeBtnIcon}
                    alt="close icon"
                    width={25}
                    height={25}
                    onClick={() => close()}
                  />
                </div>
              )}
            </div>
          ) : null}

          <div className={twMerge('relative', className)}>
            {children}{' '}
            {!disableFade ? <div className="sticky bottom-0 h-[30px] sm:h-0 w-full bg-gradient-to-b from-transparent to-secondary z-20" /> : null}
          </div>
        </motion.div>
      </motion.div>
    </PortalContainer>
  );
}
