import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import infoIcon from '../../../../public/images/Icons/info.png';

const InfoAnnotationTitle = ({
  text,
  className,
  title,
}: {
  text: ReactNode;
  className: string;
  title: string;
}) => (
  <Tippy
    content={
      <div className="text-sm w-60 flex flex-col justify-around">{text}</div>
    }
    placement="auto"
  >
    <div className="h-auto w-auto flex items-center justify-center">
      <h3 className="pr-1">{title}</h3>
      <Image
        className={twMerge('opacity-50 hover:opacity-100', className)}
        src={infoIcon}
        alt="info icon"
        width="16"
        height="16"
      />
    </div>
  </Tippy>
);

export default InfoAnnotationTitle;
