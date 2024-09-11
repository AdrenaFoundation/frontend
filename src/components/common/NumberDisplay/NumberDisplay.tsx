import React from 'react';

import FormatNumber from '@/components/Number/FormatNumber';

import StyledContainer from '../StyledContainer/StyledContainer';

export default function NumberDisplay({
  nb,
  title,
  format,
  precision,
  placeholder,
  suffix,
}: {
  title: string;
  nb: number | null;
  format?: 'number' | 'currency' | 'percentage';
  precision?: number;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <StyledContainer
      title={title}
      className="flex items-center flex-1 min-h-[2em]"
      headerClassName="text-center justify-center"
      titleClassName="text-base sm:text-lg opacity-50 font-boldy"
    >
      <FormatNumber
        nb={nb}
        precision={precision}
        placeholder={placeholder}
        className="text-2xl"
        format={format}
        suffix={suffix}
      />
    </StyledContainer>
  );
}
