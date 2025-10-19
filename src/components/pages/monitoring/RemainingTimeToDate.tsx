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
  // If true doesn't show warning
  stopAtZero = false,
}: {
  className?: string;
  classNameTime?: string;
  timestamp: number;
  tippyText?: string;
  stopAtZero?: boolean;
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
      {remaining !== null && remaining < 0 && !stopAtZero ? (
        <Tippy content={tippyText} placement="auto">
          <Image
            className="w-auto h-[1.5em] mr-1"
            src={warningImg}
            alt="Error icon"
            width={16}
            height={16}
          />
        </Tippy>
      ) : null}

      <div className={twMerge('font-mono', classNameTime)}>
        {remaining !== null
          ? formatMilliseconds(remaining < 0 && stopAtZero ? 0 : remaining)
          : '-'}
      </div>
    </div>
  );
}
