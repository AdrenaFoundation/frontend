import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import liveIcon from '../../../../public/images/Icons/live-icon.svg';

export default function LiveIcon({
    className,
}: {
    className?: string;
}) {
    return <Image
        src={liveIcon}
        alt="Live icon"
        width={12}
        height={12}
        className={twMerge('animate-pulse', className)}
    />
}