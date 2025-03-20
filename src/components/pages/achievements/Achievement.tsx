import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import lockIcon from '@/../public/images/Icons/lock.svg';
import { AchievementInfo } from "@/types";

// Category color mapping for easier maintenance
const getCategoryColor = (category: string) => {
    switch (category) {
        case 'bronze': return { border: 'from-amber-900 to-amber-700', text: 'text-amber-200', bg: 'bg-gradient-to-b from-amber-950/80 to-amber-900/80' };
        case 'silver': return { border: 'from-gray-400 to-gray-300', text: 'text-gray-200', bg: 'bg-gradient-to-b from-gray-800/80 to-gray-700/80' };
        case 'gold': return { border: 'from-yellow-600 to-amber-500', text: 'text-yellow-100', bg: 'bg-gradient-to-b from-yellow-700/80 to-amber-500/80' };
        case 'platinum': return { border: 'from-emerald-600 to-emerald-400', text: 'text-emerald-200', bg: 'bg-gradient-to-b from-emerald-950/80 to-emerald-900/80' };
        case 'diamond': return { border: 'from-cyan-600 to-cyan-400', text: 'text-cyan-200', bg: 'bg-gradient-to-b from-cyan-950/80 to-cyan-900/80' };
        default: return { border: 'from-amber-900 to-amber-700', text: 'text-amber-200', bg: 'bg-gradient-to-b from-amber-950/80 to-amber-900/80' };
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

        if (achievement.titleUnlock && achievement.titleUnlock.length > 0) {
            unlocks.push(`"${achievement.titleUnlock}" title`);
        }

        if (achievement.pfpUnlock) {
            unlocks.push('unique pfp');
        }

        if (achievement.wallpaperUnlock) {
            unlocks.push('unique wallpaper');
        }

        return unlocks.join(' + ');
    }, [achievement.pfpUnlock, achievement.titleUnlock, achievement.wallpaperUnlock]);

    return (
        <>
            <Tippy content={unlocked ? `Grant ${achievement.points} achievements points` : `Unlock and get ${achievement.points} achievements points`}>
                <div
                    className={twMerge(
                        "relative h-[650px] w-[380px] mx-auto mb-8",
                        unlocked ? "" : "opacity-60 grayscale",
                    )}
                >
                    {/* Card frame with border */}
                    <div
                        className={twMerge(
                            "absolute inset-0 rounded-xl overflow-hidden p-[3px]",
                            !unlocked && "bg-gray-700"
                        )}
                        style={unlocked ? {
                            backgroundColor: achievement.category === 'bronze'
                                ? '#b45309'
                                : achievement.category === 'silver'
                                    ? '#9ca3af'
                                    : achievement.category === 'gold'
                                        ? '#F0B020'
                                        : achievement.category === 'platinum'
                                            ? '#10b981'
                                            : '#22d3ee'
                        } : {}}>
                        {/* Card glow effect */}
                        {unlocked && (
                            <div className="absolute inset-[-2px] rounded-lg bg-black/30 blur-sm -z-10"></div>
                        )}

                        {/* Card inner */}
                        <div className="bg-black h-full w-full rounded-xl overflow-hidden flex flex-col relative">
                            {/* Card name banner */}
                            <div className={twMerge(
                                "h-14 w-full px-3 flex items-center justify-center relative z-10",
                                unlocked ? categoryColors.bg : "bg-gradient-to-b from-gray-800/80 to-gray-700/80",
                                "border-b border-black/50"
                            )}>
                                <div className="absolute inset-0 opacity-20 bg-[url('/images/texture.png')] bg-repeat mix-blend-overlay"></div>
                                <div className="absolute top-1 right-1.5 h-5 w-5 flex items-center justify-center">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${unlocked ? " bg-gray-800/70 text-white" : "bg-black/40"}`}>
                                        <span className={`text-xs font-bold font-mono  ${unlocked ? "text-white/90" : "text-gray-400"}`}>
                                            {achievement.index}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-12 flex items-center justify-center w-full">
                                    <h3
                                        className={twMerge(
                                            "font-archivo font-bold text-center px-1 w-[85%]",
                                            "text-sm", // Slightly larger font size for titles
                                            unlocked ? "text-white" : "text-gray-300"
                                        )}
                                        style={unlocked && (achievement.category === 'platinum' || achievement.category === 'diamond') ? {
                                            textShadow: '0 0 5px rgba(255,255,255,0.5)'
                                        } : {}}
                                        title={achievement.title}
                                    >
                                        {achievement.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Card art */}
                            <div className="relative h-[280px] w-full overflow-hidden border-b border-black/50 flex items-center justify-center">
                                <img
                                    className="w-full h-[280px] object-cover"
                                    src={achievement.image}
                                    alt="Achievement"
                                    width={380}
                                    height={280}
                                />
                                {!unlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Image
                                            className="opacity-80"
                                            src={lockIcon}
                                            width={50}
                                            height={50}
                                            alt="lock icon"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Card type line */}
                            <div className={twMerge(
                                "h-10 w-full px-3 flex items-center justify-center text-xs font-medium border-b border-black/50 relative",
                                unlocked ? categoryColors.bg : "bg-gradient-to-b from-gray-800/80 to-gray-700/80",
                            )}>
                                <div className="flex items-center w-full justify-between">
                                    <span className="text-white font-semibold text-xs tracking-wide">
                                        {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)} • Achievement
                                    </span>
                                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-full ${unlocked ? "bg-gray-800/70 text-white shadow-sm" : "bg-black/40 text-white"}`}>
                                        {achievement.points} points
                                    </span>
                                </div>
                            </div>

                            {/* Card text box */}
                            <div className={twMerge(
                                "flex-grow flex flex-col p-3 relative text-center",
                                unlocked ? "bg-gradient-to-b from-gray-800/90 to-gray-900/90" : "bg-[#232323]"
                            )}>
                                <div className="absolute inset-0 opacity-10 bg-[url('/images/texture.png')] bg-repeat mix-blend-overlay"></div>

                                {/* Description */}
                                <div className={`my-2 font-medium ${achievement.description && achievement.description.length > 100 ? "text-[11px]" :
                                    achievement.description && achievement.description.length > 80 ? "text-xs" : "text-sm"
                                    } ${unlocked ? "text-white" : "text-white"}`}>
                                    {achievement.description}
                                </div>

                                {/* Flavor text */}
                                <div className={`italic mt-2 border-t border-gray-700 pt-2 ${achievement.story && achievement.story.length > 80 ? "text-[10px]" : "text-xs"
                                    } ${unlocked ? "text-gray-300" : "text-gray-400"}`}>
                                    {achievement.story}
                                </div>

                                {/* Card footer */}
                                {unlocks.length > 0 && (
                                    <div className="mt-auto pt-3 text-[11px] border-t border-gray-700">
                                        <div className="flex items-center justify-center gap-2">
                                            <Image
                                                src={lockIcon}
                                                width={14}
                                                height={14}
                                                alt="unlock"
                                                className="opacity-70"
                                            />
                                            <span className={unlocked ? "text-gray-300" : "text-gray-400"}>
                                                Unlocks: {unlocks}
                                            </span>
                                        </div>
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
