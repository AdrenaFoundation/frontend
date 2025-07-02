import dynamic from 'next/dynamic';
import React from 'react';
import { twMerge } from 'tailwind-merge';

// Dynamically import to avoid SSR issues
const GameContainer = dynamic(() => import('..//GameEngine/GameContainer').then(mod => mod.default), { ssr: false });

export default function Game({
    className = '',
}: {
    className?: string;
}) {
    //
    // Handle the game logic here
    //

    return (
        <div className={twMerge("w-full h-full flex flex-col items-center justify-center", className)}>
            <GameContainer className="max-w-[61em] w-full h-[20em] max-h-full" />
        </div>
    );
};
