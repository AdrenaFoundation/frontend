import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import copyIcon from '@/../../public/images/copy.svg';
import banner from '@/../../public/images/referral-wallpaper.jpg';
import usdcLogo from '@/../../public/images/usdc.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import { PageProps } from '@/types';
import { addNotification } from '@/utils';

export default function Referral({
    userProfile,
    showFeesInPnl,
}: PageProps) {
    const router = useRouter();
    const link = useMemo(() => userProfile ? `https://app.adrena.xyz/trade?referral=${encodeURIComponent(userProfile.nickname)}` : '', [userProfile]);
    const [activeProfile, setActiveProfile] = useState(null);

    const { allUserProfiles } =
        useAllUserProfiles({
            referrerProfileFilter: userProfile ? userProfile.pubkey : null,
        });

    return (
        <>
            <div className="flex flex-col p-4">
                <StyledContainer className="p-0 overflow-hidden" bodyClassName='p-0 items-center justify-center'>
                    <div className="relative flex flex-col items-center w-full h-[17em] justify-center border-b">
                        <div className="">
                            <AnimatePresence>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{}}
                                    key={"Referral"}
                                >
                                    <Image
                                        src={banner}
                                        alt="referral banner"
                                        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 rounded-tl-xl rounded-tr-xl"
                                        style={{ objectPosition: "50% 80%" }}
                                    />
                                </motion.span>
                            </AnimatePresence>
                            <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                            <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                            <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                        </div>

                        <div className="z-10 text-center flex flex-col items-center justify-center gap-4">
                            <h1
                                className={twMerge(
                                    'text-[1em] sm:text-[1.5em] md:text-[2em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                    'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
                                )}
                            >
                                SPREAD THE WORD
                            </h1>

                            <h4 className='font-archivo text-white/80 tracking-widest uppercase text-md'>And Receive 10% of the trading fees</h4>
                        </div>
                    </div>

                    <div className='flex flex-col relative w-full'>
                        {userProfile === false ? <div
                            className='absolute w-full flex items-center justify-center top-[30%] z-10 underline cursor-pointer opacity-90 hover:opacity-100'
                            onClick={() => router.push('/profile')}
                        >
                            Create your profile to activate referral system
                        </div> : null}

                        <div className={twMerge('flex flex-col gap-6 w-full', userProfile === false ? 'blur-2xl pointer-events-none' : '')}>
                            <div className='flex gap-8 pb-8 pt-4 flex-col md:flex-row w-full justify-center items-center md:items-start'>
                                <div className='flex flex-col items-center gap-8 w-[15em]'>
                                    <div className='font-light uppercase tracking-widest text-md text-txtfade'>Referees</div>

                                    <div className='flex items-center justify-center gap-2'>
                                        <FormatNumber
                                            nb={allUserProfiles.length}
                                            format="number"
                                            className="text-3xl text"
                                            precision={0}
                                        />
                                    </div>
                                </div>

                                <div className='w-full h-[1px] md:h-full md:w-[1px] bg-bcolor' />

                                <div className='flex flex-col items-center gap-8 w-[15em]'>
                                    <div className='font-light uppercase tracking-widest text-md text-txtfade'>Pending Rewards</div>

                                    <div className='flex items-center justify-center gap-2'>
                                        <FormatNumber
                                            nb={userProfile ? userProfile.claimableReferralFeeUsd : 0}
                                            format="currency"
                                            className="text-3xl text"
                                            precision={6}
                                        />

                                        <Image
                                            src={usdcLogo}
                                            alt="USDC logo"
                                            className="w-5 h-5"
                                        />
                                    </div>

                                    <Button
                                        disabled={userProfile ? userProfile.claimableReferralFeeUsd === 0 : true}
                                        className="w-[20em]"
                                        size="lg"
                                        title='Claim'
                                        onClick={async () => {
                                            const notification =
                                                MultiStepNotification.newForRegularTransaction('Claim referrer pending rewards').fire();

                                            try {
                                                await window.adrena.client.claimReferralRewards({
                                                    notification,
                                                });
                                            } catch (error) {
                                                console.log('error', error);
                                            }
                                        }}
                                    />
                                </div>

                                <div className='w-full h-[1px] md:h-full md:w-[1px] bg-bcolor' />

                                <div className='flex flex-col items-center gap-8 w-[15em]'>
                                    <div className='font-light uppercase tracking-widest text-md text-txtfade'>TOTAL GENERATED</div>

                                    <div className='flex items-center justify-center gap-2'>
                                        <FormatNumber
                                            nb={userProfile ? userProfile.totalReferralFeeUsd : 0}
                                            format="currency"
                                            className="text-3xl text"
                                            precision={6}
                                        />

                                        <Image
                                            src={usdcLogo}
                                            alt="USDC logo"
                                            className="w-5 h-5"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className='w-full h-[1px] bg-bcolor' />

                            <div className="flex flex-col gap-6 items-center pb-8">
                                <div className='font-light uppercase tracking-widest text-md text-txtfade'>MY REFERRAL LINK</div>

                                <div className='flex rounded-lg bg-third' onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(link);

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
                                    <div className=' pl-4 pr-4 pt-2 pb-2 text-sm md:min-w-[30em] cursor-pointer hover:opacity-100 opacity-90'>
                                        {link}
                                    </div>

                                    <div className='h-full w-8 bg-inputcolor rounded-tr-lg rounded-br-lg items-center justify-center flex cursor-pointer hover:opacity-100 opacity-90'>
                                        <Image
                                            src={copyIcon}
                                            alt="Copy logo"
                                            className="w-4 h-4"
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-[20em]"
                                    size="lg"
                                    title='Share my referral link!'
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(link);

                                            addNotification({
                                                title: 'Referral link copied to clipboard',
                                                message: '',
                                                type: 'info',
                                                duration: 'regular',
                                            });
                                        } catch (err) {
                                            console.error('Could not copy text: ', err);
                                        }
                                    }}
                                />
                            </div>

                            <div className='w-full h-[1px] bg-bcolor' />

                            <div className='pb-8 flex items-center flex-col gap-2 w-full'>
                                <div className='font-light uppercase tracking-widest text-md text-txtfade pb-6'>REFEREES</div>

                                <div className='flex flex-col gap-2 items-center w-[80%] max-w-[40em] border pt-2 pb-2 bg-third/40'>
                                    {allUserProfiles.map((referee, i) => <>
                                        {i > 0 ? <div className='w-full h-[1px] bg-bcolor' key={`separator-${i}`} /> : null}

                                        <div key={referee.pubkey.toBase58()} className='w-full items-center justify-center flex flex-col gap-2  opacity-70 hover:opacity-100 cursor-pointer'>
                                            <div className='flex text-sm text-white'>
                                                {referee.nickname.length ? referee.nickname : referee.owner.toBase58()}
                                            </div>
                                        </div>
                                    </>)}

                                    {allUserProfiles.length === 0 ? <div className='w-full items-center justify-center flex font-archivo text-sm opacity-80 pt-8 pb-8'>
                                        No referee yet. Share your referral link!
                                    </div> : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </StyledContainer>
            </div>

            <AnimatePresence>
                {activeProfile && (
                    <Modal
                        className="h-[80vh] w-full overflow-y-auto"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
                        title=""
                        close={() => setActiveProfile(null)}
                        isWrapped={false}
                    >
                        <ViewProfileModal
                            profile={activeProfile}
                            showFeesInPnl={showFeesInPnl}
                            close={() => setActiveProfile(null)}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}
