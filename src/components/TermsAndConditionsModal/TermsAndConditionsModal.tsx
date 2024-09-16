import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

export default function TermsAndConditionsModal({
  className,
  isOpen,
  // User don't agree or decline, just read it
  readonly = false,
  ...args
}:
  | {
      className?: string;
      isOpen: boolean;
      readonly: true;
      closeTrigger: () => void;
    }
  | {
      className?: string;
      isOpen: boolean;
      readonly: false;
      agreeTrigger: () => void;
      declineTrigger: () => void;
    }) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title="Terms and conditions"
      close={() => {
        if ('closeTrigger' in args) {
          args.closeTrigger();
        }
      }}
      className={twMerge(
        className,
        'flex',
        'flex-col',
        'items-center',
        'p-4',
        'w-[40em]',
        'max-w-[40em]',
        'max-h-[40em]',
      )}
    >
      <div className="h-[20em] w-full overflow-auto flex flex-col">
        <iframe src="/terms.html" style={{ width: '100%', height: '100vh' }} />
      </div>

      <div className="flex w-full flex-row gap-3  pt-6 mt-6 border-t border-grey">
        {readonly ? (
          <>
            <Button
              title="Close"
              size="lg"
              variant="primary"
              className="w-full"
              onClick={() => {
                if ('closeTrigger' in args) {
                  args.closeTrigger();
                }
              }}
            />
          </>
        ) : (
          <>
            <Button
              title="Decline"
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                if ('declineTrigger' in args) {
                  args.declineTrigger();
                }
              }}
            />

            <Button
              title="Agree"
              size="lg"
              className="w-full"
              onClick={() => {
                if ('agreeTrigger' in args) {
                  args.agreeTrigger();
                }
              }}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
