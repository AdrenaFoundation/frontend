import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '../Button/Button';
import Modal from '../Modal/Modal';

export default function YesOrNoModal({
  isOpen,
  title,
  onYesClick,
  onNoClick,
  onClose,
  body,
  yesTitle,
  yesClassName,
  noTitle,
  noClassName,
  yesVariant = 'primary',
  noVariant = 'red',
  className,
}: {
  isOpen: boolean;
  title: string;
  onYesClick: () => void | Promise<void>;
  onNoClick: () => void | Promise<void>;
  onClose: () => void;
  body?: ReactNode;
  yesTitle: string;
  yesClassName?: string;
  noTitle: string;
  noClassName?: string;
  yesVariant?: Parameters<typeof Button>[0]['variant'];
  noVariant?: Parameters<typeof Button>[0]['variant'];
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <Modal
      title={title}
      close={onClose}
      className={twMerge('min-w-[22em] pl-8 pr-8 pb-8 pt-4', className)}
    >
      {body ? (
        <>
          <div>{body}</div>
          <div className="h-[1px] w-full bg-bcolor mt-8"></div>
        </>
      ) : null}

      <div className="flex items-center justify-evenly mt-4">
        <Button
          className={twMerge('opacity-70 hover:opacity-100', yesClassName)}
          title={yesTitle}
          variant={yesVariant}
          onClick={() => onYesClick()}
        />

        <Button
          className={twMerge('opacity-70 hover:opacity-100', noClassName)}
          title={noTitle}
          variant={noVariant}
          onClick={() => onNoClick()}
        />
      </div>
    </Modal>
  );
}
