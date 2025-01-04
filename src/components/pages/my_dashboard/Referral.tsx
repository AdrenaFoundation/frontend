import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';
import { addNotification } from '@/utils';

import copyIcon from '../../../../public/images/copy.svg';
import errorIcon from '../../../../public/images/Icons/error.svg';

export default function Referral({
    userProfile,
    className,
    redisProfile,
    duplicatedRedis,
}: {
    userProfile: false | UserProfileExtended;
    className?: string;
    redisProfile: Record<string, string>;
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

    if (Object.keys(redisProfile).length === 0) {
        return <div>
            Cannot retrieve referral link
        </div>
    }

    const link = `https://app.adrena.xyz/trade?referral=${duplicatedRedis ? redisProfile.owner : redisProfile.nickname}`;

    return (<div className={twMerge("w-auto max-w-full border flex text-xs bg-third items-center gap-x-2 h-[3em] rounded-tr-xl overflow-hidden", className)}>
        <div className='bg-[#060d16A0] border-r h-[3em] pl-4 pr-4 flex items-center justify-center'>
            <div className='font-boldy'>
                Referral Link
            </div>
        </div>
        <div className='hidden sm:block max-w-[14em] shrink text-nowrap text-ellipsis overflow-hidden opacity-50'>{link}</div>

        <div className='h-[3em] sm:pl-3 bg-[#060d16A0] opacity-50 flex items-center justify-center hover:opacity-100 cursor-pointer' onClick={async () => {
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
                    width={16}
                    height={16}
                />
            </Tippy>
        </div>
        {!duplicatedRedis ? <div className='bg-[#060d16A0] h-[3em] pr-3 pl-3 flex items-center justify-center'>
            <Tippy
                content={
                    <p className="text-xs font-boldy">
                        {redisProfile.nickname} is already taken by another user, please choose a different one.
                    </p>
                }
            >
                <Image
                    src={errorIcon}
                    alt="duplicate icon"
                    width={16}
                    height={16}
                />
            </Tippy>
        </div> : null}
    </div>);
}
