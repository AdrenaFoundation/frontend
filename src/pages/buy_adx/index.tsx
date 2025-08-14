import React from 'react';

import ADXDetails from '@/components/pages/buy_adx/ADXDetails';
import ADXSwap from '@/components/pages/buy_adx/ADXSwap/ADXSwap';
import { PageProps } from '@/types';

export default function BuyADX({ connected, adapters, activeRpc }: PageProps) {
  return (
    <>
      <div className="flex flex-col gap-4 mt-4 w-full max-w-[1300px] m-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <ADXDetails className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border basis-4/6 sm:h-fit" />

          <div className="basis-2/6 flex flex-col gap-4">
            <ADXSwap
              connected={connected}
              adapters={adapters}
              activeRpc={activeRpc}
              className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border h-fit"
            />
          </div>
        </div>
      </div>

      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />
    </>
  );
}
