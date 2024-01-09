import { twMerge } from 'tailwind-merge';

import { Cortex } from '@/types';
import { nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import Bloc from '../Bloc';
import BucketChart from '../BucketChart';

export default function BucketsBloc({
  className,
  cortex,
}: {
  className?: string;
  cortex: Cortex;
}) {
  return (
    <Bloc
      title="Buckets"
      className={twMerge('min-w-[22em] max-w-[22em]', className)}
    >
      <div className="flex flex-wrap grow items-center justify-evenly">
        {['coreContributor', 'daoTreasury', 'pol', 'ecosystem'].map(
          (bucketName) => (
            <div className="flex flex-col pl-4 pr-4" key={bucketName}>
              <div className="text-sm">
                {abbreviateWords(bucketName)} Bucket
              </div>

              <BucketChart
                allocated={nativeToUi(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (cortex as any)[`${bucketName}BucketAllocation`],
                  window.adrena.client.adxToken.decimals,
                )}
                vested={nativeToUi(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (cortex as any)[`${bucketName}BucketVestedAmount`],
                  window.adrena.client.adxToken.decimals,
                )}
                minted={nativeToUi(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (cortex as any)[`${bucketName}BucketMintedAmount`],
                  window.adrena.client.adxToken.decimals,
                )}
              />
            </div>
          ),
        )}
      </div>
    </Bloc>
  );
}
