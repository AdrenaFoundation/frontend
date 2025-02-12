import { Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import Tippy from "@tippyjs/react";
import { kv } from "@vercel/kv";
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { twMerge } from "tailwind-merge";

import { openCloseConnectionModalAction } from "@/actions/walletActions";
import { PROFILE_PICTURES, WALLPAPER } from "@/constant";
import { useDispatch } from "@/store/store";
import { UserProfileExtended } from "@/types";

import collapseIcon from '../../../public/images/collapse-all.svg';
import groupIcon from '../../../public/images/group.svg';
import Button from "../common/Button/Button";
import InputString from "../common/inputString/InputString";
import LiveIcon from "../common/LiveIcon/LiveIcon";
import Loader from "../Loader/Loader";
import FormatNumber from "../Number/FormatNumber";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

const roomId = 0;

const MAX_MESSAGES = 1000;

interface Message {
    id: number;
    room_id: string;
    text: string;
    timestamp: string;
    username?: string;
    wallet?: string;
}

const OPEN_CHAT_TTL = 600000; // 10 minute TTL - in millisecond

const generateColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
};

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
        console.log('Error tracking close chat', e);
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

let profileLoading: string | false = false;

interface ConnectedUser {
    wallet: string;
    nickname?: string | null;
}

interface ChatProps {
    userProfile: UserProfileExtended | null | false;
    wallet: Wallet | null;
    className?: string;
    style?: React.CSSProperties;
    isOpen: boolean;
    clickOnHeader: () => void;
    displaySmileys?: boolean;
    showUserList?: boolean;
    onToggleUserList?: () => void;
}

