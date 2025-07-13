import React, { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

import MutagenLeaderboard from '@/components/pages/mutagen_leaderboard/MutagenLeaderboard';
import Modal from '@/components/common/Modal/Modal';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

export default function Interseason3() {
    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const leaderboardData = useMutagenLeaderboardData({ allUserProfilesMetadata, seasonName: 'interseason3' });

    const [activeProfile, setActiveProfile] = useState<UserProfileExtended | null>(null);

    return (
        <div className="max-w-[1920px] w-full mx-auto px-4 relative flex flex-col pb-4">
            <div className="flex flex-col gap-2 items-center justify-center text-center mt-4 px-4 max-w-[60em] mx-auto">
                <span className="text-xs sm:text-sm lg:text-base font-boldy text-white/90">
                    For this Summer Event, the rule is simple: Top 25 traders will share the prize pool.
                    <br />
                    Ready, set, Trade!
                </span>

                {leaderboardData ? (
                    <MutagenLeaderboard
                        data={leaderboardData}
                        onClickUserProfile={async (wallet: PublicKey) => {
                            const p = await window.adrena.client.loadUserProfile({ user: wallet });

                            if (p === false) {
                                setActiveProfile(getNonUserProfile(wallet.toBase58()));
                            } else {
                                setActiveProfile(p);
                            }
                        }}
                    />
                ) : (
                    <div className="flex w-full items-center justify-center mb-8 mt-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {activeProfile && (
                <Modal
                    className="h-[80vh] w-full overflow-y-auto"
                    wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]"
                    title=""
                    close={() => setActiveProfile(null)}
                    isWrapped={false}
                >
                    <ViewProfileModal
                        profile={activeProfile}
                        close={() => setActiveProfile(null)}
                    />
                </Modal>
            )}
        </div>
    );
}
