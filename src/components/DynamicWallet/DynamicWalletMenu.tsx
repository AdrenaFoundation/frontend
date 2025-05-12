import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { PROFILE_PICTURES } from '@/constant';
import useDynamicWallet from '@/hooks/useDynamicWallet';
import { UserProfileExtended } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';

interface DynamicWalletMenuProps {
    className?: string;
    userProfile: UserProfileExtended | null | false;
    isIconOnly?: boolean;
    isMobile?: boolean;
    setIsPriorityFeeModalOpen?: (isOpen: boolean) => void;
    setIsSettingsModalOpen?: (isOpen: boolean) => void;
}

/**
 * DynamicWalletMenu provides a wallet connection button with a dropdown menu
 * for account options using Dynamic's wallet infrastructure
 */
export const DynamicWalletMenu: React.FC<DynamicWalletMenuProps> = ({
    className,
    userProfile,
    isIconOnly = false,
    isMobile = false,
    setIsPriorityFeeModalOpen,
    setIsSettingsModalOpen,
}) => {
    const router = useRouter();
    const { primaryWallet, disconnectWallet, connectWallet } = useDynamicWallet();
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const connected = !!primaryWallet;
    const walletAddress = primaryWallet?.address || '';

    return (
        <div className="relative">
            {/* Hidden Dynamic Widget that handles wallet auth flow */}
            <DynamicWidget
                innerButtonComponent={<></>}
                variant="modal"
            />

            {connected && userProfile !== null ? (
                <Menu
                    trigger={
                        <Button
                            className={twMerge(
                                className,
                                'gap-2 pl-2 pr-3 text-xs w-[15em] border border-white/20',
                                isIconOnly && 'p-0 h-8 w-8',
                            )}
                            style={!isIconOnly && userProfile ? {
                                backgroundImage: `url(${PROFILE_PICTURES[userProfile.profilePicture || 0]})`,
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPositionY: 'center',
                            } : {}}
                            title={
                                !isIconOnly
                                    ? userProfile
                                        ? getAbbrevNickname(userProfile.nickname)
                                        : getAbbrevWalletAddress(walletAddress)
                                    : null
                            }
                            variant="lightbg"
                            onClick={() => {
                                setMenuIsOpen(!menuIsOpen);
                            }}
                        />
                    }
                    openMenuClassName="w-[150px] right-0 border border-white/10 shadow-xl"
                >
                    <MenuItems>
                        {isMobile ? (
                            <>
                                <MenuItem
                                    onClick={() => {
                                        router.push('/profile');
                                    }}
                                    className="py-2"
                                >
                                    Profile
                                </MenuItem>

                                <MenuSeparator />

                                <MenuItem
                                    onClick={() => {
                                        router.push('/achievements');
                                    }}
                                    className="py-2"
                                >
                                    Achievements
                                </MenuItem>

                                <MenuSeparator />

                                <MenuItem
                                    className="py-2"
                                    onClick={() => setIsPriorityFeeModalOpen?.(true)}
                                >
                                    Priority Fee
                                </MenuItem>

                                <MenuSeparator />

                                <MenuItem
                                    href='https://docs.adrena.xyz/'
                                    target='_blank'
                                    linkClassName="py-2"
                                >
                                    Learn
                                </MenuItem>

                                <MenuSeparator />

                                <MenuItem
                                    href='https://dao.adrena.xyz/'
                                    target='_blank'
                                    linkClassName="py-2"
                                >
                                    Vote
                                </MenuItem>

                                <MenuSeparator />

                                <MenuItem
                                    className="py-2"
                                    onClick={() => {
                                        setIsSettingsModalOpen?.(true);
                                    }}
                                >
                                    Settings
                                </MenuItem>
                                <MenuSeparator />
                            </>
                        ) : null}
                        <MenuItem
                            onClick={() => {
                                setMenuIsOpen(!menuIsOpen);
                                disconnectWallet();
                            }}
                            className="py-2"
                        >
                            Disconnect
                        </MenuItem>
                    </MenuItems>
                </Menu>
            ) : (
                <Button
                    className={twMerge(
                        className,
                        'gap-1 pl-2 pr-3 text-xs w-[15em] border border-white/20',
                        isIconOnly && 'p-0 h-8 w-8',
                    )}
                    title={!isIconOnly ? 'Connect wallet' : null}
                    variant="lightbg"
                    onClick={connectWallet}
                />
            )}
        </div>
    );
};

export default DynamicWalletMenu;
