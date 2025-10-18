import Tippy from '@tippyjs/react';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import TextExplain from './TextExplain';

export default function TextExplainWrapper({
  title,
  tippy,
  className,
  textExplainClassName,
  children,
  position = 'top',
  onClick,
}: {
  tippy?: ReactNode;
  title: string;
  className?: string;
  textExplainClassName?: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
  onClick?: () => void;
}) {
  const content = <div className={twMerge(
    'flex relative items-center',
    onClick ? 'cursor-pointer' : '',
    className,
  )} onClick={onClick}>
    <TextExplain
      title={title}
      className={twMerge(
        position === 'top' ? 'top-[-1.4em]' : 'bottom-[-1.5em]',
        textExplainClassName,
      )}
      position={position}
    />

    {children}
  </div>;

  if (!tippy) {
    return content;
  }

  return (
    <Tippy content={tippy}>
      {content}
    </Tippy>
  );
}
