import { Wallet } from "@coral-xyz/anchor";
import { createClient } from "@supabase/supabase-js";
import Image from 'next/image';
import { useEffect, useRef, useState } from "react";

import { UserProfileExtended } from "@/types";

import collapseIcon from '../../../public/images/collapse-all.svg';
import groupIcon from '../../../public/images/group.svg';
import Button from "../common/Button/Button";
import InputString from "../common/inputString/InputString";
import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";
import { kv } from "@vercel/kv";
import { useCookies } from "react-cookie";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

const roomId = 0;

const MAX_MESSAGES = 1000;

interface Message {
    room_id: string;
    text: string;
    timestamp: string;
    username?: string;
    wallet?: string;
}

const OPEN_CHAT_TTL = 600000; // 10 minute TTL - in millisecond

const trackOpenChat = async (roomId: number, walletAddress: PublicKey) => {
    try {
        const expiryInSeconds = OPEN_CHAT_TTL / 1000;

        // Set the key with a value and expiry time
        await kv.set(`connected:${roomId}:${walletAddress.toBase58()}`, true, { ex: expiryInSeconds });
    } catch (e) {
        // ignore error - it's not a big deal if we can't save that info
        console.log('Error tracking open chat', e);
    }
};

const trackCloseChat = async (roomId: number, walletAddress: PublicKey) => {
    try {
        await kv.del(`connected:${roomId}:${walletAddress.toBase58()}`);
    } catch (e) {
        // ignore error - it's not a big deal if we can't save that info
        console.log('Error tracking close chat');
    }
};

const fetchConnectedUsers = async (roomId: number) => {
    try {
        const keys = await kv.keys(`connected:${roomId}:*`);

        return keys.length;
    } catch (e) {
        console.log('Error loading connected users', e);
        return null;
    }
};

export default function Chat({
    userProfile,
    wallet,
}: {
    userProfile: UserProfileExtended | null | false;
    wallet: Wallet | null;
}) {
    const [open, setOpen] = useCookies(['chat-open']);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [nbConnectedUsers, setNbConnectedUsers] = useState<number | null>(null);

    useEffect(() => {
        fetchConnectedUsers(roomId).then(setNbConnectedUsers);

        const interval = setInterval(() => {
            fetchConnectedUsers(roomId).then(setNbConnectedUsers);
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .eq("room_id", roomId)
                .order("timestamp", { ascending: true })
                .limit(MAX_MESSAGES);
            setMessages(data || []);
        };

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel("realtime:messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${roomId}`, // Filter by room_id
                },
                (payload) => {
                    console.log("New message received:", payload.new);

                    setMessages((prev) => {
                        const updatedMessages = [...prev, payload.new as Message];

                        return updatedMessages.slice(-MAX_MESSAGES);
                    });
                }
            )
            .subscribe((status) => {
                if (status !== "SUBSCRIBED") {
                    console.error("Failed to subscribe to realtime channel:", status);
                }
            });

        return () => {
            supabase.removeChannel(channel); // Cleanup subscription
        };
    }, []);

    const sendMessage = async () => {
        if (input.trim()) {
            await supabase.from("messages").insert([{ room_id: roomId, text: input, wallet: wallet?.publicKey ?? null, username: userProfile ? userProfile.nickname : null }]);
            setInput("");
        }
    };

    // Scroll to the bottom whenever messages change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!wallet?.publicKey) return;

        if (typeof open["chat-open"] === 'undefined' || open["chat-open"]) {
            trackOpenChat(roomId, wallet.publicKey)
                .then(() => {
                    // Force refresh the number, which should be +1
                    fetchConnectedUsers(roomId).then(setNbConnectedUsers);
                });
        }

        const interval = setInterval(() => {
            trackOpenChat(roomId, wallet.publicKey);
        }, OPEN_CHAT_TTL - 30000); // Refresh 30s before expiry

        return () => {
            clearInterval(interval);

            if (open["chat-open"] === false) return;

            // Meaning the chat was closed
            trackCloseChat(roomId, wallet.publicKey).then(() => {
                // Force refresh the number, which should be -1
                fetchConnectedUsers(roomId).then(setNbConnectedUsers);
            });
        };
    }, [open]);

    return (
        <div className={twMerge("bg-[#070F16] rounded-tl-lg rounded-tr-lg flex flex-col border-t border-r border-l w-[25em]", (open["chat-open"] ?? true) ? 'h-[25em]' : 'h-[3em]')}>
            <div
                className="h-[3em] flex gap-2 items-center justify-between pl-4 pr-4 border-b flex-shrink-0 opacity-90 hover:opacity-100 cursor-pointer"
                onClick={() => setOpen('chat-open', !(open["chat-open"] ?? true))}
            >
                <Image
                    src={collapseIcon}
                    alt="collapse logo"
                    width={10}
                    height={10}
                />

                <div className="flex gap-2">
                    <div className="text-sm font-archivo uppercase">Live Chat</div><div className="text-xxs font-thin uppercase">{"beta"}</div>
                </div>

                <div className="flex gap-2">
                    <div className="text-xs flex mt-[0.1em] font-archivo text-txtfade">{nbConnectedUsers === null ? '-' : nbConnectedUsers}</div>

                    <Image
                        src={groupIcon}
                        alt="group logo"
                        width={18}
                        height={18}
                    />
                </div>
            </div>

            <div className="p-4 flex flex-col h-[calc(100% - 9em)] max-h-[calc(100% - 9em)] flex-grow w-full overflow-auto custom-chat-scrollbar" ref={containerRef}>
                {messages.map((msg, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <div className="text-xs opacity-20 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-sm font-boldy text-[#E2464A]">{msg.username ?? msg.wallet?.slice(0, 8) ?? 'anon'}</div>
                        <div className="text-sm font-regular text-txtfade">{msg.text}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col h-[6em] w-full items-center justify-between flex-shrink-0">
                <InputString
                    onChange={(value: string | null) => setInput(value ?? '')}
                    placeholder="Send a message"
                    value={input}
                    className="pt-[0.5em] pb-[0.5em] pl-4 pr-4 border border-gray-700 bg-transparent rounded-lg w-[90%] text-txtfade placeholder:text-txtfade"
                    inputFontSize="0.8em"
                    onEnterKeyPressed={sendMessage}
                />

                <Button title="Send" onClick={sendMessage} className="w-16 ml-auto rounded-lg font-boldy bg-[#E2464A] text-white text-[0.8em] mb-4 mr-5" />
            </div>
        </div>
    );
}
