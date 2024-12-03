import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';
import { addNotification } from '@/utils';

import copyIcon from '../../../../public/images/copy.svg';


export default function Referral({
    userProfile,
    className,
}: {
    userProfile: false | UserProfileExtended;
    className?: string;
}) {
    if (userProfile === null) {
        return null;
    }

    if (userProfile === false) {
        return <div>
            Create a profile to access referral link
        </div>
    }
    // text-[3em] md:text-[4em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%] tracking-[-3px]

    const link = `https://app.adrena.xyz/trade?referral=${userProfile.owner.toBase58()}`;

    return (<div className={twMerge("w-auto max-w-full border flex text-xs bg-third items-center gap-x-4 h-[3em] rounded-tr-xl overflow-hidden", className)}>
        <div className='bg-[#060d16A0] border-r h-[3em] pl-4 pr-4 flex items-center justify-center'>
            <div className='font-boldy'>
                Referral Link
            </div>
        </div>
        <div className='hidden sm:block max-w-[14em] shrink text-nowrap text-ellipsis overflow-hidden opacity-50'>{link}</div>

        <div className='h-[3em] pr-4 bg-[#060d16A0] opacity-50 flex items-center justify-center hover:opacity-100 cursor-pointer' onClick={async () => {
            try {
                await navigator.clipboard.writeText(link);
                console.log('Text copied to clipboard!');
                addNotification({
                    title: 'Referral link copied to clipboard',
                    message: '',
                    type: 'info',
                    duration: 'regular',
                });
            } catch (err) {
                console.error('Could not copy text: ', err);
            }
        }}>
            <Image
                className="opacity-75"
                src={copyIcon}
                alt="burger menu icon"
                width={16}
                height={16}
            />
        </div>
    </div>);
}
