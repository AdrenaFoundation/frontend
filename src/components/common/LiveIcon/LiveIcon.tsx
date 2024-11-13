import Image from 'next/image';

import liveIcon from '../../../../public/images/Icons/live-icon.svg';
import { twMerge } from 'tailwind-merge';

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