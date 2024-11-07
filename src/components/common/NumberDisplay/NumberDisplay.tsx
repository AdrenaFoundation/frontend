import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

import infoIcon from '../../../../public/images/Icons/info.svg';
import StyledContainer from '../StyledContainer/StyledContainer';

export default function NumberDisplay({
  nb,
  title = '',
  format,
  precision,
  placeholder,
  isDecimalDimmed,
  suffix,
  className,
  bodyClassName,
  headerClassName,
  titleClassName,
  tippyInfo,
  subtitle,
}: {
  title?: string;
  nb: number | null;
  format?: 'number' | 'currency' | 'percentage';
  precision?: number;
  placeholder?: string;
  isDecimalDimmed?: boolean;
  suffix?: string;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  tippyInfo?: string;
  subtitle?: string;
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
      className={twMerge("flex items-center flex-1 min-h-[2em] bg-transparent", className)}
      headerClassName={twMerge("text-center justify-center", headerClassName)}
      titleClassName={twMerge("text-xs sm:text-sm text-txtfade font-boldy", titleClassName)}
      subTitle={subtitle}
      subTitleClassName='text-xs text-txtfade'
    >
      <FormatNumber
        nb={nb}
        precision={precision}
        isDecimalDimmed={isDecimalDimmed}
        placeholder={placeholder}
        className={twMerge("text-xl", bodyClassName)}
        format={format}
        suffix={suffix}
        suffixClassName='text-sm font-boldy text-txtfade'
      />
    </StyledContainer>
  );
}
