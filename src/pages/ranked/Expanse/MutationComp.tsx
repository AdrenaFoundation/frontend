import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import needle from '@/../../public/images/needle.png';
import { EnrichedSeasonMutation } from '@/types';

export default function MutationComp({
    mutation,
    className,
}: {
    mutation: EnrichedSeasonMutation;
    className?: string;
}) {
    return (
        <div
            className={twMerge(
                'flex flex-col gap-2.5',
                className,
            )}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-0.5">
                    {mutation.name && (
                        <h3 className="font-archivo text-base text-white uppercase font-bold tracking-wide">
                            {mutation.name}
                        </h3>
                    )}
                    {mutation.description && (
                        <p className="text-white/50 text-xs">
                            {mutation.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-mono text-xs">
                        {mutation.maxPoints} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                    </span>
                </div>
            </div>

            {/*    mutationDate: string;
            name: string;
            description: string;
            points: number;
            conditionType: string;
            conditionValue: number;
            comparison: string;
            calculationType: string;
            maxPoints: number; */}



        </div>
    );
}
