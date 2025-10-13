import { useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import MutagenMechanics from '@/components/Mutagen/MutagenMechanics';

export default function MutagenMechanicsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#0B131D] border border-white/20 px-3 py-2 rounded-md hover:border-white/40 hover:shadow-xl transition-all duration-300"
      >
        <div className="text-sm font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#e47dbb_40%,#B9EEFF_60%,#e47dbb)]">
          MUTAGEN MECHANICS
        </div>
      </button>

      {open ? (
        <Modal
          title="Mutagen Mechanics"
          close={() => setOpen(false)}
          className="p-4 w-[min(64em,95vw)] max-h-[80vh] overflow-y-auto"
          wrapperClassName="items-center justify-center !mt-0"
        >
          <MutagenMechanics />
        </Modal>
      ) : null}
    </>
  );
}
