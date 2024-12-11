import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';

import Button from '../common/Button/Button';
import Checkbox from '../common/Checkbox/Checkbox';
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
        'w-[30em]',
        'max-w-full',
        'max-h-[40em]',
      )}
    >
      <div className='flex flex-col pb-4'>
        <div className="flex mt-4 items-center justify-center w-full">
          <Checkbox
            checked={acceptedTermsAndConditions}
            className="h-6 w-6 shrink-0 rounded"
            onChange={(checked: boolean): void => {
              setAcceptedTermsAndConditions(checked);
            }}
          />

          <div className="flex ml-2 grow text-base sm:text-lg">
            <div>I accept the</div>

            <Link
              href="https://docs.adrena.xyz/technical-documentation/terms-and-conditions"
              target="_blank"
              className="ml-1 underline flex gap-1 items-center"
            >
              Terms of Service

              <Image
                src={externalLinkLogo}
                alt="External link"
                className="w-3 h-3"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>

        <div className="flex mt-4 items-center justify-center w-full">
          <Checkbox
            checked={acceptedTokenTermsAndConditions}
            className="h-6 w-6 shrink-0 rounded"
            onChange={(checked: boolean): void => {
              setAcceptedTokenTermsAndConditions(checked);
            }}
          />

          <div className="flex ml-2 grow text-base sm:text-lg">
            <div>I accept the</div>

            <Link
              href="https://docs.adrena.xyz/technical-documentation/token-terms-and-conditions"
              target="_blank"
              className="ml-1 underline flex gap-1 items-center"
            >
              Token Terms and Conditions

              <Image
                src={externalLinkLogo}
                alt="External link"
                className="w-3 h-3"
                width={20}
                height={20}
              />
            </Link>
          </div>
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
          </>
        )}
      </div>
    </Modal>
  );
}
