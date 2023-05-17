import Link from 'next/link';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import run from './blackhole-script';

export default function Home() {
  useEffect(() => {
    window.addEventListener('resize', () => {
      run();
    });
  }, []);

  useEffect(() => {
    run();
  }, []);

  return (
    <main
      className={twMerge('w-full', 'h-full', 'flex', 'bg-main', 'relative')}
    >
      <div
        className="w-full h-full flex z-10 items-center justify-center"
        style={{
          backgroundImage: "url('/images/monster-screenshot-blackhole.svg')",
          backgroundSize: 'cover',
          backgroundPositionX: 'center',
          backgroundPositionY: 'center',
        }}
      >
        <Link
          href="/trade"
          className="w-48 h-48 flex items-center justify-center text-transparent text-shadow text-4xl hover:text-[whitesmoke] font-specialmonster"
          style={{
            textShadow: '0 0 8px #444444',
          }}
        >
          JUMP IN
        </Link>
      </div>

      <div className="absolute w-full h-full overflow-hidden z-0 flex justify-center align-center top-0 left-0">
        <canvas
          id="particle"
          className={twMerge(
            'z-0',
            'w-[80%]',
            'h-[80%]',
            'relative',
            'top-[10%]',
          )}
        ></canvas>
      </div>
    </main>
  );
}

/*
        <Link
          href="/trade"
          className="w-[10em]"
          style={{
            marginLeft: 'calc(50% - 5em)',
            marginTop: '25%',
          }}
        >
          <Button
            className="bg-secondary flex p-4 shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] shadow-white"
            title="Start Trading"
            onClick={() => {
              // nothing
            }}
          />
        </Link>
  */
