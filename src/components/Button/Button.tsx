import React, { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LoadingIcon from '../LoadingIcon/LoadingIcon';

function Button(
  {
    title,
    onClick,
    className,
    leftIcon,
    rightIcon,
    disabled,
    activateLoadingIcon,
  }: {
    title: ReactNode;
    onClick: () => Promise<void> | void;
    className?: string;
    leftIcon?: string;
    rightIcon?: string;
    disabled?: boolean;
    activateLoadingIcon?: boolean;
  },
  ref?: React.Ref<HTMLDivElement>,
) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div
      className={twMerge(
        'relative',
        'flex',
        'pt-2 pb-2 pl-4 pr-4',
        'items-center',
        'justify-center',
        'rounded',
        'border',
        'border-grey',
        !disabled && !loading && 'hover:opacity-90',
        disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer',
        (disabled || loading) && 'opacity-80',
        className,
      )}
      onClick={() => {
        if (disabled || loading) {
          return;
        }

        (async () => {
          setLoading(true);
          await onClick();
          setLoading(false);
        })();
      }}
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

      {loading && activateLoadingIcon ? <LoadingIcon className="ml-4" /> : null}
    </div>
  );
}

export default React.forwardRef(Button);
