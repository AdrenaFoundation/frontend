import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import copyIcon from '@/../../public/images/copy.svg';
import { addNotification } from '@/utils';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  wrapperClassName?: string;
  notificationTitle?: string;
}

export default function CopyButton({
  textToCopy,
  className = 'w-3 h-3 cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-300 mr-2',
  wrapperClassName,
  notificationTitle = 'Text copied to clipboard',
}: CopyButtonProps) {
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
    <div className={twMerge('inline-flex', wrapperClassName)}>
      <Image
        src={copyIcon}
        alt="copy icon"
        width={12}
        height={12}
        className={twMerge(
          'w-3 h-3 opacity-90 cursor-pointer hover:opacity-100 mr-2',
          className,
        )}
        onClick={handleCopy}
      />
    </div>
  );
}
