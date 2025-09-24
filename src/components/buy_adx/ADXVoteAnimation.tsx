import { AnimatePresence, motion } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import mons1 from '../../../public/images/adrena_pfp/monster-1.png';
import mons2 from '../../../public/images/adrena_pfp/monster-2.png';
import mons3 from '../../../public/images/adrena_pfp/monster-3.png';
import mons4 from '../../../public/images/adrena_pfp/monster-4.png';
import mons5 from '../../../public/images/adrena_pfp/monster-5.png';
import mons6 from '../../../public/images/adrena_pfp/monster-6.png';
import mons7 from '../../../public/images/adrena_pfp/monster-7.png';

export default function ADXVoteAnimation() {
  const [yesCounter, setYesCounter] = useState(0);
  const [noCounter, setNoCounter] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [participants, setParticipants] = useState<
    { vote: 0 | 1; pfp: StaticImageData }[]
  >([]);

  useEffect(() => {
    const monsters = [mons1, mons2, mons3, mons4, mons5, mons6, mons7] as const;

    if (totalParticipants === 30) {
      setNoCounter(0);
      setYesCounter(0);
      setTotalParticipants(0);
      setParticipants([]);
      return;
    }

    const interval = setInterval(() => {
      const random = Math.random();
      const pfp = monsters[Math.floor(random * monsters.length)];
      if (random > 0.3) {
        setYesCounter((prev) => prev + 1);
        setParticipants((prev) => [...prev, { vote: 1, pfp }]);
      } else {
        setNoCounter((prev) => prev + 1);
        setParticipants((prev) => [...prev, { vote: 0, pfp }]);
      }

      setTotalParticipants((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalParticipants]);

  return (
    <div className="relative flex flex-col items-center border border-bcolor rounded-md w-full lg:w-[400px] h-[500px] bg-[#0c1016]">
      <h4 className="mt-4 font-mono text-sm">
        00:{30 - totalParticipants}s left
      </h4>
      <div className="flex flex-row gap-6 justify-between items-center p-5 w-full h-full">
        <div className="w-full mt-auto">
          <h2 className="text-center mb-3">
            No <span>({noCounter})</span>
          </h2>

          <div
            className="h-[200px] w-full bg-red bg-opacity-25 mt-auto p-2 rounded-md transition-all duration-300"
            style={{
              height:
                noCounter !== 0
                  ? (noCounter / (yesCounter + noCounter)) * 280
                  : 10,
            }}
          >
            <div className="h-full w-full bg-red rounded-md" />
          </div>
        </div>
        <div className="w-full mt-auto">
          <h2 className="text-center mb-3">
            Yes <span>({yesCounter})</span>
          </h2>
          <div
            className="h-[200px] w-full bg-green bg-opacity-25 mt-auto p-2 rounded-md transition-all duration-300"
            style={{
              height:
                yesCounter !== 0
                  ? (yesCounter / (yesCounter + noCounter)) * 280
                  : 10,
            }}
          >
            <div className="h-full w-full bg-green rounded-md" />
          </div>
        </div>
      </div>

      <div
        className="grid gap-3 w-full h-[150px] overflow-hidden items-center bg-main p-5 border-t border-bcolor rounded-b-2xl"
        style={{
          gridTemplateColumns: `repeat(${participants.length < 8 ? participants.length : 8
            },  1fr)`,
        }}
      >
        <AnimatePresence>
          {participants
            .map((participant, i) => (
              <motion.div
                initial={{ opacity: 0, transform: 'translatey(10px)' }}
                animate={{ opacity: 1, transform: 'translatey(0)' }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-row gap-3 max-w-[70px] aspect-square items-center justify-center rounded-full border border-bcolor"
                key={i}
              >
                <div
                  className={twMerge(
                    'absolute -top-2 right-5 w-[20px] h-[20px] rounded-full flex flex-col gap-3 items-center justify-center z-10',
                    participant.vote === 1 ? 'bg-green' : 'bg-red',
                  )}
                >
                  <p className="text-xs font-semibold">
                    {participant.vote === 1 ? 'Y' : 'N'}
                  </p>
                </div>
                <Image
                  src={participant.pfp}
                  className="w-full"
                  alt="adx logo"
                />
              </motion.div>
            ))
            .reverse()}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-0 w-full h-[50px] bg-gradient-to-t from-main rounded-b-2xl z-10" />
    </div>
  );
}
