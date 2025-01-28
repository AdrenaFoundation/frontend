import Tippy from '@tippyjs/react';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export default function PeriodSelector<T extends string>({
    periods,
    period,
    setPeriod,
}: {
    periods: (T | {
        name: T;
        disabled?: boolean;
    })[];
    period: T | null;
    setPeriod: (v: T | null) => void;
}) {
    const periodsDOM = useMemo(() => {
        return periods.map((p) => {
            const disabled = typeof p === 'object' && p.disabled;
            const name = typeof p === 'object' ? p.name : p;

            if (disabled) {
                return <Tippy
                    key={name}
                    content={
                        <div className="text-sm w-20 flex flex-col justify-around">
                            Coming soon
                        </div>
                    }
                    placement="auto"
                >
                    <div className="text-txtfade cursor-not-allowed">{name}</div>
                </Tippy>;
            }

            return <div
                key={name}
                className={twMerge(
                    'cursor-pointer',
                    period === name ? 'underline' : '',
                )}
                onClick={() => setPeriod(name)}
            >
                {name}
            </div>
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periods]);

    return (
        <div className="flex gap-2 text-sm">
            {periodsDOM}
        </div>
    );
}
