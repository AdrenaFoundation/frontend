import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { formatMilliseconds } from '@/utils';

import warningImg from '../../../../public/images/Icons/warning.png';

export default function RemainingTimeToDate({
  className,
  timestamp,
}: {
  className?: string;
  timestamp: number;
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
        <Image
          className="w-auto h-[1.5em] mr-1"
          src={warningImg}
          alt="Error icon"
        />
      ) : null}

      {remaining !== null ? formatMilliseconds(remaining) : '-'}
    </div>
  );
}
