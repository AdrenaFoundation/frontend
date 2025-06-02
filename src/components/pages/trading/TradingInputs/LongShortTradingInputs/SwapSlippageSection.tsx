import Tippy from "@tippyjs/react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const SwapSlippageSection = () => {
    const [selected, setSelected] = useState<number>(0.3)

    const percentages = [0.1, 0.2, 0.3, 0.5, 1];

    return (
        <div className="flex w-full justify-between items-center sm:mt-3 sm:mb-1 sm:pr-2">
            <Tippy content={<div className="flex flex-col gap-2">
                <span>This sets how much the price can move during the swap.</span>
                <span>If it’s too low, the swap might fail. If it’s too high, you might get a worse deal and have leftover tokens.</span>
            </div>}>
                <h5 className="ml-4">Swap Slippage</h5>
            </Tippy>

            {percentages.map((percentage) => (<div
                className={twMerge(
                    "text-[0.7em] font-archivo cursor-pointer hover:text-white",
                    selected === percentage ? "text-white" : "text-txtfade",
                )}
                onClick={() => setSelected(percentage)}
                key={"slippage-" + percentage}
            >
                {percentage}%
            </div>))}
        </div>
    );
};
