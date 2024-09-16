import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Checkbox from '../common/Checkbox/Checkbox';
import Modal from '../common/Modal/Modal';
import Link from 'next/link';

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
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] =
    useState<boolean>(false);

  const [acceptedTokenTermsAndConditions, setAcceptedTokenTermsAndConditions] =
    useState<boolean>(false);

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
        'max-w-full',
        'max-h-[40em]',
      )}
    >
      <div className="h-[10em] sm:h-[20em] max-h-[20%] w-full max-w-full overflow-auto flex flex-col relative">
        <iframe
          src="/TermsAndConditions.html"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="flex mt-4 items-center justify-center">
        <Checkbox
          checked={acceptedTermsAndConditions}
          className="h-4 w-4 shrink-0 rounded"
          onChange={(checked: boolean): void => {
            setAcceptedTermsAndConditions(checked);
          }}
        />
        <div className="flex ml-2">
          <div>I accept the</div>
          <Link
            href="https://docs.adrena.xyz/technical-documentation/terms-and-conditions"
            target="_blank"
            className="ml-1 underline"
          >
            Terms of Service
          </Link>
        </div>
      </div>

      <div className="h-[10em] sm:h-[20em] max-h-[20%] w-full max-w-full overflow-auto flex flex-col mt-4">
        <iframe
          src="/TokenTermsAndConditions.html"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="flex mt-4 items-center justify-center">
        <Checkbox
          checked={acceptedTokenTermsAndConditions}
          className="h-4 w-4 shrink-0 rounded"
          onChange={(checked: boolean): void => {
            setAcceptedTokenTermsAndConditions(checked);
          }}
        />
        <div className="flex ml-2">
          <div>I accept the</div>
          <Link
            href="https://docs.adrena.xyz/technical-documentation/token-terms-and-conditions"
            target="_blank"
            className="ml-1 underline"
          >
            Token Terms and Conditions
          </Link>
        </div>
      </div>

      <div className="flex w-full flex-row gap-3 mt-6 border-t border-grey max-w-full flex-wrap">
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
              disabled={
                !acceptedTermsAndConditions || !acceptedTokenTermsAndConditions
              }
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
