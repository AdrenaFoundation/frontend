import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import needle from '@/../../public/images/needle.png';
import { EnrichedSeasonMutation } from '@/types';
import { formatNumber } from '@/utils';

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
                        <h3 className="animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]">
                            {mutation.name}
                        </h3>
                    )}
                    {mutation.description && (
                        <p className="text-white/50 text-sm">
                            {mutation.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]">
                        {mutation.calculationType === "per_increment" ? (
                            <>+{formatNumber(mutation.points, 3)} - {formatNumber(mutation.maxPoints, 3)} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></>
                        ) : (
                            <>+{formatNumber(mutation.maxPoints, 3)} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></>
                        )}
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