function Chat({
    userProfile,
    wallet,
    className,
    style,
    isOpen,
    clickOnHeader,
    displaySmileys = true,
    showUserList = false,
    onToggleUserList,
}: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [nbConnectedUsers, setNbConnectedUsers] = useState<number | null>(null);
    const [profileCache, setProfileCache] = useState<Record<string, UserProfileExtended | null | false>>({});
    const dispatch = useDispatch();
    const smileys = ['😀', '😂', '❤️', '🔥', '👍']; // Predefined smileys
    const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

    const handleConnectionClick = () => {
        dispatch(openCloseConnectionModalAction(true));
    };

    useEffect(() => {
        const updateUsers = () => {
            fetchConnectedUsers(roomId).then(setNbConnectedUsers);
            fetchDetailedConnectedUsers(roomId).then(setConnectedUsers);
        };

        updateUsers();
        const interval = setInterval(updateUsers, 20000);

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
    }, [messages, isOpen]);

    useEffect(() => {
        if (!wallet?.publicKey) return;

        if (isOpen) {
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

            if (isOpen === false) return;

            // Meaning the chat was closed
            trackCloseChat(roomId, wallet.publicKey).then(() => {
                // Force refresh the number, which should be -1
                fetchConnectedUsers(roomId).then(setNbConnectedUsers);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, !!wallet]);

    const loadProfile = useCallback((wallet: string) => {
        if (profileLoading === wallet || profileCache[wallet]) return; // Do not load multiple time the same wallet

        profileLoading = wallet;

        window.adrena.client.loadUserProfile(new PublicKey(wallet))
            .then((profile) => {
                setProfileCache((prev) => ({
                    ...prev,
                    [wallet]: profile,
                }));
            });
    }, [profileCache]);

    const fetchDetailedConnectedUsers = async (roomId: number) => {
        try {
            const keys = await kv.keys(`connected:${roomId}:*`);
            const users = await Promise.all(keys.map(async (key) => {
                const wallet = key.split(':')[2];
                const profile = await window.adrena.client.loadUserProfile(new PublicKey(wallet));
                if (profile) {
                    setProfileCache(prev => ({
                        ...prev,
                        [wallet]: profile
                    }));
                }
                return {
                    wallet,
                    nickname: profile ? profile.nickname : null
                };
            }));
            return users;
        } catch (e) {
            console.log('Error loading connected users', e);
            return [];
        }
    };

    const anonymousCount = useMemo(() => {
        return connectedUsers.filter(user => !user.nickname).length;
    }, [connectedUsers]);

    const messagesDOM = useMemo(() => {
        if (!isOpen) return null;

        return messages.map((msg) => {
            return <div key={`message-${msg.id}`} className="flex gap-2 mb-1">
                <div className="text-xs opacity-20 font-mono mt-[2px] shrink-0">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="flex gap-2 min-w-0">
                    <Tippy
                        className="relative tippy-no-padding border-2"
                        trigger="click"
                        interactive={true}
                        content={
                            <>
                                <div className="h-full w-full absolute top-0 left-0 opacity-40"
                                    style={{
                                        background: `url(${WALLPAPER[msg.wallet ? (profileCache[msg.wallet] as UserProfileExtended | undefined)?.wallpaper ?? 0 : 0]})`,
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                    }} />

                                <div className="text-xs font-boldy p-2">
                                    {!msg.wallet ? <div className="relative flex text-[1.2em] p-4">
                                        Anonymous
                                    </div> : null}

                                    {msg.wallet && profileCache[msg.wallet] ?
                                        <div className="w-[25em] h-[9em] relative flex">
                                            <div className={twMerge("h-[9em] w-[9em] rounded-full overflow-hidden z-20 border-bcolor border-2")} style={{
                                                background: `url(${PROFILE_PICTURES[(profileCache[msg.wallet] as UserProfileExtended).profilePicture]})`,
                                                backgroundSize: 'cover',
                                            }} />

                                            <div className="flex flex-col w-[16em] pl-3 items-center justify-evenly">
                                                <div className="w-full flex flex-col items-center">
                                                    <div className="text-base truncate max-w-full">{(profileCache[msg.wallet] as UserProfileExtended).nickname || msg.wallet}</div>
                                                    <div className="h-[1px] w-full bg-white opacity-90 mt-1 mb-1" />
                                                </div>

                                                {/* TODO: reactivate once we have plugged in offchain API data */}
                                                {/* <div className="flex flex-col w-full gap-1">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div className="text-xs font-boldy">Trading Volume</div>
                                                        <FormatNumber
                                                            nb={(profileCache[msg.wallet] as UserProfileExtended).totalTradeVolumeUsd}
                                                            format="currency"
                                                            precision={0}
                                                            isDecimalDimmed={false}
                                                            className='border-0 text-xs'
                                                            isAbbreviate={true}
                                                        />
                                                    </div>

                                                    <div className="flex justify-between items-center w-full">
                                                        <div className="text-xs font-boldy">PnL</div>
                                                        <FormatNumber
                                                            nb={(profileCache[msg.wallet] as UserProfileExtended).totalPnlUsd}
                                                            format="currency"
                                                            precision={0}
                                                            isDecimalDimmed={false}
                                                            className='border-0 text-xs'
                                                        />
                                                    </div>

                                                    <div className="flex justify-between items-center w-full">
                                                        <div className="text-xs font-boldy">Fees Paid</div>
                                                        <FormatNumber
                                                            nb={(profileCache[msg.wallet] as UserProfileExtended).totalFeesPaidUsd}
                                                            format="currency"
                                                            precision={0}
                                                            isDecimalDimmed={false}
                                                            className='border-0 text-xs'
                                                        />
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                        : msg.wallet && profileCache[msg.wallet] === false ?
                                            <div className="relative flex text-[1.2em] p-4">
                                                No profile
                                            </div> : <Loader />}
                                </div>
                            </>
                        }
                    >
                        <div
                            className="text-sm font-boldy cursor-pointer hover:underline shrink-0"
                            style={{
                                color: msg.wallet && wallet && msg.wallet === wallet.publicKey.toBase58()
                                    ? '#e1aa2a'
                                    : msg.wallet
                                        ? generateColorFromString(msg.wallet)
                                        : '#9ca3af'
                            }}
                            onMouseEnter={() => msg.wallet && loadProfile(msg.wallet)}
                        >
                            {msg.username ?? msg.wallet?.slice(0, 8) ?? 'anon'}
                        </div>
                    </Tippy>

                    <div className="text-sm font-regular text-txtfade break-words min-w-0">{msg.text}</div>
                </div>
            </div>;
        });
    }, [isOpen, loadProfile, messages, profileCache, wallet]);

    return (
        <>
            <div className={className} style={style}>
                <div
                    className="h-[3em] flex gap-2 items-center justify-between pl-4 pr-4 border-b flex-shrink-0 opacity-90 hover:opacity-100 cursor-pointer"
                    onClick={() => clickOnHeader()}
                >
                    <Image
                        src={collapseIcon}
                        alt="collapse logo"
                        width={10}
                        height={10}
                    />

                    <div className="flex gap-2">
                        <div className="text-sm font-archivoblack uppercase">Live Chat</div><div className="text-xxs font-thin uppercase">{"beta"}</div>
                    </div>

                    <div className="flex gap-2">
                        <LiveIcon />
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleUserList?.();
                            }}
                        >
                            <div className="text-xs flex mt-[0.1em] font-archivoblack text-txtfade">
                                {nbConnectedUsers === null ? '-' : nbConnectedUsers}
                            </div>
                            <Image
                                src={groupIcon}
                                alt="group logo"
                                width={18}
                                height={18}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative flex grow overflow-hidden">
                    <div className={twMerge(
                        "p-4 flex flex-col h-[calc(100% - 9em)] max-h-[calc(100% - 9em)] flex-grow w-full overflow-auto custom-chat-scrollbar transition-all duration-300",
                        showUserList && "w-[calc(100%-160px)] blur-[2px]"
                    )} ref={containerRef}>
                        {messagesDOM}
                    </div>

                    <div className={twMerge(
                        "absolute top-0 right-0 w-[180px] h-full bg-[#070F16] border-l border-gray-800 transition-transform duration-300 ease-in-out shadow-xl",
                        showUserList ? "translate-x-0" : "translate-x-full"
                    )}>
                        <div className="flex flex-col h-full">
                            <div className="p-3 border-b border-gray-800">
                                <h3 className="text-xs font-archivoblack uppercase text-gray-400">Online Users</h3>
                            </div>
                            <div className="p-3 overflow-y-auto custom-chat-scrollbar flex-grow">
                                {anonymousCount > 0 && (
                                    <div className="mb-3 text-xs text-gray-500">
                                        {anonymousCount} anonymous user{anonymousCount > 1 ? 's' : ''} and :
                                    </div>
                                )}
                                {connectedUsers.filter(user => user.nickname).map((user, i) => (
                                    <div key={i} className="mb-1.5">
                                        <Tippy
                                            className="relative tippy-no-padding border-2"
                                            trigger="click"
                                            interactive={true}
                                            content={
                                                <>
                                                    <div className="h-full w-full absolute top-0 left-0 opacity-40"
                                                        style={{
                                                            background: `url(${WALLPAPER[user.wallet ? (profileCache[user.wallet] as UserProfileExtended | undefined)?.wallpaper ?? 0 : 0]})`,
                                                            backgroundSize: 'cover',
                                                            backgroundRepeat: 'no-repeat',
                                                        }}
                                                    />
                                                    <div className="text-xs font-boldy p-2">
                                                        {profileCache[user.wallet] ? (
                                                            <div className="w-[25em] h-[9em] relative flex">
                                                                <div className="h-[9em] w-[9em] rounded-full overflow-hidden z-20 bg-cover border-bcolor border-2"
                                                                    style={{
                                                                        background: `url(${PROFILE_PICTURES[(profileCache[user.wallet] as UserProfileExtended).profilePicture]})`,
                                                                    }}
                                                                />
                                                                <div className="flex flex-col w-[16em] pl-3 items-center justify-evenly">
                                                                    <div className="w-full flex flex-col items-center">
                                                                        <div className="text-base truncate max-w-full">{(profileCache[user.wallet] as UserProfileExtended).nickname}</div>
                                                                        <div className="h-[1px] w-full bg-white opacity-90 mt-1 mb-1" />
                                                                    </div>
                                                                    <div className="flex flex-col w-full gap-1">
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div className="text-xs font-boldy">Trading Volume</div>
                                                                            <FormatNumber
                                                                                nb={(profileCache[user.wallet] as UserProfileExtended).totalTradeVolumeUsd}
                                                                                format="currency"
                                                                                precision={0}
                                                                                isDecimalDimmed={false}
                                                                                className='border-0 text-xs'
                                                                                isAbbreviate={true}
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div className="text-xs font-boldy">PnL</div>
                                                                            <FormatNumber
                                                                                nb={(profileCache[user.wallet] as UserProfileExtended).totalPnlUsd}
                                                                                format="currency"
                                                                                precision={0}
                                                                                isDecimalDimmed={false}
                                                                                className='border-0 text-xs'
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div className="text-xs font-boldy">Fees Paid</div>
                                                                            <FormatNumber
                                                                                nb={(profileCache[user.wallet] as UserProfileExtended).totalFeesPaidUsd}
                                                                                format="currency"
                                                                                precision={0}
                                                                                isDecimalDimmed={false}
                                                                                className='border-0 text-xs'
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : <Loader />}
                                                    </div>
                                                </>
                                            }
                                        >
                                            <div
                                                className="text-xs truncate cursor-pointer hover:underline"
                                                style={{ color: generateColorFromString(user.wallet) }}
                                                onMouseEnter={() => loadProfile(user.wallet)}
                                            >
                                                {user.nickname}
                                            </div>
                                        </Tippy>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-[6em] w-full items-center justify-between flex-shrink-0">
                    <InputString
                        onChange={(value: string | null) => setInput(value ?? '')}
                        placeholder="Send a message"
                        value={input}
                        className={twMerge("pt-[0.5em] pb-[0.5em] pl-4 pr-4 border border-gray-700 bg-transparent rounded-lg w-[90%] text-txtfade placeholder:text-txtfade", wallet ? '' : 'opacity-40')}
                        inputFontSize="0.8em"
                        onEnterKeyPressed={sendMessage}
                        disabled={!wallet}
                    />

                    <div className="flex w-full justify-between">
                        {displaySmileys ? <div className="flex gap-2 pl-8 grow relative bottom-2">
                            {smileys.map((emoji, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput((prev) => `${prev}${emoji}`)}
                                    className="text-xl hover:scale-110 transition-transform"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div> : null}

                        <div className={twMerge("flex", displaySmileys ? '' : 'ml-auto')}>
                            {
                                wallet ?
                                    <Button title="Send" onClick={sendMessage} className="w-16 ml-auto rounded-lg font-boldy bg-[#E2464A] text-white text-[0.8em] mb-4 mr-5" disabled={!wallet} /> :
                                    <Button title="Connect Wallet" onClick={handleConnectionClick} className="w-25 ml-auto rounded-lg font-boldy bg-[#E2464A] text-white text-[0.8em] mb-4 mr-5" />
                            }
                        </div>
                    </div>


                </div>
            </div >
        </>
    );
}

export default React.memo(Chat);