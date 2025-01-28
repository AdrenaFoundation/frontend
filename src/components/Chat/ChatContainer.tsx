import { Wallet } from "@coral-xyz/anchor";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { twMerge } from "tailwind-merge";

import { UserProfileExtended } from "@/types";

import Modal from "../common/Modal/Modal";
import Chat from "./Chat";

const DRAGGING_CLASS = 'chat-container-dragging';

export default function ChatContainer({
    userProfile,
    wallet,
    isMobile,
}: {
    userProfile: UserProfileExtended | null | false;
    wallet: Wallet | null;
    isMobile: boolean;
}) {
    const [isOpen, setIsOpen] = useState<boolean | null>(null);
    const [isOpenCookie, setIsOpenCookie] = useCookies(['chat-open']);
    const [chatHeightCookie, setChatHeightCookie] = useCookies(['chat-height']);
    const [height, setHeight] = useState(() => {
        // Initialize with cookie value or default
        return chatHeightCookie['chat-height'] || Math.round(window.innerHeight * 0.35);
    });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        // Decide if isOpen should be true or not, depending on cookies and if we are in mobile
        if (isOpen === null) {
            if (isMobile) {
                // In mobile, not open by default
                setIsOpen(false);
                return;
            }

            // Opened by default on desktop, otherwise follow what the cookie says
            setIsOpen(typeof isOpenCookie['chat-open'] === 'undefined' || isOpenCookie['chat-open'] === true);
            return;
        }

        if (isMobile) return;

        setIsOpenCookie('chat-open', isOpen);
    }, [isMobile, isOpen, isOpenCookie, setIsOpenCookie]);

    // Add window resize handler
    useEffect(() => {
        const handleResize = () => {
            if (!isDragging) {
                if (chatHeightCookie['chat-height']) {
                    setHeight(chatHeightCookie['chat-height']);
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
        document.body.classList.add(DRAGGING_CLASS);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !isOpen) return;
        const newHeight = window.innerHeight - e.clientY;
        const clampedHeight = Math.min(Math.max(newHeight, 250), 1000);
        setHeight(clampedHeight);
    }, [isDragging, isOpen]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setChatHeightCookie('chat-height', height, { path: '/' });
            document.body.classList.remove(DRAGGING_CLASS);
        }
        setIsDragging(false);
    }, [isDragging, height, setChatHeightCookie]);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    if (isOpen === null) return <></>;

    if (isMobile) {
        return (
            <>
                <div className="absolute top-[1.45em] left-14 z-40">
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer opacity-80 hover:opacity-100" onClick={() => {
                        setIsOpen(!isOpen);
                    }}>
                        <div className="text-sm font-archivo uppercase animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#ffffff,40%,#808080,60%,#ffffff)]">
                            Live Chat
                        </div>
                    </div>
                </div>

                {isOpen ? <AnimatePresence>
                    <Modal
                        title={`Live Chat`}
                        close={() => {
                            setIsOpen(false)
                        }}
                        className="flex flex-col w-full h-[85vh] max-h-[85vh]"
                    >
                        <Chat
                            displaySmileys={false}
                            userProfile={userProfile}
                            wallet={wallet}
                            isOpen={isOpen}
                            clickOnHeader={() => {
                                setIsOpen(!isOpen);
                            }}
                            className={twMerge(
                                "bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col w-full h-full grow max-h-full",
                            )}
                        />
                    </Modal>
                </AnimatePresence> : null}
            </>
        );
    }

    return <div className='fixed bottom-0 right-4 z-20'>
        {isOpen && <div
            className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-gray-600 select-none"
            onMouseDown={handleMouseDown}
            style={{ userSelect: 'none' }}
        />}
        <Chat
            userProfile={userProfile}
            wallet={wallet}
            isOpen={isOpen}
            clickOnHeader={() => {
                setIsOpen(!isOpen);
            }}
            className={twMerge(
                "bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col shadow-md hover:shadow-lg border-t-2 border-r-2 border-l-2 w-[25em] select-none",
                isOpen
                    ? `h-[${height}px]`
                    : 'h-[3em]'
            )}
            style={isOpen ? { height, userSelect: 'none' } : undefined}
        />
    </div>;
}
