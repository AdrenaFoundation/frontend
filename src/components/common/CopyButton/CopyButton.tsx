import Image from 'next/image';

import copyIcon from '@/../../public/images/copy.svg';
import { addNotification } from '@/utils';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  notificationTitle?: string;
}

export default function CopyButton({
  textToCopy,
  className = 'w-3 h-3 opacity-90 cursor-pointer hover:opacity-100 mr-2',
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
    <Image
      src={copyIcon}
      alt="copy icon"
      width={12}
      height={12}
      className={className}
      onClick={handleCopy}
    />
  );
}
