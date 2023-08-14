import Link from 'next/link';

import Button from '@/components/common/Button/Button';
import { PageProps } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Buy(_: PageProps) {
  return (
    <>
      <h1>Buy ADX or ALP</h1>

      <div className="w-full flex flex-col sm:flex-row mt-4">
        <div className="border border-grey p-6 grow bg-secondary sm:mr-2 flex flex-col">
          <div className="text-3xl">ADX</div>
          <div className="mt-4">
            ADX is the utility and governance token. Accrues 30% of the
            platform&apos;s generated fees.
          </div>
          <div className="mt-4">
            <Button
              href="https://www.orca.so/"
              title="Buy on Orca"
              className="bg-[#F9C04E] w-44 text-black"
              onClick={() => {
                // Not used
              }}
              rightIcon="images/orca-icon.png"
            />
          </div>
        </div>

        <div className="border border-grey p-6 grow bg-secondary sm:ml-2 mt-6 sm:mt-0 flex flex-col">
          <div className="text-3xl">ALP</div>
          <div className="mt-4">
            ALP is the liquidity provider token. Accrues 70% of the
            platform&apos;s generated fees.
          </div>

          <div className="mt-4">
            <Link href="/swap_alp">
              <Button
                title={'Buy'}
                className="bg-highlight w-20"
                onClick={() => {
                  // TODO: Jump to buy ALP page
                }}
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
