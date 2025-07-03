import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Game to avoid SSR issues
const Game = dynamic(() => import('../../components/Game/Game').then(mod => mod.default), { ssr: false });

const PlayPage = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <Game className="max-w-[61em] w-full h-full max-h-full" />
        </div>
    );
};

export default PlayPage;
