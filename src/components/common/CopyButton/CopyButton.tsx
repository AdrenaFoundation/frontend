import Image from 'next/image';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import copyIcon from '@/../../public/images/copy.svg';
import { addNotification } from '@/utils';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  notificationTitle?: string;
}

const CopyButton = forwardRef<HTMLDivElement, CopyButtonProps>(
  (
    { textToCopy, className, notificationTitle = 'Text copied to clipboard' },
    ref,
  ) => {
    const handleCopy = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await navigator.clipboard.writeText(textToCopy);
        addNotification({
          title: notificationTitle,
          message: '',
          type: 'info',
          duration: 'regular',
        });
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    return (
      <div ref={ref} className="inline-flex items-center justify-center">
        <Image
          src={copyIcon}
          alt="copy icon"
          width={12}
          height={12}
          className={twMerge(
            'w-3 h-3 cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-300',
            className,
          )}
          onClick={handleCopy}
        />
      </div>
    );
  },
);

CopyButton.displayName = 'CopyButton';

export default CopyButton;
