import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';
import { addNotification } from '@/utils';

import copyIcon from '../../../../public/images/copy.svg';
import warningIcon from '../../../../public/images/Icons/warning.png';

export default function Referral({
    userProfile,
    className,
    redisProfile,
    duplicatedRedis,
}: {
    userProfile: false | UserProfileExtended;
    className?: string;
    redisProfile: Record<string, string> | null;
    duplicatedRedis: boolean;
}) {
    if (userProfile === null) {
        return null;
    }

    if (userProfile === false) {
        return <div>
            Create a profile to access referral link
        </div>
    }

    if (redisProfile === null) {
        return <div>
            Cannot retrieve referral link
        </div>
    }

    const link = `https://app.adrena.xyz/trade?referral=${duplicatedRedis ? redisProfile.owner : encodeURIComponent(redisProfile.nickname)}`;

    return (<div className={twMerge("w-auto max-w-full border flex text-xs bg-third/60 items-center h-[2.5em] rounded-tl-xl overflow-hidden", className)}>
        <div className='bg-[#060d1660] border-r h-[2.5em] pl-3 pr-3 flex items-center justify-center gap-2'>
            <div className='font-boldy'>
                Referral Link
            </div>

            {duplicatedRedis ? <Tippy
                content={
                    <p className="text-xs font-boldy">
                        The username &apos;{redisProfile.nickname}&apos; is already in use by another user. Since each username can only have one referral link, we’ve assigned your wallet public key as your referral link.
                        If you&apos;d like to customize your referral link, please update your username.
                    </p>
                }
            >
                <Image
                    className='opacity-75'
                    src={warningIcon}
                    alt="warning icon"
                    width={18}
                    height={18}
                />
            </Tippy> : null}
        </div>
        <div className='hidden sm:block px-2 max-w-[15em] shrink text-nowrap text-ellipsis overflow-hidden opacity-50'>{link}</div>

        <div className={twMerge('h-[2.5em] px-2 sm:pl-3 bg-[#060d1680] opacity-50 flex items-center justify-center hover:opacity-100 cursor-pointer',
            duplicatedRedis ? '' : 'pr-3')} onClick={async () => {
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
