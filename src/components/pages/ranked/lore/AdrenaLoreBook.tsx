import { useRef, useState } from "react";
import Chapter1 from "./Chapter1";
import { twMerge } from "tailwind-merge";

export default function AdrenaLoreBook() {
    const [chapter, setChapter] = useState<number>(0);
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [mode, setMode] = useState<'light' | 'dark'>('dark');

    const goToChapter = (n: number) => {
        setChapter(n);
        setTimeout(() => {
            anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    return (
        <div className='flex flex-col gap-2'>
            <div ref={anchorRef} />

            <div className="flex border pl-4 pr-4 pt-2 pb-2 gap-6 items-center bg-black/30">
                <h2 className="text-md font-['system-ui']" style={{
                    color: "rgb(191, 185, 185)",
                }}>Chapters</h2>

                <div className="flex">
                    {["I", "II", "III", "IV"].map((label, index) => (
                        <div key={label} className="flex items-center">
                            <div
                                onClick={() => {
                                    // TODO: Change when having more than one chapter
                                    if (index === 0)
                                        setChapter(index);
                                }}
                                className={twMerge(
                                    "pl-4 pr-4",
                                    chapter === index ? 'opacity-100' : 'opacity-50',
                                    // TODO: Change when having more than one chapter
                                    index > 0 ? 'cursor-not-allowed hover:opacity-100' : 'cursor-pointer',
                                )}
                            >
                                {label}
                            </div>
                            {index < 3 && <div className="text-txtfade">/</div>}
                        </div>
                    ))}
                </div>

                {mode === 'dark' ?
                    <div
                        className="rounded-full bg-black border ml-auto cursor-pointer text-sm pt-1 pb-1 pr-2 pl-2 text-white/60 hover:text-white"
                        onClick={() => setMode('light')}
                    >dark mode</div> :
                    <div
                        className="rounded-full bg-white/90 border ml-auto cursor-pointer text-sm pt-1 pb-1 pr-2 pl-2 text-black"
                        onClick={() => setMode('dark')}
                    >light mode</div>}
            </div>

            <div className={twMerge(
                'chapter-wrapper flex flex-col gap-2 max-w-[40em] border p-4',
                mode === 'light' ? 'bg-white/90 chapter-wrapper-light' : 'bg-black/30 chapter-wrapper-dark',
            )}
            >
                {chapter === 0 && <Chapter1 className="flex flex-col gap-3" />}
            </div>

            {/* TODO: Change when having more than one chapter */}

            {/* <div className="flex border pl-4 pr-4 pt-2 pb-2 gap-6 items-center relative justify-between">
                <div
                    onClick={() => goToChapter(Math.max(chapter - 1, 0))}
                    className={twMerge("text-sm cursor-pointer", chapter === 0 ? "text-txtfade" : "")}
                >
                    previous chapter
                </div>

                {chapter < 3 && (
                    <div className="text-sm cursor-pointer" onClick={() => goToChapter(Math.min(chapter + 1, 3))}>
                        next chapter
                    </div>
                )}
            </div>*/ }
        </div>
    );
}
