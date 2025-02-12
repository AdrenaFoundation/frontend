import React from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

import OnchainAccountInfo from './OnchainAccountInfo';

interface UserProfileBlockProps {
    profile: UserProfileExtended & { rank: number };
    className?: string;
    setActiveProfile: (profile: UserProfileExtended) => void;
}

export function getLeverageColorClass(leverage: number): string {
    if (leverage < 10) return 'text-white';
    if (leverage < 25) return 'text-green';
    if (leverage < 50) return 'text-orange';
    return 'text-red';
}

export default function UserProfileBlock({ profile, setActiveProfile, className }: UserProfileBlockProps) {
    return (
        <div className={`w-full flex flex-col border rounded-lg bg-[#050D14] overflow-hidden p-3 ${className}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row gap-6 justify-between items-center">
                <div className="flex flex-1 flex-col items-start" onClick={
                    () => setActiveProfile(profile)
                }>
                    <div className="flex w-full font-mono text-xxs">
                        <span className="text-blue cursor-pointer hover:underline text-base sm:text-lg">
                            {profile.nickname}
                        </span>
                    </div>
                    <OnchainAccountInfo
                        address={profile.pubkey}
                        shorten={true}
                        className="text-xxs"
                        iconClassName="w-2 h-2"
                    />
                </div>

                <div className="flex flex-1 flex-col blur-md">
                    <div className="flex w-full font-mono text-xxs text-txtfade">
                        Total Fees Paid
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={null}
                            format="currency"
                            className="text-gray-400 text-xs lowercase"
                            isDecimalDimmed={true}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col blur-md">
                    <div className="flex w-full font-mono text-xxs text-txtfade">
                        Total Open Volume
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={null}
                            format="currency"
                            className="text-gray-400 text-xs lowercase"
                            isDecimalDimmed={true}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col mt-2 sm:mt-0 blur-md">
                    <div className="flex w-full font-mono text-xxs text-txtfade">
                        Total PnL
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={null}
                            format="currency"
                            className={`text-gray-400 text-xs lowercase ${0 > 0 ? 'text-green' : 'text-red'}`}
                            isDecimalDimmed={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
