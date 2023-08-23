import { Url } from 'next/dist/shared/lib/router/router';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

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
  ...rest
}: {
  title?: string;
  rightIcon?: string;
  leftIcon?: string;
  alt?: string;
  variant?: 'primary' | 'secondary' | 'text' | 'outline' | 'danger';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  href?: Url;
}) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-700 font-medium rounded-md',
    secondary: 'bg-gray-300 opacity-50 hover:opacity-100 rounded-md',
    danger: '',
    text: 'opacity-50 hover:opacity-100 rounded-md',
    outline: 'border border-gray-200 hover:bg-gray-200 rounded-md',
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
          disabled && 'opacity-25 cursor-not-allowed',
          'transition duration-300',
        )}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {leftIcon && <Image src={leftIcon} alt={alt} width="12" height="12" />}
        {title && title}
        {rightIcon && (
          <Image src={rightIcon} alt={alt} width="12" height="12" />
        )}
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
