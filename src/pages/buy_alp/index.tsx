import ALPDetails from '@/components/pages/buy_alp/ALPDetails';
import ALPSwap from '@/components/pages/buy_alp_adx/ALPSwap/ALPSwap';
import { MAIN_POOL_HARDCODED } from '@/constant';
import { PageProps } from '@/types';

// TODO: Handle multiple pools
const poolKey = MAIN_POOL_HARDCODED;

export default function Buy({ connected }: PageProps) {

  return (
    <div className="flex flex-col lg:flex-row  justify-between gap-4 mt-4 pb-[150px] p-[20px] w-full max-w-[1300px] m-auto">
      <ALPDetails
        className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border basis-4/6 sm:h-fit"
        poolKey={poolKey}
      />

      <ALPSwap
        connected={connected}
        className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border basis-2/6 h-fit"
        poolKey={poolKey}
      />

      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />
    </div>
  );
}
