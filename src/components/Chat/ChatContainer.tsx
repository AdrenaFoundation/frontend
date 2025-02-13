import { Wallet } from '@coral-xyz/anchor';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';
import collapseIcon from '../../../public/images/collapse-all.svg';
import groupIcon from '../../../public/images/group.svg';

import { UserProfileExtended } from '@/types';

import Modal from '../common/Modal/Modal';
import Chat from './Chat';
import LiveIcon from '../common/LiveIcon/LiveIcon';
import Image from 'next/image';
import TabSelect from '../common/TabSelect/TabSelect';
import AI4A from '../AI4A/AI4A';

function ChatContainer({
    userProfile,
    wallet,
    isMobile,
    isChatOpen,
    setIsChatOpen,
}: {
    userProfile: UserProfileExtended | null | false;
    wallet: Wallet | null;
    isMobile: boolean;
    isChatOpen: boolean | null;
    setIsChatOpen: (isOpen: boolean) => void;
}) {
    const [nbConnectedUsers, setNbConnectedUsers] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('ai');

    const [showUserList, setShowUserList] = useState(false);
    const [cookies, setCookie] = useCookies(['chat-open', 'chat-height']);

    const chatHeightCookie = cookies['chat-height'];
    const isOpenCookie = cookies['chat-open'];

    const [height, setHeight] = useState(() => {
        // Initialize with cookie value or default
        return (
            chatHeightCookie || Math.round(window.innerHeight * 0.35)
        );
    });

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        // Decide if isOpen should be true or not, depending on cookies and if we are in mobile
        if (isChatOpen === null) {
            if (isMobile) {
                // In mobile, not open by default
                setIsChatOpen(false);
                return;
            }

            // Opened by default on desktop, otherwise follow what the cookie says
            setIsChatOpen(
                typeof isOpenCookie === 'undefined' ||
                isOpenCookie === true,
            );
            return;
        }

        if (isMobile) return;

        setCookie('chat-open', isChatOpen);
    }, [isMobile, isChatOpen, isOpenCookie, setIsChatOpen, setCookie]);

    // Add window resize handler
    useEffect(() => {
        const handleResize = () => {
            if (!isDragging) {
                if (chatHeightCookie) {
                    setHeight(chatHeightCookie);
                } else {
                    setHeight(Math.round(window.innerHeight * 0.35));
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isDragging, height, chatHeightCookie]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !isChatOpen) return;
            const newHeight = window.innerHeight - e.clientY;
            const clampedHeight = Math.min(Math.max(newHeight, 250), 1000);
            setHeight(clampedHeight);
        },
        [isDragging, isChatOpen],
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setCookie('chat-height', height, { path: '/' });
        }
        setIsDragging(false);
    }, [isDragging, setCookie, height]);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    if (isChatOpen === null) return <></>;

    const header = (
        <div>
            <TabSelect
                tabs={[{ title: 'ai' }, { title: 'live chat' }]}
                selected={activeTab}
                onClick={(tab) => {
                    setActiveTab(tab);
                }}
                className="z-30 py-3"
            />

            {activeTab === 'ai' ? null : (
                <div
                    className="bg-secondary h-[3em] flex gap-2 items-center justify-between pl-4 pr-4 border-b flex-shrink-0 cursor-pointer"
                    onClick={() => {
                        if (!isDragging) setIsChatOpen(!isChatOpen);
                    }}
                >
                    <Image
                        src={collapseIcon}
                        alt="collapse logo"
                        width={10}
                        height={10}
                    />

                    <div className="flex gap-2">
                        <div className="text-sm font-archivo uppercase">Live Chat</div>
                        <div className="text-xxs font-thin uppercase">{'beta'}</div>
                    </div>

                    <div className="flex gap-2">
                        <LiveIcon />
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowUserList(!showUserList);
                            }}
                        >
                            <div className="text-xs flex mt-[0.1em] font-archivo text-txtfade">
                                {nbConnectedUsers === null ? '-' : nbConnectedUsers}
                            </div>
                            <Image src={groupIcon} alt="group logo" width={18} height={18} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <AnimatePresence>
                {isChatOpen ? (
                    <Modal
                        title="Live Chat"
                        close={() => setIsChatOpen(false)}
                        className="flex flex-col w-full h-[85vh] max-h-[85vh]"
                    >
                        <div className="bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col w-full h-full grow max-h-full">
                            {header}
                            {activeTab === 'ai' ? (
                                <AI4A />
                            ) : (
                                <Chat
                                    displaySmileys={false}
                                    userProfile={userProfile}
                                    wallet={wallet}
                                    isOpen={isChatOpen}
                                    showUserList={showUserList}
                                    setNbConnectedUsers={setNbConnectedUsers}
                                />
                            )}
                        </div>
                    </Modal>
                ) : null}
            </AnimatePresence>
        );
    }

    return (
        <div className="fixed bottom-0 right-4 z-20">
            {isChatOpen && (
                <div
                    className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize select-none"
                    onMouseDown={handleMouseDown}
                    style={{ userSelect: 'none' }}
                />
            )}

            <div
                className={twMerge(
                    'bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col shadow-md hover:shadow-lg border-t-2 border-r-2 border-l-2 w-[25em] select-none',
                    isChatOpen ? `h-[${height}px]` : 'h-[6em]',
                )}
                style={
                    isChatOpen
                        ? { height, userSelect: 'none', marginTop: '4px' }
                        : undefined
                }
            >
                {header}

                {activeTab === 'ai' ? (
                    <AI4A />
                ) : (
                    <Chat
                        userProfile={userProfile}
                        wallet={wallet}
                        isOpen={isChatOpen}
                        showUserList={showUserList}
                        setNbConnectedUsers={setNbConnectedUsers}
                    />
                )}
            </div>
        </div>
    );
}

export default React.memo(ChatContainer);
