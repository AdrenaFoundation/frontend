import Image from 'next/image';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { ImageRef } from '@/types';

export default function StyledContainer({
  children,
  icon,
  title,
  subTitle,
  className,
  titleClassName,
  headerClassName,
  subTitleClassName,
  iconClassName,
  bodyClassName,
}: {
  children: ReactNode;
  icon?: ImageRef;
  title?: ReactNode;
  subTitle?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  subTitleClassName?: string;
  iconClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={twMerge(
        'flex flex-col bg-secondary w-full border rounded-lg p-3 z-20 relative',
        className,
      )}
    >
      <div
        className={twMerge(
          'flex flex-col justify-center',
          title || subTitle || icon ? 'pb-4' : '',
          headerClassName,
        )}
      >
        {icon ? (
          <Image
            className={twMerge('h-12 w-12 mr-3', iconClassName)}
            src={icon}
            alt="icon"
            width={60}
            height={60}
          />
        ) : null}

        <div className="flex flex-col">
          <h1 className={titleClassName}>{title}</h1>

          <h5 className={twMerge('opacity-50', subTitleClassName)}>
            {subTitle}
          </h5>
        </div>
      </div>

      <div className={twMerge('gap-4 flex flex-col', bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
