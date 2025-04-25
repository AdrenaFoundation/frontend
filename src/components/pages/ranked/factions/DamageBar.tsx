import { useMemo } from "react";

import { PICTURES } from "./Rank";

export default function DamageBar({
    bonkMutagen,
    jitoMutagen,
}: {
    bonkMutagen: number;
    jitoMutagen: number;
}) {
    const bonkPercentage = useMemo(() => {
        return Number((bonkMutagen / (bonkMutagen + jitoMutagen) * 100).toFixed(2));
    }, [bonkMutagen, jitoMutagen]);

    const jitoPercentage = useMemo(() => {
        return Number((100 - bonkPercentage).toFixed(2));
    }, [bonkPercentage]);

    return <div className="w-[20em] h-[2em] border-2 rounded-2xl overflow-hidden flex">
        <div className="bg-[#FA6724] h-full relative flex items-center justify-center" style={{
            width: `${Math.max(Math.min(bonkPercentage, 90), 10)}%`,
        }}>
            <div className="absolute text-sm font-boldy">{bonkPercentage}%</div>

            <div
                className="h-full w-full bg-cover bg-no-repeat bg-center opacity-20 grayscale z-10 absolute"
                style={{
                    backgroundImage: `url(${PICTURES[`A-General` as keyof typeof PICTURES]}`,
                }}
            />
        </div>

        <div className="bg-[#5AA6FA] h-full relative flex items-center justify-center" style={{
            width: `${Math.max(Math.min(jitoPercentage, 90), 10)}%`,
        }}>
            <div className="absolute text-sm font-boldy">{jitoPercentage}%</div>

            <div
                className="h-full w-full bg-cover bg-no-repeat opacity-20 grayscale z-10 absolute"
                style={{
                    backgroundImage: `url(${PICTURES[`B-General` as keyof typeof PICTURES]}`,
                    backgroundPosition: 'center -1.8em',
                    backgroundSize: '200%',
                }}
            />
        </div>
    </div>
}