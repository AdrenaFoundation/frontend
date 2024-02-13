import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

function TermsAndConditionsModal({
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
        'max-w-[40em]',
        'max-h-[40em]',
      )}
    >
      <div className="h-full max-h-full overflow-auto flex flex-col">
        <span className="text-sm">
          Welcome to Adrena! Our full Terms and Conditions are being carefully
          drafted.
        </span>
        <span className="mt-4 text-sm">
          By using our service, you agree to engage in good faith, understanding
          that formal terms will follow.
        </span>
        <span className="mt-2 text-sm">
          In the meantime, please note: Due to regulatory concerns, Adrena is
          not available in certain regions, including:
        </span>
        <ul className="mt-2 text-sm">
          <li>- The United States</li>
          <li>- China</li>
          <li>- India</li>
          <li>- Russia</li>
          <li>- Turkey</li>
          <li>- Bangladesh</li>
          <li>- Vietnam</li>
        </ul>
        <span className="mt-2 text-sm">We appreciate your understanding.</span>
        <span className="mt-4 text-sm">
          Adrena is in early access on Devnet, and we are thrilled to have you
          on board! Your feedback is invaluable to us, so please share your
          thoughts.
        </span>
        <span className="mt-4 text-sm">
          Thank you for your patience and support. Lets participate on the
          future of DeFi together!
        </span>
      </div>

      <div className="flex w-full justify-around pt-6 mt-6 border-t border-grey">
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
              title="[D]ecline"
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
              title="[A]gree"
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

export default TermsAndConditionsModal;
