import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Game to avoid SSR issues
const Game = dynamic(() => import('../../components/Game/Game').then(mod => mod.default), { ssr: false });

const PlayPage = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <Game />

            <div className='w-full h-[1px] bg-bcolor' />

            <div className='flex flex-grow w-full'>
            </div>
        </div>
    );
};

export default PlayPage;
