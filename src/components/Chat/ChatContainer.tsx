import { Wallet } from '@coral-xyz/anchor';
import { AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

// import collapseIcon from '../../../public/images/collapse-all.svg';
// import groupIcon from '../../../public/images/group.svg';
// import LiveIcon from '../common/LiveIcon/LiveIcon';
import Modal from '../common/Modal/Modal';
import Nemesis from '../Nemesis/Nemesis';
import Chat from './Chat';

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
    // const [nbConnectedUsers, setNbConnectedUsers] = useState<number | null>(null);
    // const [isOpen, setIsOpen] = useState<boolean | null>(null);
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

    if (isMobile) {
        return (
            <AnimatePresence>
                {isChatOpen ? (
                    <Modal
                        title="Live Chat"
                        close={() => setIsChatOpen(false)}
                        className="flex flex-col w-full h-[85vh] max-h-[85vh]"
                    >
                        <Chat
                            displaySmileys={false}
                            userProfile={userProfile}
                            wallet={wallet}
                            isOpen={isChatOpen}
                            showUserList={showUserList}
                            onToggleUserList={() => setShowUserList(!showUserList)}
                            clickOnHeader={() => setIsChatOpen(!isChatOpen)}
                            className="bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col w-full h-full grow max-h-full"
                        />
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
            <div className={twMerge(
                'bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col shadow-md hover:shadow-lg border-t-2 border-r-2 border-l-2 w-[25em]',
                isChatOpen ? `h-[${height}px]` : 'h-[3em]',
            )}>
                <Nemesis />
                {/* <Chat
                    userProfile={userProfile}
                    wallet={wallet}
                    isOpen={isChatOpen}
                    showUserList={showUserList}
                    onToggleUserList={() => setShowUserList(!showUserList)}
                    clickOnHeader={() => {
                        if (!isDragging) setIsChatOpen(!isChatOpen);
                    }}

                    style={
                        isChatOpen ? { height, userSelect: 'none', marginTop: '4px' } : undefined
                    }
                /> */}
            </div>
        </div>
    );
}

export default React.memo(ChatContainer);
