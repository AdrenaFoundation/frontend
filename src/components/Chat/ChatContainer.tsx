import { Wallet } from "@coral-xyz/anchor";
import { useEffect, useState } from "react";

import { UserProfileExtended } from "@/types";
import { twMerge } from "tailwind-merge";
import { useCookies } from "react-cookie";
import Chat from "./Chat";
import { AnimatePresence } from "framer-motion";
import Modal from "../common/Modal/Modal";

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

    useEffect(() => {
        // Decide if isOpen should be true or not, depending on cookies and if we are in mobile
        if (isOpen === null) {
            if (isMobile) {
                // In mobile, not open by default
                setIsOpen(false);
                return;
            }

            // Opened by default on desktop, otherwise follow what the cookie says
            setIsOpen(typeof isOpenCookie['chat-open'] === 'undefined' || isOpenCookie['chat-open'] === 'true');
            return;
        }

        if (isMobile) return;

        setIsOpenCookie('chat-open', isOpen);
    }, [isOpen]);

    if (isOpen === null) return <></>;

    if (isMobile) {
        return (
            <>
                <div className="absolute top-4 left-16 z-40">
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer opacity-80 hover:opacity-100" onClick={() => {
                        setIsOpen(!isOpen);
                    }}>
                        <div className="text-xs font-archivo uppercase">Live</div>
                        <div className="text-xs font-archivo uppercase">Chat</div>
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
                        <Chat userProfile={userProfile} wallet={wallet} isOpen={isOpen} clickOnHeader={() => {
                            setIsOpen(!isOpen);
                        }} className={twMerge(
                            "bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col w-full h-full grow max-h-full",
                        )} />
                    </Modal>
                </AnimatePresence> : null}
            </>
        );
    }

    return <div className='fixed bottom-0 right-4 z-20'>
        <Chat userProfile={userProfile} wallet={wallet} isOpen={isOpen} clickOnHeader={() => {
            setIsOpen(!isOpen);
        }} className={twMerge(
            "bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col border-t border-r border-l w-[25em]",
            isOpen ? 'h-[25em]' : 'h-[3em]'
        )} />
    </div>;
}
