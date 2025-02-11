import { PublicKey } from "@solana/web3.js";
import { AnimatePresence, motion } from "framer-motion";
import Image from 'next/image';
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import banner from '@/../public/images/mutagen-leaderboard.jpg';
import Modal from "@/components/common/Modal/Modal";
import Loader from "@/components/Loader/Loader";
import MutagenLeaderboard from "@/components/pages/mutagen_leaderboard/MutagenLeaderboard";
import ViewProfileModal from "@/components/pages/profile/ViewProfileModal";
import { useAllUserProfilesMetadata } from "@/hooks/useAllUserProfilesMetadata";
import useMutagenLeaderboardData from "@/hooks/useMutagenLeaderboardData";
import { UserProfileExtended } from "@/types";

export default function Index() {
    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const leaderboardData = useMutagenLeaderboardData({ allUserProfilesMetadata });

    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);

    return <>
        <div>
            <div className="relative">
                <div className="relative flex flex-col items-center w-full h-[25em] justify-center border-b">
                    <div className="mt-[1em]">
                        <AnimatePresence>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{}}
                                key={"mutagen-leaderboard"}
                            >
                                <Image
                                    src={banner}
                                    alt="competition banner"
                                    className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
                                />
                            </motion.span>
                        </AnimatePresence>
                        <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                        <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                        <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                    </div>

                    <div className="z-10 text-center">
                        <h1
                            className={twMerge(
                                'text-[2.5em] sm:text-[3em] md:text-[4em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]',
                            )}
                        >
                            {"ALL TIME"}
                        </h1>
                        <p className="text-lg tracking-[0.2rem] uppercase">{'Mutagen leaderboard'}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 items-center justify-center text-center mt-8 px-4 max-w-[60em] mx-auto">
                <span className="text-xs sm:text-sm lg:text-base font-boldy text-white/90">
                    The ALL-TIME leaderboard tracks total Mutagen earned since launch.
                </span>
                <span className="text-xs sm:text-sm lg:text-base font-boldy text-white/90">
                    Trade to climb the ranks and boost your airdrop share—every closed position counts!
                </span>
            </div>

            <div className="h-[1px] bg-bcolor w-full mt-8 mb-16" />

            {leaderboardData ? <MutagenLeaderboard
                className="pb-8"
                data={leaderboardData}
                onClickUserProfile={async (wallet: PublicKey) => {
                    const p = await window.adrena.client.loadUserProfile(wallet);

                    setActiveProfile(p !== false ? p : null);
                }}
            /> : <Loader className="flex w-full items-center justify-center mb-8 mt-8" />}
        </div>

        <AnimatePresence>
            {activeProfile ? (
                <Modal
                    className="h-[80vh] w-full overflow-y-auto"
                    wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
                    title=""
                    close={() => setActiveProfile(null)}
                    isWrapped={false}
                >
                    <ViewProfileModal
                        profile={activeProfile}
                        showFeesInPnl={false}
                        close={() => setActiveProfile(null)}
                    />
                </Modal>
            ) : null}
        </AnimatePresence>

    </>
}
