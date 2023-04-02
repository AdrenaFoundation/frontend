import { useEffect, ReactNode, useState } from 'react';
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
      <div
        className={twMerge(
          'fixed',
          'w-full',
          'h-full',
          'flex',
          'justify-center',
          'items-center',
          'z-[100]',
        )}
      >
        <div
          className="absolute w-full h-full bg-black/70 z-[101]"
          onClick={() => close()}
        />

        <div
          className="min-w-20 min-h-10 bg-main z-[102] rounded"
          role="dialog"
        >
          <div
            className={twMerge(
              'bg-main',
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
            <span className="text-md">{title}</span>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-3 h-3 cursor-pointer hover:opacity-90"
                src="/images/cross.svg"
                alt="close icon"
                onClick={() => close()}
              />
            }
          </div>

          <div className={className ?? ''}>{children}</div>
        </div>
      </div>
    </PortalContainer>
  );
};

export default Modal;
