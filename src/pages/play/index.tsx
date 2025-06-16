import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Adrenasino to avoid SSR issues
const Adrenasino = dynamic(() => import('../../components/Adrenasino/Adrenasino').then(mod => mod.default), { ssr: false });

const PlayPage = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <Adrenasino />
        </div>
    );
};

export default PlayPage;
