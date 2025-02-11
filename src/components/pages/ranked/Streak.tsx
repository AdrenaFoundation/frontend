import Image from 'next/image';
import React from 'react';

import wing from '@/../../public/images/wing.svg';

export default function Streak() {
    return (
        <div className="flex flex-col gap-3 bg-[#07131D] border p-5 rounded-lg mt-4">
            <div className="flex flex-row items-center">
                <div className="bg-[#0D1923] border border-white/5 p-2 px-4 rounded-lg w-full border-r-0 rounded-r-none h-[42px]">
                    <p className="font-archivoblack text-lg">Streak</p>
                </div>
                <Image
                    src={wing}
                    alt="wing"
                    className="w-[73px] h-[43px] -translate-x-4"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-between mt-3">
                <div className="flex flex-col gap-2 items-center justify-center text-center p-3">
                    <p className="text-lg font-boldy">Trade Daily</p>
                    <p className="opacity-50 font-mono text-[#e47dbb]">+0.1 / day</p>
                </div>

                <div className="flex flex-col gap-2 items-center justify-center text-center p-3">
                    <p className="text-lg font-boldy">Trade for 7 consecutive days</p>
                    <p className="opacity-50 font-mono text-[#e47dbb]">+1 / 7 days</p>
                </div>

                <div className="flex flex-col gap-2 items-center justify-center text-center p-3">
                    <p className="text-lg font-boldy">Trade for 30 consecutive days</p>
                    <p className="opacity-50 font-mono text-[#e47dbb]">+2 / 30 days</p>
                </div>
            </div>
        </div>
    );
}
