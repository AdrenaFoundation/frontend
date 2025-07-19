import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

import StyledContainer from '../StyledContainer/StyledContainer';

export default function NumberDisplay({
  nb,
  title = '',
  format,
  precision,
  placeholder,
  isDecimalDimmed,
  prefixClassName,
  prefix,
  suffix,
  className,
  bodyClassName,
  bodySuffixClassName,
  headerClassName,
  titleClassName,
  tippyInfo,
  subtitle,
  isAbbreviate = false,
  isAbbreviateIcon = false,
  footer,
}: {
  title?: ReactNode;
  nb: number | null;
  format?: 'number' | 'currency' | 'percentage';
  prefixClassName?: string;
  prefix?: string;
  precision?: number;
  placeholder?: string;
  isDecimalDimmed?: boolean;
  suffix?: string;
  className?: string;
  bodySuffixClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  tippyInfo?: string;
  subtitle?: string;
  isAbbreviate?: boolean;
  isAbbreviateIcon?: boolean;
  footer?: ReactNode;
}) {
  return (
    <StyledContainer
      title={
        tippyInfo ? (
          <Tippy
            content={<p className="font-medium">{tippyInfo}</p>}
            placement="auto"
          >
            <div
              className={twMerge(
                'text-xs sm:text-sm text-txtfade font-boldy border-b border-dashed border-white/20 cursor-help',
                titleClassName,
              )}
            >
              {title}
            </div>
          </Tippy>
        ) : (
          title
        )
      }
      className={twMerge(
        'flex items-center flex-1 min-h-[2em] bg-transparent ',
        className,
      )}
      bodyClassName="gap-0"
      headerClassName={twMerge('text-center justify-center', headerClassName)}
      titleClassName={twMerge(
        'text-xs sm:text-sm text-txtfade font-boldy',
        titleClassName,
      )}
      subTitle={subtitle}
      subTitleClassName="text-xs text-txtfade"
    >
      <FormatNumber
        nb={nb}
        prefixClassName={prefixClassName}
        prefix={prefix}
        isAbbreviate={isAbbreviate}
        isAbbreviateIcon={isAbbreviateIcon}
        precision={precision}
        isDecimalDimmed={isDecimalDimmed}
        placeholder={placeholder}
        className={twMerge('text-xl', bodyClassName)}
        format={format}
        suffix={suffix}
        suffixClassName={twMerge(
          'text-sm font-boldy text-txtfade',
          bodySuffixClassName,
        )}
      />

      {footer}
    </StyledContainer>
  );
}
