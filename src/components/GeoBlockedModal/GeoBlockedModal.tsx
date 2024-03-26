import { useRouter } from 'next/router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import TermsAndConditionsModal from '../TermsAndConditionsModal/TermsAndConditionsModal';

function GeoBlockedModal({
  className,
  isOpen,
  closeTrigger,
}: {
  className?: string;
  isOpen: boolean;
  closeTrigger: () => void;
}) {
  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);

  const router = useRouter();

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title="Geo-Blocked Restricted Access"
      close={() => {
        closeTrigger();
      }}
      className={twMerge(
        className,
        'flex',
        'flex-col',
        'items-center',
        'p-4',
        'max-h-[40em]',
        'max-w-[40em]',
      )}
    >
      <div className="h-full max-h-full overflow-auto flex flex-col">
        <div className="text-lg mt-4 flex text-wrap max-w-3xl text-center pl-4 pr-4">
          Oops! Looks like you&apos;ve wandered into a territory where the
          monsters aren&apos;t allowed to trade. You can still roam around and
          observe in read-only mode, though!
        </div>

        <div className="flex flex-col mt-4 sm:mt-12 gap-4">
          <Button
            title="See Terms and conditions"
            variant="primary"
            onClick={() => {
              setIsTermsAndConditionModalOpen(true);
            }}
          />

          <Button
            title="Continue browsing in read-only mode"
            variant="secondary"
            onClick={() => {
              closeTrigger();
            }}
          />
        </div>

        <TermsAndConditionsModal
          isOpen={isTermsAndConditionModalOpen}
          readonly={true}
          closeTrigger={() => {
            setIsTermsAndConditionModalOpen(false);
          }}
        />
      </div>
    </Modal>
  );
}

export default GeoBlockedModal;
