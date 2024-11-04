import Image from 'next/image';

import liveIcon from '../../../../public/images/Icons/live-icon.svg';

export default function LiveIcon() {
    return <Image
        src={liveIcon}
        alt="Live icon"
        width={12}
        height={12}
        className='animate-pulse'
    />
}