import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import lockIcon from '@/../public/images/Icons/lock.svg';
import { USER_PROFILE_TITLES } from '@/constant';
import { AchievementInfo } from "@/types";

// Category color mapping for easier maintenance
const getCategoryColor = (category: string) => {
    switch (category) {
        // Bronze: Bronze/amber monster card
        case 'bronze': return {
            border: '#c0741e',
            accent: '#8b5513',
            bg: '#d3b987',
            titleBg: '#c3ad7e',
            text: '#000000'
        };
        // Silver: Silver monster card
        case 'silver': return {
            border: '#9aa1ac',
            accent: '#6e7b8b',
            bg: '#c0c7d1',
            titleBg: '#a9b2be',
            text: '#000000'
        };
        // Gold: Gold monster card
        case 'gold': return {
            border: '#d4af37',
            accent: '#b8860b',
            bg: '#ffd700',
            titleBg: '#f0c93b',
            text: '#000000'
        };
        // Platinum: Green-teal monster card
        case 'platinum': return {
            border: '#2a8a6a',
            accent: '#1e6a4f',
            bg: '#3dab85',
            titleBg: '#2a8a6a',
            text: '#ffffff'
        };
        // Diamond: Dark monster card
        case 'diamond': return {
            border: '#1c4a75',
            accent: '#0f2b47',
            bg: '#2980b9',
            titleBg: '#1f6aa1',
            text: '#ffffff'
        };
        default: return {
            border: '#c0741e',
            accent: '#8b5513',
            bg: '#d3b987',
            titleBg: '#c3ad7e',
            text: '#000000'
        };
    }
};

