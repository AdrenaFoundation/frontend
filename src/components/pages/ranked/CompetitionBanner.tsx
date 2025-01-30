import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import timerBg from '@/../../public/images/genesis-timer-bg.png';
import jitoLogo from '@/../../public/images/jito-logo.svg';
import jtoLogo from '@/../../public/images/jito-logo-2.png';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import useCountDown from '@/hooks/useCountDown';
import { useSelector } from '@/store/store';
import { ImageRef } from '@/types';

export default function CompetitionBanner({
    banner,
    title,
    subTitle,
    gradientColor,
    startDate,
    endDate,
}: {
    banner: ImageRef;
    endDate: Date | null;
    startDate: Date;
    title?: string;
    subTitle?: string;
    gradientColor?: string;
}) {
    const { days, hours, minutes, seconds } = useCountDown(
        new Date(),
        new Date(Date.UTC(2025, 1, 1)),
    );

    const tokenPrices = useSelector((s) => s.tokenPrices);

    const totalPrize = useMemo(() => {
        return 5000000 * (tokenPrices['ADX'] ?? 0) + 50000 * (tokenPrices['JTO'] ?? 0);
    }, [tokenPrices]);

    return (
        <div className="relative">
            <div className="relative flex flex-col items-center w-full h-[30em] justify-center border-b">
                <div className="mt-[4em]">
                    <AnimatePresence>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{}}
                            key={title}
                        >
                            <Image
                                src={banner}
                                alt="competition banner"
                                className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
                            />
                        </motion.span>
                    </AnimatePresence>
                    <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                    <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                    <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                </div>

                <div className="z-10 text-center">
                    <p className="text-lg tracking-[0.2rem] uppercase">{subTitle}</p>
                    <h1
                        className={twMerge(
                            'text-[2.5em] sm:text-[3em] md:text-[4em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                            gradientColor,
                        )}
                    >
                        {title}
                    </h1>
                </div>

                {startDate && startDate >= new Date() ? (
                    <ul className="flex flex-row gap-3 md:gap-9 mt-2 px-6 md:px-9 p-3 bg-black/40 rounded-lg z-10">
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {days >= 0 ? days : '–'}
                            </p>
                            <p className="text-center text-sm font-boldy tracking-widest">
                                Days
                            </p>
                        </li>
                        <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {Number(hours) >= 0 ? hours : '–'}
                            </p>
                            <p className="text-center text-sm font-boldy tracking-widest">
                                Hours
                            </p>
                        </li>
                        <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {Number(minutes) >= 0 ? minutes : '–'}
                            </p>
                            <p className="text-center text-sm font-boldy tracking-widest">
                                Minutes
                            </p>
                        </li>
                        <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {Number(seconds) >= 0 ? seconds : '–'}
                            </p>
                            <p className="text-center text-sm font-boldy tracking-widest">
                                seconds
                            </p>
                        </li>
                    </ul>
                ) : null}

                <div className='flex flex-col mt-8 z-10 items-center'>
                    <div className='text-xs font-thin text-txtfade'>PRIZE POOL</div>

                    <div className='w-[20em] flex items-center justify-center rounded-lg flex-col'>
                        {!tokenPrices["ADX"] || !tokenPrices["JTO"] ? '-' :
                            <FormatNumber
                                format='currency'
                                nb={totalPrize}
                                className="text-5xl font-boldy"
                                isDecimalDimmed={false}
                            />}

                        <div className='flex gap-1 rounded-lg pt-2 pb-2 pl-4 pr-4'>
                            <div className="flex flex-row gap-1 items-center justify-center">
                                <Image
                                    src={window.adrena.client.adxToken.image}
                                    alt="ADX logo"
                                    className="w-4 h-4"
                                />

                                <p className="text-md font-boldy text-txtfade">
                                    5,000,000 ADX
                                </p>
                            </div>

                            <div className='flex text-txtfade'>/</div>

                            <div className="flex flex-row gap-1 items-center justify-center">
                                <Image src={jtoLogo} alt="JTO logo" className="w-5 h-5" />

                                <p className="text-md font-boldy text-txtfade">
                                    50,000 JTO
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={twMerge(
                        'flex flex-row items-center gap-3 z-10 sm:absolute sm:bottom-6 sm:right-8',
                        startDate && startDate >= new Date() ? 'mt-[2em]' : 'mt-[4em]',
                    )}
                >
                    <p className="tracking-[0.2rem] uppercase">Sponsored by</p>
                    <Image
                        src={jitoLogo}
                        alt="jito logo"
                        className="w-[3em] md:w-[4em]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-center">
                <div className="absolute -translate-y-0.5 font-mono z-10 flex items-center justify-center">
                    {startDate && endDate && endDate.getTime() > Date.now() ? (
                        startDate <= new Date() ? (
                            <>
                                <RemainingTimeToDate
                                    timestamp={endDate.getTime() / 1000}
                                    className="items-center text-base"
                                    tippyText=""
                                />
                                <span className="ml-2 text-base font-boldy tracking-widest">
                                    left
                                </span>
                            </>
                        ) : (
                            <span className="font-boldy tracking-widest text-sm">
                                Begins{' '}
                                {startDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        )
                    ) : (
                        <span className="font-boldy tracking-widest text-sm">
                            Competition has ended
                        </span>
                    )}
                </div>

                <Image
                    src={timerBg}
                    alt="background graphic"
                    className="w-[300px] rotate-[180deg]"
                />
            </div>
        </div>);
}