import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { formatPriceInfo } from '@/utils';

export default function AUM({
  titleClassName,
  bodyClassName,
  className,
  connected,
}: {
  titleClassName?: string;
  bodyClassName?: string;
  className?: string;
  connected: boolean;
}) {
  const aumUsd = useAssetsUnderManagement();

  return (
    <StyledContainer
      title="AUM"
      headerClassName="text-center justify-center"
      className={twMerge("grow flex items-center", className)}
      titleClassName={titleClassName}
    >
      <div className={twMerge('flex')}>
        {aumUsd !== null ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={bodyClassName}
          >
            {' '}
            {formatPriceInfo(aumUsd, 0)}{' '}
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0 }}
            className="w-[300px] h-[40px] bg-secondary animate-pulse rounded-lg"
          />
        )}
        {!connected ? <div className="text-txtfade">*</div> : null}
      </div>

      {!connected ? (
        <div className="text-txtfade text-xs ml-auto mr-auto relative bottom-3">
          Expect up to a 5-minute delay in the data
        </div>
      ) : null}
    </StyledContainer>
  );
}