export default function Achievement({
    achievement,
    unlocked,
}: {
    achievement: AchievementInfo;
    unlocked: boolean;
}) {
    // Get appropriate color for this achievement category
    const categoryColors = getCategoryColor(achievement.category);

    const unlocks = useMemo(() => {
        const unlocks = [];

        if (typeof achievement.titleUnlock !== 'undefined') {
            unlocks.push(`"${USER_PROFILE_TITLES[achievement.titleUnlock]}" title`);
        }

        if (typeof achievement.pfpUnlock !== 'undefined') {
            unlocks.push('unique pfp');
        }

        if (typeof achievement.wallpaperUnlock !== 'undefined') {
            unlocks.push('unique wallpaper');
        }

        return unlocks.join(' + ');
    }, [achievement.pfpUnlock, achievement.titleUnlock, achievement.wallpaperUnlock]);

    return (
        <>
            <Tippy content={unlocked ? `Unlocked achievement` : `Achievement locked`}>
                <div
                    className={twMerge(
                        "relative mx-auto mb-6 w-[18em] h-[30em]",
                        unlocked ? "" : "opacity-60 grayscale",
                    )}
                >
                    {/* Monster card style frame with comic elements */}
                    <div
                        className={twMerge(
                            "absolute inset-0 rounded-xl overflow-hidden",
                            "transform transition-all duration-200",
                            unlocked && "shadow-xl"
                        )}
                        style={{
                            backgroundColor: unlocked ? categoryColors.border : "#666",
                            padding: "0.375em",
                            boxShadow: unlocked ? `0 0 1em ${categoryColors.accent}40` : "none"
                        }}
                    >
                        {/* Card inner background */}
                        <div className="h-full w-full flex flex-col relative bg-gray-900 rounded-lg overflow-hidden">
                            {/* Card name banner - Blend of monster card with comic style */}
                            <div
                                className="relative px-2 py-1.5 flex items-center justify-between mx-2 mt-2 mb-2"
                                style={{
                                    backgroundColor: unlocked ? categoryColors.titleBg : "#777",
                                    border: `0.15em solid ${unlocked ? categoryColors.border : "#666"}`,
                                    borderRadius: "0.375em",
                                    boxShadow: "0.125em 0.125em 0.1875em rgba(0,0,0,0.2)"
                                }}
                            >
                                <div className="flex items-center w-full h-6">
                                    <h3
                                        className="font-bold w-full"
                                        style={{
                                            color: categoryColors.text,
                                            fontSize: `${Math.max(0.65, Math.min(1, 28 / Math.max(10, achievement.title.length)))}em`,
                                            lineHeight: '1.2',
                                            textAlign: 'left'
                                        }}
                                        title={achievement.title}
                                    >
                                        {achievement.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Card image with comic style border */}
                            <div className="relative mx-auto mb-2" style={{ width: "90%" }}>
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        border: `0.2em solid ${unlocked ? categoryColors.border : "#666"}`,
                                        borderRadius: "0.375em",
                                        height: "13em",
                                    }}
                                >
                                    {/* Card ID indicator in top right */}
                                    <div
                                        className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-md flex items-center gap-1"
                                        style={{
                                            background: `linear-gradient(135deg, ${unlocked ? categoryColors.titleBg : "#777"} 0%, ${unlocked ? categoryColors.bg : "#666"} 100%)`,
                                            border: `0.0625em solid ${unlocked ? categoryColors.border : "#666"}`,
                                            boxShadow: `0 0.125em 0.25em rgba(0,0,0,0.2)`,
                                        }}
                                    >
                                        <span className="text-[0.55em] font-medium" style={{
                                            color: unlocked ? categoryColors.text : "#999",
                                            textShadow: "0.03125em 0.03125em 0 rgba(0,0,0,0.1)"
                                        }}>
                                            ADRENA-ACH-{achievement.index.toString().padStart(3, '0')}
                                        </span>
                                    </div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="w-full h-full object-cover"
                                        src={achievement.image}
                                        alt="Achievement"
                                    />
                                    {!unlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <Image
                                                src={lockIcon}
                                                width={45}
                                                height={45}
                                                alt="lock icon"
                                                className="opacity-60"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category banner similar to monster card type line but with comic styling */}
                            <div
                                className="px-2 py-0.5 mx-2 mb-2 flex items-center justify-between"
                                style={{
                                    backgroundColor: unlocked ? categoryColors.bg : "#777",
                                    borderTop: `0.1em solid ${unlocked ? categoryColors.border : "#666"}`,
                                    borderBottom: `0.1em solid ${unlocked ? categoryColors.border : "#666"}`,
                                }}
                            >
                                <div className="flex items-center">
                                    {/* Category icon */}

                                    <span className="text-black font-bold uppercase tracking-wide text-xs">
                                        {achievement.category} Achievement
                                    </span>
                                </div>

                                {/* Points display in comic style starburst */}
                                {unlocked && (
                                    <div
                                        className="flex items-center justify-center"
                                        style={{
                                            background: "#e74c3c",
                                            width: "3em",
                                            height: "2.5em",
                                            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                                            border: "0.1em solid #c0392b"
                                        }}
                                    >
                                        <span className="font-bold text-white text-xs" style={{ textShadow: "0.0625em 0.0625em 0 rgba(0,0,0,0.5)" }}>
                                            {achievement.points}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Description and flavor text with monster card layout but comic styling */}
                            <div
                                className="flex-1 mx-2 rounded-md flex flex-col overflow-hidden"
                                style={{
                                    backgroundColor: "#f0ebd8",
                                    border: `0.15em solid ${unlocked ? categoryColors.border : "#666"}`,
                                    marginBottom: "0.5em"
                                }}
                            >
                                {/* Description section */}
                                <div
                                    className="p-2 flex-1"
                                    style={{
                                        borderBottom: `0.0625em solid ${unlocked ? "#d0cbb8" : "#999"}`
                                    }}
                                >
                                    <div className="text-black font-medium mb-1.5 leading-tight text-xs" >
                                        {achievement.description}
                                    </div>

                                    {/* Flavor text */}
                                    <div className="text-black/70 italic mt-1.5 pt-1.5 text-xs" style={{
                                        borderTop: "0.0625em dashed #d0cbb8",
                                    }}>
                                        {achievement.story}
                                    </div>
                                </div>

                                {/* Unlocks info */}
                                {unlocks.length > 0 && (
                                    <div
                                        className="bg-gray-100 p-1.5 flex items-center"
                                        style={{
                                            borderTop: `0.0625em solid ${unlocked ? "#d0cbb8" : "#999"}`
                                        }}
                                    >
                                        <span className="mb-[0.2em]"> <Image
                                            src={lockIcon}
                                            width={15}
                                            height={15}
                                            alt="unlock"
                                            className="opacity-50"
                                        /></span>

                                        <span className="text-black/80 text-xs">
                                            {unlocks}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Tippy>
        </>
    );
}