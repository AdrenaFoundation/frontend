import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import closeBtnIcon from '../../../../public/images/Icons/cross-blue.svg';

// Create Portal container targetting specific id
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

const Modal = ({
  title,
  children,
  close,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  close: () => void;
  className?: string;
}) => {
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
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        exit={{ opacity: 0, transform: 'translateY(-20px)' }}
      >
        <div
          className="absolute w-full h-full bg-black/70 z-[101] shadow-lg"
          onClick={() => close()}
        />

        <div
          className="min-w-20 min-h-10 z-[102] rounded-lg border bg-secondary mx-4 overflow-hidden"
          role="dialog"
        >
          <div className="h-8 w-full flex items-center justify-start border-b border-grey pl-4 pr-4 relative overflow-hidden bg-highlight">
            <div className="flex text-lg uppercase text-main font-special h-full items-center justify-center opacity-80">
              <span className="text-main text-xl mr-1 opacity-50">{'>>>'}</span>{' '}
              {title}
            </div>

            <div className="h-full absolute right-2 top-0 flex items-center justify-center pl-1 rounded-tr-lg">
              <Image
                className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300"
                src={closeBtnIcon}
                alt="close icon"
                width={25}
                height={25}
                onClick={() => close()}
              />
            </div>
          </div>

          <div className={className}>{children}</div>
        </div>
      </motion.div>
    </PortalContainer>
  );
};

export default Modal;
