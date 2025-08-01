import { twMerge } from 'tailwind-merge';

export default function LiveIcon({
    className,
    isLive = true,
    size = 12,
}: {
    className?: string;
    isLive?: boolean;
    size?: number;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={twMerge(isLive ? 'animate-pulse' : '', className)}
        >
            <circle
                cx="6"
                cy="6"
                r="6"
                fill={isLive ? '#10B981' : '#EF4444'}
                fillOpacity="0.2"
            />

            <circle cx="6" cy="6" r="3" fill={isLive ? '#10B981' : '#EF4444'} />
        </svg>
    );
}
