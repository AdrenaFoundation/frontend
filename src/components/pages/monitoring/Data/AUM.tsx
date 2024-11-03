import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';

export default function AUM({
  connected,
}: {
  connected: boolean;
}) {
  const aumUsd = useAssetsUnderManagement();

  return <div className='flex flex-col border'>
    <NumberDisplay
      title="AUM"
      nb={aumUsd}
      format="currency"
      precision={2}
      className={twMerge('border-0', !connected ? 'max-h-[calc(100%-2rem)]' : '')}
    />

    {!connected ? (
      <div className="text-txtfade text-xs items-center justify-center flex">
        Expect up to a 5-minute delay in the data
      </div>
    ) : null}
  </div>;
}
