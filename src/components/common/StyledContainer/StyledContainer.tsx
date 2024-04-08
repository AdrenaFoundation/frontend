import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function StyledContainer({
  children,
  title,
  className,
  titleClassName,
  bodyClassName,
}: {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={twMerge(
        'flex flex-col bg-secondary w-full border rounded-lg p-5 z-20 relative',
        className,
      )}
    >
      <div className={twMerge(title ? 'pb-4' : '', titleClassName)}>
        {title}
      </div>

      <div className={twMerge('gap-4 flex flex-col', bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
