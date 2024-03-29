import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import closeBtnIcon from '../../../../public/images/Icons/cross.svg';

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
          className="min-w-20 min-h-10 z-[102] rounded-2xl border border-gray-200 bg-gray-300 mx-4"
          role="dialog"
        >
          <div className="h-14 w-full flex flex-row items-center justify-center border-b border-grey pl-4 pr-4 pt-2 relative overflow-hidden">
            <div className="text-lg font-bold uppercase">{title}</div>

            <div className="w-10 h-10 bg-third absolute right-0 top-0 border-l flex items-center justify-center rounded-bl-2xl rounded-tr-2xl pl-1">
              <Image
                className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300"
                src={closeBtnIcon}
                alt="close icon"
                width={24}
                height={24}
                onClick={() => close()}
              />
            </div>
          </div>

          <div className={className ?? ''}>{children}</div>
        </div>
      </motion.div>
    </PortalContainer>
  );
};

export default Modal;
