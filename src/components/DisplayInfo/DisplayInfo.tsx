import Image from 'next/image';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import infoIcon from '../../../public/images/Icons/info.svg';

export default function DisplayInfo({
  className,
  bodyClassName,
  body,
  displayIcon = true,
}: {
  className?: string;
  bodyClassName?: string;
  body: ReactNode;
  displayIcon?: boolean;
}) {
  return (
    <div
      className={twMerge(
        'bg-blue/20 p-1 border-dashed border rounded flex relative w-full text-sm',
        displayIcon ? 'pl-10' : '',
        className,
      )}
    >
      {displayIcon ? (
        <Image
          className="opacity-60 absolute left-3 top-auto bottom-auto"
          src={infoIcon}
          height={16}
          width={16}
          alt="Info icon"
        />
      ) : null}

      <div
        className={twMerge(
          'flex flex-col font-boldy opacity-75',
          !displayIcon ? 'text-center items-center justify-center' : '',
          bodyClassName,
        )}
      >
        {body}
      </div>
    </div>
  );
}
