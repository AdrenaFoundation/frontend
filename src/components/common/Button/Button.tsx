import { Url } from 'next/dist/shared/lib/router/router';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { ImageRef } from '@/types';

function Button({
  variant = 'primary',
  size = 'md',
  title,
  alt = 'icon',
  rightIcon,
  leftIcon,
  className,
  onClick,
  href,
  disabled,
  // isLoading,
  ...rest
}: {
  title?: ReactNode;
  rightIcon?: ImageRef;
  leftIcon?: ImageRef;
  alt?: string;
  variant?: 'primary' | 'secondary' | 'text' | 'outline' | 'danger';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  href?: Url;
  // isLoading?: boolean;
}) {
  const [onClickInProgress, setOnClickInProgress] = useState<boolean>(false);

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-700 font-medium rounded-md',
    secondary: 'bg-gray-300 opacity-50 hover:opacity-100 rounded-md',
    danger: 'bg-red-500 hover:bg-red-700 font-medium rounded-md',
    text: 'opacity-50 hover:opacity-100 rounded-md',
    outline: ' border border-gray-200 hover:bg-gray-200 rounded-md',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-1 text-sm',
    lg: 'px-6 py-2 text-sm',
  };

  const StyledButton = () => {
    return (
      <button
        className={twMerge(
          'flex flex-row items-center justify-center gap-3 font-mono',
          sizes[size],
          variants[variant],
          className && className,
          disabled || onClickInProgress
            ? 'opacity-25 cursor-not-allowed pointer-events-none'
            : null,
          'transition duration-300',
        )}
        disabled={disabled || onClickInProgress}
        onClick={async () => {
          if (!onClick) return;

          setOnClickInProgress(true);
          await onClick();
          setOnClickInProgress(false);
        }}
        {...rest}
      >
        {leftIcon && !onClickInProgress ? (
          <Image src={leftIcon} alt={alt} width="12" height="12" />
        ) : null}

        {title && !onClickInProgress ? title : null}

        {rightIcon && !onClickInProgress ? (
          <Image src={rightIcon} alt={alt} width="12" height="12" />
        ) : null}

        {onClickInProgress ? <Loader height={20} /> : null}
      </button>
    );
  };

  if (href) {
    return (
      <Link href={href}>
        <StyledButton />
      </Link>
    );
  }

  return <StyledButton />;
}

export default Button;
