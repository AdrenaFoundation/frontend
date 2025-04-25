import { Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import Tippy from '@tippyjs/react';
import { kv } from '@vercel/kv';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import {
    ALL_CHAT_ROOMS,
    ANNOUNCEMENTS_CHAT_ROOM_ID,
    BONK_CHAT_ROOM_ID,
    GENERAL_CHAT_ROOM_ID,
    JITO_CHAT_ROOM_ID,
    PROFILE_PICTURES,
    TEAMS_MAPPING,
    WALLPAPERS,
} from '@/constant';
import DataApiClient from '@/DataApiClient';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { useDispatch } from '@/store/store';
import {
    EnrichedTraderInfo,
    ProfilePicture,
    UserProfileExtended,
    UserProfileMetadata,
    Wallpaper,
} from '@/types';

import collapseIcon from '../../../public/images/collapse-all.svg';
import lockIcon from '../../../public/images/Icons/lock.svg';
// import groupIcon from '../../../public/images/group.svg';
import Button from '../common/Button/Button';
import InputString from '../common/inputString/InputString';
import LiveIcon from '../common/LiveIcon/LiveIcon';
import Loader from '../Loader/Loader';
import FormatNumber from '../Number/FormatNumber';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
);

const MAX_MESSAGES = 1000;
const OPEN_CHAT_TTL = 600000; // 10 minute TTL - in millisecond

