import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

function Button(
  {
    title,
    onClick,
    className,
    leftIcon,
    rightIcon,
  }: {
    title: ReactNode;
    onClick: () => void;
    className?: string;
    leftIcon?: string;
    rightIcon?: string;
  },
  ref?: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      className={twMerge(
        'flex',
        'p-2',
        'items-center',
        'justify-center',
        'cursor-pointer',
        'rounded',
        'border',
        'border-grey',
        'hover:opacity-90',
        className,
      )}
      onClick={() => onClick()}
      ref={ref}
    >
      {leftIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={leftIcon} className="h-6 w-6 mr-2" alt="left icon" />
      ) : null}

      {title}

      {rightIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rightIcon} className="h-4 w-4 ml-2" alt="right icon" />
      ) : null}
    </div>
  );
}

export default React.forwardRef(Button);
