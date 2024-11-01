import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

import infoIcon from '../../../../public/images/Icons/info.svg';
import StyledContainer from '../StyledContainer/StyledContainer';

export default function NumberDisplay({
  nb,
  title,
  format,
  precision,
  placeholder,
  suffix,
  className,
  tippyInfo,
}: {
  title: string;
  nb: number | null;
  format?: 'number' | 'currency' | 'percentage';
  precision?: number;
  placeholder?: string;
  suffix?: string;
  className?: string;
  tippyInfo?: string;
}) {
  return (
    <StyledContainer
      title={
        tippyInfo ? <Tippy
          content={
            <p className="font-medium">
              {tippyInfo}
            </p>
          }
          placement="auto"
        >
          <div className='flex gap-1'>
            {title}
            <Image src={infoIcon} width={12} height={12} alt="info icon" />
          </div>
        </Tippy> : title
      }
      className="flex items-center flex-1 min-h-[2em]"
      headerClassName="text-center justify-center"
      titleClassName="text-xs sm:text-sm opacity-50 font-boldy"
    >
      <FormatNumber
        nb={nb}
        precision={precision}
        placeholder={placeholder}
        className={twMerge("text-xl", className)}
        format={format}
        suffix={suffix}
      />
    </StyledContainer>
  );
}