interface Message {
    id: number;
    room_id: string;
    text: string;
    timestamp: string;
    username?: string;
    wallet?: string;
}

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
        const key = `connected:${roomId}:${walletAddress.toBase58()}`;

        // Check if key exists first
        const exists = await kv.exists(key);

        // Only set if it doesn't exist or is about to expire
        if (!exists) {
            await kv.set(key, true, { ex: expiryInSeconds });
            // Clear cache to force refresh
            connectedUsersCache.delete(`room_${roomId}`);
        }
    } catch (e) {
        console.error('Error tracking open chat:', e);
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

const connectedUsersCache = new Map<
    string,
    { count: number; timestamp: number }
>();
const CACHE_TTL = 5000;

const fetchConnectedUsers = async (roomId: number) => {
    try {
        const cacheKey = `room_${roomId}`;
        const cached = connectedUsersCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.count;
        }

        const keys = await kv.keys(`connected:${roomId}:*`);
        const count = keys.length;

        connectedUsersCache.set(cacheKey, {
            count,
            timestamp: Date.now(),
        });

        return count;
    } catch (e) {
        console.error('Error loading connected users', e);
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
    isMobile?: boolean;
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
    isMobile,
    // onToggleUserList,
}: ChatProps) {
    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const [roomId, setRoomId] = useState<number>(GENERAL_CHAT_ROOM_ID);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const [nbConnectedUsers, setNbConnectedUsers] = useState<number | null>(null);
    const [profileCache, setProfileCache] = useState<
        Record<string, EnrichedTraderInfo | null>
    >({});
    const dispatch = useDispatch();
    const smileys = ['😀', '😂', '❤️', '🔥', '👍']; // Predefined smileys
    const [, setConnectedUsers] = useState<ConnectedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingNbConnectedUsers, setIsLoadingNbConnectedUsers] =
        useState(false);

    const userProfilesMap = useMemo(() => {
        return allUserProfilesMetadata.reduce(
            (acc, profile) => {
                acc[profile.owner.toBase58()] = profile;
                return acc;
            },
            {} as Record<string, UserProfileMetadata>,
        );
    }, [allUserProfilesMetadata]);

    const handleConnectionClick = () => {
        dispatch(openCloseConnectionModalAction(true));
    };

    const fetchDetailedConnectedUsers = useCallback(
        async (roomId: number): Promise<ConnectedUser[]> => {
            if (!Object.keys(userProfilesMap).length) return [];
            setIsLoadingNbConnectedUsers(true);
            try {
                const keys = await kv.keys(`connected:${roomId}:*`);

                return keys.map((key) => {
                    const wallet = key.split(':')[2];

                    return {
                        wallet,
                        nickname: userProfilesMap[wallet]?.nickname ?? null,
                    };
                });
            } catch (e) {
                console.log('Error loading connected users', e);
                return [];
            } finally {
                setIsLoadingNbConnectedUsers(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [userProfilesMap],
    );

    const handleRoomChange = useCallback((newRoomId: number) => {
        setRoomId(newRoomId);
        setNbConnectedUsers(null);
        setIsLoadingNbConnectedUsers(true);

        fetchConnectedUsers(newRoomId).then((count) => {
            setNbConnectedUsers(count);
            setIsLoadingNbConnectedUsers(false);
        });
    }, []);

    useEffect(() => {
        const updateUsers = () => {
            fetchDetailedConnectedUsers(roomId).then((users) => {
                setNbConnectedUsers(users.length);
                setConnectedUsers(users);
            });
        };

        updateUsers();
        const interval = setInterval(updateUsers, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfilesMap]);

    useEffect(() => {
        setIsLoading(true);

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const { data } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('timestamp', { ascending: false }) // Get newest first
                    .limit(MAX_MESSAGES)
                    .then((result) => ({
                        ...result,
                        data: result.data?.reverse(), // Reverse to display in correct order
                    }));
                setMessages(data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('realtime:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`, // Filter by room_id
                },
                (payload) => {
                    console.log('New message received:', payload.new);

                    setMessages((prev) => {
                        const updatedMessages = [...prev, payload.new as Message];
                        // Keep the most recent 1000 messages
                        return updatedMessages.slice(-1000);
                    });
                },
            )
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED') {
                    console.error('Failed to subscribe to realtime channel:', status);
                }
            });

        return () => {
            supabase.removeChannel(channel); // Cleanup subscription
        };
    }, [roomId]);

    const userTeam = useMemo(() => {
        if (!userProfile || !wallet) {
            setRoomId(GENERAL_CHAT_ROOM_ID);
            return TEAMS_MAPPING.DEFAULT;
        }
        return userProfile ? userProfile.team : TEAMS_MAPPING.DEFAULT;
    }, [userProfile, wallet]);

    const sendMessage = async () => {
        if (input.trim()) {
            await supabase.from('messages').insert([
                {
                    room_id: roomId,
                    text: input,
                    wallet: wallet?.publicKey ?? null,
                    username: userProfile ? userProfile.nickname : null,
                },
            ]);
            setInput('');
        }
    };

    // Scroll to the bottom whenever messages change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (!wallet?.publicKey || !isOpen) return;

        let mounted = true;

        const updateUserCount = async () => {
            try {
                await trackOpenChat(roomId, wallet.publicKey);
                if (mounted) {
                    const count = await fetchConnectedUsers(roomId);
                    setNbConnectedUsers(count);
                }
            } catch (error) {
                console.error('Error updating user count:', error);
            }
        };

        updateUserCount();

        const interval = setInterval(updateUserCount, OPEN_CHAT_TTL - 30000);

        return () => {
            mounted = false;
            clearInterval(interval);

            if (isOpen) {
                trackCloseChat(roomId, wallet.publicKey).then(() => {
                    connectedUsersCache.delete(`room_${roomId}`);
                    fetchConnectedUsers(roomId).then((count) => {
                        setNbConnectedUsers(count);
                    });
                });
            }
        };
    }, [isOpen, wallet, roomId]);

    const loadProfile = useCallback(
        (wallet: string) => {
            if (profileLoading === wallet || profileCache[wallet]) return; // Do not load multiple time the same wallet

            profileLoading = wallet;

            DataApiClient.getTraderInfo({ walletAddress: wallet })
                .then((offchainProfile) => {
                    setProfileCache((prev) => ({
                        ...prev,
                        [wallet]: offchainProfile,
                    }));
                })
                .catch((e) => {
                    console.log('Error loading offchain profile info', e);

                    setProfileCache((prev) => ({
                        ...prev,
                        [wallet]: null,
                    }));
                });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [profileCache?.length ?? 0],
    );

    // const anonymousCount = useMemo(() => {
    //     return connectedUsers.filter(user => !user.nickname).length;
    // }, [connectedUsers]);

    const messagesDOM = useMemo(() => {
        if (!isOpen) return null;
        if (messages.length === 0) {
            return (
                <img
                    src={
                        'https://media.tenor.com/E5SHPD_-vaQAAAAi/no-messages-at-all-capt-aaron-spencer.gif'
                    }
                    alt="collapse logo"
                />
            );
        }

        return messages.map((msg) => {
            return (
                <div key={`message-${msg.id}`} className="flex gap-2 mb-1">
                    <div className="text-xs opacity-20 font-mono mt-[2px] shrink-0">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                    <div className="flex gap-2 min-w-0">
                        <Tippy
                            className="relative tippy-no-padding border-2"
                            trigger="click"
                            interactive={true}
                            content={
                                <>
                                    <div
                                        className="h-full w-full absolute top-0 left-0 opacity-40"
                                        style={{
                                            backgroundSize: 'cover',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundImage: `url(${WALLPAPERS[
                                                (msg.wallet && userProfilesMap[msg.wallet]
                                                    ? ((
                                                        userProfilesMap[
                                                        msg.wallet
                                                        ] as UserProfileMetadata
                                                    ).wallpaper ?? 0)
                                                    : 0) as Wallpaper
                                            ]
                                                })`,
                                        }}
                                    />

                                    <div className="text-xs font-boldy p-2">
                                        {!msg.wallet ? (
                                            <div className="relative flex text-[1.2em] p-4">
                                                Anonymous
                                            </div>
                                        ) : null}

                                        {msg.wallet ? (
                                            <div className="w-[25em] h-[9em] relative flex">
                                                <div
                                                    className={twMerge(
                                                        'h-[9em] w-[9em] rounded-full overflow-hidden z-20 border-bcolor border-2',
                                                    )}
                                                    style={{
                                                        backgroundImage: `url(${PROFILE_PICTURES[(userProfilesMap[msg.wallet] ? ((userProfilesMap[msg.wallet] as UserProfileMetadata).profilePicture ?? 0) : 0) as ProfilePicture]})`,
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundSize: 'cover',
                                                    }}
                                                />

                                                <div className="flex flex-col w-[16em] pl-3 items-center justify-evenly">
                                                    <div className="w-full flex flex-col items-center">
                                                        <div className="text-base truncate max-w-full">
                                                            {userProfilesMap[msg.wallet]
                                                                ? (
                                                                    userProfilesMap[
                                                                    msg.wallet
                                                                    ] as UserProfileMetadata
                                                                ).nickname || msg.wallet
                                                                : msg.wallet}
                                                        </div>
                                                        <div className="h-[1px] w-full bg-white opacity-90 mt-1 mb-1" />
                                                    </div>

                                                    <div className="flex flex-col w-full gap-1">
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="text-xs font-boldy">
                                                                Trading Volume
                                                            </div>
                                                            <FormatNumber
                                                                nb={profileCache[msg.wallet]?.totalVolume}
                                                                format="currency"
                                                                precision={0}
                                                                isDecimalDimmed={false}
                                                                className="border-0 text-xs"
                                                                isAbbreviate={true}
                                                            />
                                                        </div>

                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="text-xs font-boldy">PnL</div>
                                                            <FormatNumber
                                                                nb={profileCache[msg.wallet]?.totalPnl}
                                                                format="currency"
                                                                precision={0}
                                                                isDecimalDimmed={false}
                                                                className="border-0 text-xs"
                                                            />
                                                        </div>

                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="text-xs font-boldy">
                                                                Fees Paid
                                                            </div>
                                                            <FormatNumber
                                                                nb={profileCache[msg.wallet]?.totalFees}
                                                                format="currency"
                                                                precision={0}
                                                                isDecimalDimmed={false}
                                                                className="border-0 text-xs"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : msg.wallet &&
                                            userProfilesMap !== null &&
                                            !userProfilesMap[msg.wallet] ? (
                                            <div className="relative flex text-[1.2em] p-4">
                                                No profile
                                            </div>
                                        ) : (
                                            <Loader />
                                        )}
                                    </div>
                                </>
                            }
                        >
                            <div
                                className="text-sm font-boldy cursor-pointer hover:underline shrink-0"
                                style={{
                                    color:
                                        msg.wallet &&
                                            wallet &&
                                            msg.wallet === wallet.publicKey.toBase58()
                                            ? '#e1aa2a'
                                            : msg.wallet
                                                ? generateColorFromString(msg.wallet)
                                                : '#9ca3af',
                                }}
                                onClick={() => msg.wallet && loadProfile(msg.wallet)}
                            >
                                {msg.username ?? msg.wallet?.slice(0, 8) ?? 'anon'}
                            </div>
                        </Tippy>

                        <div className="text-sm font-regular text-txtfade break-words min-w-0">
                            {msg.text}
                        </div>
                    </div>
                </div>
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isOpen,
        roomId,
        loadProfile,
        messages,
        profileCache?.length ?? 0,
        userProfilesMap,
        wallet,
    ]);

    return (
        <div
            className={twMerge(
                'flex flex-row bg-[#070F16] rounded-t-lg border-2 shadow-md hover:shadow-lg',
                isMobile && 'border-0 w-full h-full',
            )}
            style={style}
        >
            {isOpen && !isMobile ? (
                <div className="flex flex-col gap-2 p-3 h-fit w-[10em]">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-boldy opacity-50">Community</p>
                        {Object.values(ALL_CHAT_ROOMS)
                            .filter((a) => a.group === 'channels')
                            .map(({ id, name }) => {
                                let isLocked = true

                                if (id === 0) {
                                    isLocked = false
                                }

                                if (userProfile && wallet && id !== userTeam && userTeam !== 0) {
                                    isLocked = false
                                }

                                return (
                                    <div
                                        className={twMerge(
                                            'p-1 px-2 flex-1 opacity-50 hover:opacity-100 rounded-md transition duration-300 cursor-pointer',
                                            id === roomId && 'opacity-100 bg-third border-white',
                                            isLocked && 'opacity-20 cursor-not-allowed hover:opacity-20',
                                        )}
                                        onClick={() => {
                                            if (isLocked) return;
                                            handleRoomChange(id);
                                        }}
                                        key={id}
                                    >
                                        <div className='flex flex-row gap-1 items-center'>
                                            {isLocked ? <Image src={lockIcon} alt="collapse logo" width={16} height={16} /> : <p>#</p>}
                                            <p className="text-sm font-boldy">{name}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="w-full h-[1px] bg-bcolor my-1" />

                    {/* <div className="flex flex-col gap-2">
                        <p className="text-xs font-boldy opacity-50">Information</p>
                        {Object.values(ALL_CHAT_ROOMS)
                            .filter((a) => a.group === 'information')
                            .map(({ id, name }) => {
                                return (
                                    <div
                                        className={twMerge(
                                            'p-1 px-2 flex-1 opacity-50 hover:opacity-100 rounded-md transition duration-300 cursor-pointer',
                                            id === roomId && 'opacity-100 bg-third border-white',
                                        )}
                                        onClick={() => {
                                            handleRoomChange(id);
                                        }}
                                        key={id}
                                    >
                                        <p className="text-sm font-boldy"># {name}</p>
                                    </div>
                                );
                            })}
                    </div> */}
                </div>
            ) : null}

            <div className={className}>
                <div
                    className="flex flex-row justify-between items-center p-2 border-b cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        clickOnHeader();

                        // DISABLE ALONG DISPLAYING THE LIST TO STOP MEMORY LEAK
                        // onToggleUserList?.();
                    }}
                >
                    <div className="flex flex-row items-center gap-2">
                        <p className="text-lg font-boldy ml-2">
                            <span className='text-lg opacity-50'># </span> {ALL_CHAT_ROOMS[roomId as keyof typeof ALL_CHAT_ROOMS].name}
                        </p>
                        <div className="flex flex-row gap-1 font-mono items-center">
                            <LiveIcon className="h-[0.6250em] w-[0.6250em]" />{' '}
                            <p className="text-sm opacity-50">
                                {isLoadingNbConnectedUsers
                                    ? '...'
                                    : nbConnectedUsers === null
                                        ? '-'
                                        : nbConnectedUsers}
                            </p>
                        </div>
                    </div>

                    {!isMobile ? (
                        <div className="border hover:bg-third h-[1.25em] w-[1.25em] rounded-md flex items-center justify-center cursor-pointer transition duration-300">
                            <Image
                                src={collapseIcon}
                                alt="collapse logo"
                                width={6}
                                height={6}
                            />
                        </div>
                    ) : null}
                </div>

                {userProfile && userTeam !== 0 && isMobile ? (
                    <div className="flex flex-row gap-2 p-1 border-b">
                        <div
                            className={twMerge(
                                'border p-1 flex-1 text-center rounded-md transition duration-300 opacity-50 cursor-pointer hover:opacity-100',
                                roomId === 0 && 'opacity-100 border-white',
                            )}
                            onClick={() => {
                                handleRoomChange(0);
                            }}
                        >
                            <p className="text-xs font-boldy"># General</p>
                        </div>

                        <div
                            className={twMerge(
                                'relative border p-1 flex-1 text-center rounded-md transition duration-300 cursor-pointer',
                                roomId !== 0
                                    ? userTeam === TEAMS_MAPPING.BONK
                                        ? 'opacity-100 border-[#fa6724]'
                                        : 'opacity-100 border-[#5AA6FA]'
                                    : '',
                            )}
                            onClick={() => {
                                handleRoomChange(
                                    userTeam === TEAMS_MAPPING.BONK
                                        ? BONK_CHAT_ROOM_ID
                                        : JITO_CHAT_ROOM_ID,
                                );
                            }}
                        >
                            <p
                                className={twMerge(
                                    'relative text-xs font-boldy z-10',
                                    userTeam === TEAMS_MAPPING.BONK
                                        ? 'text-[#fa6724]'
                                        : 'text-[#5AA6FA]',
                                )}
                            >
                                # Team {userTeam === TEAMS_MAPPING.BONK ? 'BONK' : 'JITO'}
                            </p>

                            <div
                                className={twMerge(
                                    'w-full h-full absolute left-0 top-0 bg-cover bg-no-repeat bg-center grayscale-0 opacity-20',
                                )}
                                style={{
                                    backgroundImage: `url(${WALLPAPERS[userTeam === TEAMS_MAPPING.BONK ? 11 : 12]})`,
                                }}
                            />
                        </div>
                    </div>
                ) : null}

                <div className="relative flex grow overflow-hidden">
                    <div
                        className={twMerge(
                            'p-4 flex flex-col h-[calc(100% - 9em)] max-h-[calc(100% - 9em)] flex-grow w-full overflow-auto custom-chat-scrollbar transition-all duration-300',
                            showUserList && 'w-[calc(100%-160px)] blur-[2px]',
                        )}
                        ref={containerRef}
                    >
                        {!isLoading ? (
                            messagesDOM
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                {' '}
                                <Loader />{' '}
                            </div>
                        )}
                    </div>

                    <div
                        className={twMerge(
                            'absolute top-0 right-0 w-[180px] h-full bg-[#070F16] border-l border-gray-800 transition-transform duration-300 ease-in-out shadow-xl',
                            showUserList ? 'translate-x-0' : 'translate-x-full',
                        )}
                    >
                        <div className="flex flex-col h-full">
                            <div className="p-3 border-b border-gray-800">
                                <h3 className="text-xs font-archivoblack uppercase text-gray-400">
                                    Online Users
                                </h3>
                            </div>

                            {/* <div className="p-3 overflow-y-auto custom-chat-scrollbar flex-grow">
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
                                                            backgroundImage: `url(${WALLPAPERS[
                                                                ((user.wallet && userProfilesMap[user.wallet]) ? ((userProfilesMap[user.wallet] as UserProfileMetadata).wallpaper ?? 0) : 0) as Wallpaper
                                                            ]})`,
                                                            backgroundSize: 'cover',
                                                            backgroundRepeat: 'no-repeat',
                                                        }}
                                                    />
                                                    <div className="text-xs font-boldy p-2">
                                                        {profileCache[user.wallet] ? (
                                                            <div className="w-[25em] h-[9em] relative flex">
                                                                <div className="h-[9em] w-[9em] rounded-full overflow-hidden z-20 bg-cover border-bcolor border-2"
                                                                    style={{
                                                                        backgroundImage: `url(${PROFILE_PICTURES[(userProfilesMap[user.wallet] ? (userProfilesMap[user.wallet] as UserProfileMetadata).profilePicture ?? 0 : 0) as ProfilePicture]})`,
                                                                    }}
                                                                />
                                                                <div className="flex flex-col w-[16em] pl-3 items-center justify-evenly">
                                                                    <div className="w-full flex flex-col items-center">
                                                                        <div className="text-base truncate max-w-full">{
                                                                            userProfilesMap[user.wallet] ?
                                                                                (userProfilesMap[user.wallet] as UserProfileMetadata).nickname || user.wallet : user.wallet}</div>
                                                                        <div className="h-[1px] w-full bg-white opacity-90 mt-1 mb-1" />
                                                                    </div>
                                                                    <div className="flex flex-col w-full gap-1">
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div className="text-xs font-boldy">Trading Volume</div>
                                                                            <FormatNumber
                                                                                nb={profileCache[user.wallet]?.totalVolume}
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
                                                                                nb={profileCache[user.wallet]?.totalPnl}
                                                                                format="currency"
                                                                                precision={0}
                                                                                isDecimalDimmed={false}
                                                                                className='border-0 text-xs'
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div className="text-xs font-boldy">Fees Paid</div>
                                                                            <FormatNumber
                                                                                nb={profileCache[user.wallet]?.totalFees}
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
                            </div> */}
                        </div>
                    </div>
                </div>

                {roomId !== ANNOUNCEMENTS_CHAT_ROOM_ID && isOpen ? (
                    <div className="flex flex-col h-[6em] w-full items-center justify-between flex-shrink-0">
                        <InputString
                            onChange={(value: string | null) => setInput(value ?? '')}
                            placeholder="Send a message"
                            value={input}
                            className={twMerge(
                                'pt-[0.5em] pb-[0.5em] pl-4 pr-4 border border-gray-700 bg-transparent rounded-lg w-[90%] text-txtfade placeholder:text-txtfade',
                                wallet ? '' : 'opacity-40',
                            )}
                            inputFontSize="0.8em"
                            onEnterKeyPressed={sendMessage}
                            disabled={!wallet}
                        />

                        <div className="flex w-full justify-between">
                            {displaySmileys ? (
                                <div className="flex gap-2 pl-8 grow relative bottom-2">
                                    {smileys.map((emoji, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput((prev) => `${prev}${emoji}`)}
                                            className="text-xl hover:scale-110 transition-transform"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            <div className={twMerge('flex', displaySmileys ? '' : 'ml-auto')}>
                                {wallet ? (
                                    <Button
                                        title="Send"
                                        onClick={sendMessage}
                                        className="w-16 ml-auto rounded-lg font-boldy bg-[#E2464A] text-white text-[0.8em] mb-4 mr-5"
                                        disabled={!wallet}
                                    />
                                ) : (
                                    <Button
                                        title="Connect Wallet"
                                        onClick={handleConnectionClick}
                                        className="w-25 ml-auto rounded-lg font-boldy bg-[#E2464A] text-white text-[0.8em] mb-4 mr-5"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default React.memo(Chat);
