import { twMerge } from 'tailwind-merge';

interface ChartToggleButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    isMobile?: boolean;
}

export default function ChartToggleButton({
    isActive,
    onClick,
    children,
    className,
    isMobile = false,
}: ChartToggleButtonProps) {
    const baseClasses = twMerge(
        "bg-gray-200/5 rounded-md flex justify-center items-center cursor-pointer transition-all",
        isActive
            ? "outline outline-1 outline-offset-[-1px] outline-white/50"
            : "outline outline-1 outline-offset-[-1px] outline-transparent",
        isMobile ? "px-2.5 py-1.5 flex-1" : "px-2 py-1 gap-2.5"
    );

    const textClasses = twMerge(
        "text-center text-xs font-bold whitespace-nowrap",
        isActive ? "text-white" : "text-zinc-500"
    );

    return (
        <div className={twMerge(baseClasses, className)} onClick={onClick}>
            <div className={textClasses}>
                {children}
            </div>
        </div>
    );
}
