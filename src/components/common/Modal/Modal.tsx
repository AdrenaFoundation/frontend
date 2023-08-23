import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

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
  title: string;
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
        className={twMerge(
          'fixed',
          'w-full',
          'h-full',
          'flex',
          'justify-center',
          'items-center',
          'z-[100]',
        )}
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        exit={{ opacity: 0, transform: 'translateY(-20px)' }}
      >
        <div
          className="absolute w-full h-full bg-black/70 z-[101] shadow-lg"
          onClick={() => close()}
        />

        <div
          className="min-w-20 min-h-10 z-[102] rounded-lg border border-gray-300 bg-gray-200 mx-4"
          role="dialog"
        >
          <div
            className={twMerge(
              'h-14',
              'w-full',
              'flex',
              'flex-row',
              'items-center',
              'justify-between',
              'border-b',
              'border-grey',
              'pl-4',
              'pr-4',
            )}
          >
            <span className="text-sm opacity-50">{title}</span>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300"
                src="/images/icons/close-btn.svg"
                alt="close icon"
                onClick={() => close()}
              />
            }
          </div>

          <div className={className ?? ''}>{children}</div>
        </div>
      </motion.div>
    </PortalContainer>
  );
};

export default Modal;
