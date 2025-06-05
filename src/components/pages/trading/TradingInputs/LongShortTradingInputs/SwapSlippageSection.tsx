import Tippy from "@tippyjs/react";
import { twMerge } from "tailwind-merge";

export const SwapSlippageSection = ({
    swapSlippage,
    setSwapSlippage,
    className,
    titleClassName,
}: {
    swapSlippage: number;
    setSwapSlippage: (slippage: number) => void;
    className?: string;
    titleClassName?: string;
}) => {
    const percentages = [0.1, 0.2, 0.3, 0.5, 1];

    return (
        <div className={twMerge("flex flex-col w-full", className)}>
            <Tippy content={<div className="flex flex-col gap-2">
                <span>This sets how much the price can move during the swap.</span>
                <span>If it’s too low, the swap might fail. If it’s too high, you might get a worse deal and have leftover tokens.</span>
            </div>}>
                <div className="flex flex-col w-full gap-2">
                    <h5 className={twMerge("ml-4", titleClassName)}>Swap Slippage</h5>

                    <div className="flex gap-2 w-full items-center justify-evenly">
                        {percentages.map((percentage) => (<div
                            className={twMerge(
                                "text-[0.7em] font-archivo cursor-pointer hover:text-white",
                                swapSlippage === percentage ? "text-white" : "text-txtfade",
                            )}
                            onClick={() => setSwapSlippage(percentage)}
                            key={"slippage-" + percentage}
                        >
                            {percentage}%
                        </div>))}
                    </div>
                </div>
            </Tippy>
        </div>
    );
};
