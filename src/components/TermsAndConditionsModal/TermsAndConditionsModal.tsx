import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';

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
        'flex flex-col items-center p-4 w-[25em] max-w-full max-h-[40em]',
      )}
    >
      <div className='flex text-sm text-center'>
        <p>
          <span className='text-txtfade'>Using this platform means that you agree to both our </span>
          <span
            className='font-boldy cursor-pointer opacity-90 hover:opacity-100'
            onClick={() => window.open("https://docs.adrena.xyz/technical-documentation/token-terms-and-conditions", "_blank")}
          >
            token terms and conditions
          </span>
          <span className='text-txtfade'> and </span>
          <span
            className='font-boldy cursor-pointer opacity-90 hover:opacity-100'
            onClick={() => window.open("https://docs.adrena.xyz/technical-documentation/terms-and-conditions", "_blank")}
          >
            terms of service
          </span>
          <span className='text-txtfade'>. Please read them carefully before proceeding.</span>
        </p>

        {/* <Link
          href="https://docs.adrena.xyz/technical-documentation/token-terms-and-conditions"
          target="_blank"
          className="flex gap-1 items-center font-boldy text-sm mb-2 opacity-80 hover:opacity-100"
        >
          Token Terms and Conditions

          <Image
            src={externalLinkLogo}
            alt="External link"
            className="w-3 h-3"
            width={20}
            height={20}
          />
        </Link> and terms of service. */}
      </div>

      <div className="flex w-full flex-row gap-2 mt-2 border-t pt-4 border-grey max-w-full">
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
              variant="lightbg"
              className="w-1/2"
              onClick={() => {
                if ('declineTrigger' in args) {
                  args.declineTrigger();
                }
              }}
            />

            <Button
              title="Accept"
              size="lg"
              className="w-1/2"
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
