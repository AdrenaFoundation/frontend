import ALPDetails from '@/components/pages/buy_alp/ALPDetails';
import ALPSwap from '@/components/pages/buy_alp/ALPSwap/ALPSwap';
import PartnerCards from '@/components/pages/buy_alp/PartnerCards';
import { PageProps } from '@/types';

export default function Buy({ connected }: PageProps) {
  return (
    <div className="flex flex-col gap-4 mt-4 w-full max-w-[1300px] m-auto">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <ALPDetails className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border basis-4/6 sm:h-fit" />

        <div className="basis-2/6 flex flex-col gap-4">
          <ALPSwap
            connected={connected}
            className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border h-fit"
          />

          <PartnerCards />
        </div>
      </div>

      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />
    </div>
  );
}
