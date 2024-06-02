import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { formatMilliseconds } from '@/utils';

import warningImg from '../../../../public/images/Icons/warning.png';

export default function RemainingTimeToDate({
  className,
  classNameTime,
  timestamp,
  tippyText,
}: {
  className?: string;
  classNameTime?: string;
  timestamp: number;
  tippyText: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(timestamp * 1000 - Date.now());
    }, 250);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className={twMerge('flex', className)}>
      {remaining !== null && remaining < 0 ? (
        <Tippy content={tippyText} placement="auto">
          <Image
            className="w-auto h-[1.5em] mr-1"
            src={warningImg}
            alt="Error icon"
          />
        </Tippy>
      ) : null}

      <span className={twMerge('text-mono', classNameTime)}>
        {remaining !== null ? formatMilliseconds(remaining) : '-'}
      </span>
    </div>
  );
}
