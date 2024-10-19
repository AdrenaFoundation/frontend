import { Url } from 'next/dist/shared/lib/router/router';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { ImageRef } from '@/types';

export default function Button({
  variant = 'primary',
  size = 'md',
  title,
  alt = 'icon',
  rightIcon,
  leftIcon,
  className,
  iconClassName,
  loaderClassName,
  rightIconClassName,
  leftIconClassName,
  onClick,
  href,
  disabled,
  rounded = true,
  isOpenLinkInNewTab = false,
  height = 12,
  width = 12,
  // isLoading,
  icon,
  ...rest
}: {
  title?: ReactNode;
  rightIcon?: ImageRef;
  leftIcon?: ImageRef;
  alt?: string;
  variant?: 'primary' | 'secondary' | 'text' | 'outline' | 'danger' | 'lightbg';
  className?: string;
  iconClassName?: string;
  loaderClassName?: string;
  rightIconClassName?: string;
  leftIconClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  rounded?: boolean;
  href?: Url;
  isOpenLinkInNewTab?: boolean;
  height?: number;
  width?: number;
  // isLoading?: boolean;
  icon?: ImageRef;
}) {
  const [onClickInProgress, setOnClickInProgress] = useState<boolean>(false);

  const variantsBgDisabledOpacity = {
    primary: `bg-highlight/25`,
    secondary: 'bg-secondary/25',
    danger: 'bg-red/25',
    text: 'bg-transparent',
    outline: 'bg-transparent',
    lightbg: 'bg-[#1f2c3c]',
  };

  const variants = {
    primary: `bg-highlight text-main opacity-90 hover:opacity-100 font-medium`,
    secondary:
      'bg-secondary text-white opacity-90 hover:opacity-100 font-medium',
    danger: 'bg-red text-white hover:bg-red font-medium',
    text: 'opacity-50 text-white hover:opacity-100 font-medium',
    outline: 'border-2 text-white hover:bg-bcolor font-medium',
    lightbg: 'bg-[#1f2c3c] text-white hover:text-txt',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-1 text-sm',
    lg: 'px-6 py-2 text-sm',
  };

  const styledButton = (
    <button
      className={twMerge(
        'flex flex-row items-center justify-center gap-3 font-mono h-[2.5em]',
        sizes[size],
        variants[variant],
        rounded ? 'rounded-full' : '',
        disabled || onClickInProgress
          ? 'cursor-not-allowed pointer-events-none'
          : null,

        disabled || onClickInProgress
          ? variantsBgDisabledOpacity[variant]
          : variants[variant],
        'transition duration-300',
        className,
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
      {icon && !onClickInProgress ? (
        <Image
          src={icon}
          alt={alt}
          width={width ? width : '12'}
          height={height ? height : '12'}
          className={twMerge(iconClassName, leftIconClassName)}
        />
      ) : null}

      {leftIcon && !onClickInProgress ? (
        <Image
          src={leftIcon}
          alt={alt}
          width={width ? width : '12'}
          height={height ? height : '12'}
          className={twMerge(iconClassName, leftIconClassName)}
        />
      ) : null}

      {title && !onClickInProgress ? title : null}

      {rightIcon && !onClickInProgress ? (
        <Image
          src={rightIcon}
          alt={alt}
          width={width ? width : '12'}
          height={height ? height : '12'}
          className={twMerge(iconClassName, rightIconClassName)}
        />
      ) : null}

      {onClickInProgress ? (
        <Loader
          height={23}
          width={50}
          className={twMerge('text-white', loaderClassName)}
        />
      ) : null}
    </button>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={isOpenLinkInNewTab ? '_blank' : ''}
        rel={isOpenLinkInNewTab ? 'noopener noreferrer' : ''}
      >
        {styledButton}
      </Link>
    );
  }

  return styledButton;
}
