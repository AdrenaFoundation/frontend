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

  const variantsBgDisabledOpacity = {
    primary: `bg-highlight/25`,
    secondary: 'bg-secondary/25',
    danger: 'bg-red/25',
    text: 'bg-transparent',
    outline: 'bg-transparent',
  };

  const variants = {
    primary: `bg-highlight text-main opacity-90 hover:opacity-100 font-medium rounded-full`,
    secondary:
      'bg-secondary text-white opacity-90 hover:opacity-100 rounded-full',
    danger: 'bg-red text-white hover:bg-red font-medium rounded-full',
    text: 'opacity-50 text-white hover:opacity-100 rounded-full',
    outline: 'border text-white hover:bg-bcolor rounded-full',
  };

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-1 text-sm',
    lg: 'px-6 py-2 text-sm',
  };

  const styledButton = (
    <button
      className={twMerge(
        'flex flex-row items-center justify-center gap-3 font-mono',
        sizes[size],
        variants[variant],
        className,
        disabled || onClickInProgress
          ? ' text-white cursor-not-allowed pointer-events-none'
          : null,

        disabled || onClickInProgress
          ? variantsBgDisabledOpacity[variant]
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

      {onClickInProgress ? <Loader height={23} width={50} /> : null}
    </button>
  );

  if (href) {
    return <Link href={href}>{styledButton}</Link>;
  }

  return styledButton;
}

export default Button;
