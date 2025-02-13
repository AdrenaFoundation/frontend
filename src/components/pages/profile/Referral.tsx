import Tippy from '@tippyjs/react';
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

    if (userProfile.version < 2) {
        return <div></div>
    }

    const link = `https://app.adrena.xyz/trade?referral=${encodeURIComponent(userProfile.nickname)}`;

    return (<div className={twMerge("w-auto max-w-full border flex text-xs bg-third/60 items-center h-[3.5em] rounded-tl-xl overflow-hidden", className)}>
        <div className='bg-[#060d1660] h-[3.5em] pl-3 pr-3 flex items-center justify-center gap-2'>
            <div className='font-boldy text-md'>
                Referral Link
            </div>
        </div>
        <div className='hidden sm:block px-2 max-w-[15em] shrink text-nowrap text-ellipsis overflow-hidden opacity-50'>{link}</div>

        <div className={twMerge('h-[3.5em] px-2 sm:pl-3 bg-[#060d16A0] opacity-70 flex items-center justify-center hover:opacity-100 cursor-pointer pr-3')} onClick={async () => {
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
            <Tippy
                content={
                    <p className="text-xs font-boldy">
                        {link}
                    </p>
                }
            >
                <Image
                    className="opacity-75"
                    src={copyIcon}
                    alt="burger menu icon"
                    width={14}
                    height={14}
                />
            </Tippy>
        </div>
    </div>);
}
