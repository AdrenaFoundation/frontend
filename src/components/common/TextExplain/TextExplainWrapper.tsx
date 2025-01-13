import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import TextExplain from './TextExplain';

export default function TextExplainWrapper({
  title,
  className,
  textExplainClassName,
  children,
  position = 'top',
}: {
  title: string;
  className?: string;
  textExplainClassName?: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}) {
  return (
    <div className={twMerge('flex relative items-center', className)}>
      <TextExplain
        title={title}
        className={twMerge(
          position === 'top' ? 'top-[-1.4em]' : 'bottom-[-1.5em]',
          textExplainClassName,
        )}
        position={position}
      />

      {children}
    </div>
  );
}
