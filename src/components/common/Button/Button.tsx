import { Url } from 'next/dist/shared/lib/router/router';
import Image from 'next/image';
import Link from 'next/link';
import { CSSProperties, ReactNode, useState } from 'react';
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
  style,
  onClick,
  href,
  disabled,
  rounded = true,
  isOpenLinkInNewTab = false,
  height = 12,
  width = 12,
  // isLoading,
  icon,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: {
  title?: ReactNode;
  rightIcon?: string | ImageRef;
  leftIcon?: string | ImageRef;
  style?: CSSProperties;
  alt?: string;
  variant?: 'primary' | 'secondary' | 'info' | 'text' | 'outline' | 'danger' | 'lightbg' | 'success';
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
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const [onClickInProgress, setOnClickInProgress] = useState<boolean>(false);

  const variantsBgDisabledOpacity = {
    primary: `bg-white/50`,
    info: `from-[#0284c7] via-[#1e40af] to-[#1a2a6a]`,
    success: `from-emerald-500 via-green-500 to-teal-500`,
    secondary: 'bg-secondary',
    danger: 'from-red-600 via-rose-600 to-pink-600',
    text: 'bg-transparent',
    outline: 'bg-transparent',
    lightbg: 'bg-[#1f2c3c]',
  };

  const variants = {
    primary: `text-black/80 bg-white/90
         shadow-md hover:shadow-lg hover:opacity-90 
         transition-all duration-300 ease-in-out`,
    info: `text-white bg-gradient-to-r from-[#0284c7] via-[#1e40af] to-[#1a2a6a]
         shadow-md hover:shadow-lg hover:opacity-90 
         transition-all duration-300 ease-in-out`,
    secondary:
      'bg-secondary text-white opacity-90 hover:opacity-100 font-medium',
    danger: `text-white bg-gradient-to-r from-red via-rose-600 to-pink-600
         shadow-md hover:shadow-lg hover:opacity-90 
         transition-all duration-300 ease-in-out`,
    success: `text-white bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
         shadow-md hover:shadow-lg hover:opacity-90 
         transition-all duration-300 ease-in-out`,
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      className={twMerge(
        'flex flex-row items-center justify-center gap-3 font-mono h-[2.5em] overflow-hidden relative',
        sizes[size],
        variants[variant],
        rounded ? 'rounded-md' : '',
        disabled || onClickInProgress
          ? 'cursor-not-allowed pointer-events-none opacity-50'
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
