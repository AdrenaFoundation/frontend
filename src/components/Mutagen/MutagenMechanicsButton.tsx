import { ReactNode, useState } from 'react';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import FactionsDocs from '@/components/pages/ranked/factions/FactionsDocs';

export default function MutagenMechanicsButton({
  title = 'Mutagen Mechanics',
  buttonVariant = 'lightbg',
  size = 'sm',
  className,
  modalClassName,
  modalWrapperClassName,
  headerTitle,
  onOpen,
  onClose,
  showLegacySections,
}: {
  title?: ReactNode;
  buttonVariant?: 'primary' | 'secondary' | 'info' | 'text' | 'outline' | 'danger' | 'lightbg' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string; // button className
  modalClassName?: string; // inner modal content container
  modalWrapperClassName?: string; // outer modal wrapper
  headerTitle?: ReactNode; // overrides modal header title
  onOpen?: () => void;
  onClose?: () => void;
  showLegacySections?: boolean; // forward to FactionsDocs
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        title={title}
        variant={buttonVariant}
        size={size}
        className={className}
        onClick={() => {
          setOpen(true);
          onOpen?.();
        }}
      />

      {open ? (
        <Modal
          title={headerTitle ?? 'Mutagen Mechanics'}
          close={() => {
            setOpen(false);
            onClose?.();
          }}
          className={
            // scrollable content area sized for docs
            `${modalClassName ?? ''} p-4 w-[min(64em,95vw)] max-h-[80vh] overflow-y-auto`
          }
          wrapperClassName={modalWrapperClassName}
        >
          <FactionsDocs showLegacySections={showLegacySections} />
        </Modal>
      ) : null}
    </>
  );
}
