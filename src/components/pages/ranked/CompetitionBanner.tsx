import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import bonkLogo from '@/../../public/images/bonk.png';
import timerBg from '@/../../public/images/genesis-timer-bg.png';
import jitoLogo from '@/../../public/images/jito-logo.svg';
import jtoLogo from '@/../../public/images/jito-logo-2.png';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import useCountDown from '@/hooks/useCountDown';
import { useSelector } from '@/store/store';

// TODO: Need to refactor how we display seasons, we can't have something generic, too many things change between seasons
// Should be one banner per season
export default function CompetitionBanner({
    banner,
    title,
    subTitle,
    gradientColor,
    startDate,
    endDate,
    seasonName,
    adxRewards,
    bonkRewards,
    jtoRewards,
    usdcRewards,
    bannerClassName,
    jtoPrice,
}: {
    banner: string;
    endDate: Date | null;
    startDate: Date;
    title?: string;
    subTitle?: string;
    gradientColor?: string;
    seasonName: string;
    adxRewards: number;
    bonkRewards: number;
    jtoRewards: number;
    usdcRewards: number;
    bannerClassName: string;
    jtoPrice: number | null;
}) {
    const { days, hours, minutes, seconds } = useCountDown(
        new Date(),
        startDate,
    );

    const tokenPrices = useSelector((s) => s.tokenPrices);

    const totalPrize = useMemo(() => {
        return adxRewards * (tokenPrices.ADX ?? 0) + jtoRewards * (jtoPrice ?? 0) + bonkRewards * (tokenPrices.BONK ?? 0) + usdcRewards;
    }, [adxRewards, tokenPrices.ADX, tokenPrices.BONK, jtoRewards, jtoPrice, bonkRewards, usdcRewards]);

    return (
        <div className="relative z-20">
            <div className={twMerge("relative flex flex-col items-center w-full border-b", bannerClassName)}>
                <div className="mt-[4em]">
                    <AnimatePresence>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{}}
                            key={title}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {seasonName === 'interseason3' || seasonName === 'anniversary1' ? <div
                                className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-60"
                                style={{
                                    backgroundImage: `url(${banner})`,
                                    backgroundOrigin: 'border-box',
                                    backgroundPosition: 'center 20%'
                                }}
                            // eslint-disable-next-line @next/next/no-img-element
                            /> : <img
                                src={banner}
                                alt="competition banner"
                                className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
                            />}
                        </motion.span>
                    </AnimatePresence>
                    <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                    <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                    <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                </div>

                {seasonName !== 'factions' ? <div className="z-10 text-center">
                    <p className="text-lg tracking-[0.2rem] uppercase">{subTitle}</p>
                    <h1
                        className={twMerge(
                            'text-[2.2em] sm:text-[3em] md:text-[4em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                            gradientColor,
                        )}
                    >
                        {title}
                    </h1>
                </div> : <div className="z-10 text-center">
                    <p className="text-lg tracking-[0.2rem] uppercase">{subTitle}</p>
                    <div className='flex'>
                        <h1
                            className={twMerge(
                                'text-[2.5em] sm:text-[3em] md:text-[4em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)]',
                            )}
                        >
                            Fact
                        </h1>
                        <h1
                            className={twMerge(
                                'text-[2.5em] sm:text-[3em] md:text-[4em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#FA6724_40%,#FFD97C_60%,#FA6724)]',
                            )}
                        >
                            ions
                        </h1>
                    </div>
                </div>}

                {startDate && startDate.getTime() >= Date.now() ? (
                    <ul className="flex flex-row gap-3 md:gap-9 mt-2 px-6 md:px-9 p-3 bg-black/40 rounded-md z-10">
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {days >= 0 ? days : '–'}
                            </p>
                            <p className="text-center text-sm font-semibold tracking-widest">
                                Days
                            </p>
                        </li>
                        <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {Number(hours) >= 0 ? hours : '–'}
                            </p>
                            <p className="text-center text-sm font-semibold tracking-widest">
                                Hours
                            </p>
                        </li>
                        <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {Number(minutes) >= 0 ? minutes : '–'}
                            </p>
                            <p className="text-center text-sm font-semibold tracking-widest">
                                Minutes
                            </p>
                        </li>
                        <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                        <li className="flex flex-col items-center justify-center">
                            <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                                {Number(seconds) >= 0 ? seconds : '–'}
                            </p>
                            <p className="text-center text-sm font-semibold tracking-widest">
                                seconds
                            </p>
                        </li>
                    </ul>
                ) : null}

                {(adxRewards + jtoRewards + bonkRewards + usdcRewards) > 0 ? <div className='flex flex-col mt-8 z-10 items-center'>
                    <div className='text-xs font-thin text-txtfade tracking-wider'>{seasonName === 'factions' ? 'MAX' : null} PRIZE POOL</div>

                    <div className={twMerge('w-[20em] max-w-full flex items-center justify-center rounded-md flex-col')}>
                        {seasonName === 'factions'
                            ? <FormatNumber
                                format='currency'
                                nb={417564.28}
                                className="text-5xl font-semibold"
                                isDecimalDimmed={false}
                            />
                            : seasonName === 'expanse' ? <FormatNumber
                                format='currency'
                                nb={204396.55}
                                className="text-5xl font-semibold"
                                isDecimalDimmed={false}
                            /> : seasonName === 'awakening' ? <FormatNumber
                                format='currency'
                                nb={97166.49}
                                className="text-5xl font-semibold"
                                isDecimalDimmed={false}
                            /> : seasonName === 'interseason3' || seasonName === 'anniversary1' ?
                                <FormatNumber
                                    format='currency'
                                    nb={totalPrize}
                                    className="text-3xl sm:text-4xl md:text-5xl font-semibold"
                                    isDecimalDimmed={false}
                                />
                                : (!tokenPrices.ADX || !jtoPrice || !tokenPrices.BONK ? '-' :
                                    <FormatNumber
                                        format='currency'
                                        nb={totalPrize}
                                        className="text-5xl font-semibold"
                                        isDecimalDimmed={false}
                                    />
                                )}

                        <div className='flex gap-1 rounded-md pt-2 pb-2 pl-4 pr-4'>
                            {seasonName === 'anniversary1' ?
                                <div className="text-xs text-txtfade uppercase tracking-wider">Distributed in ADX</div>
                                : null}

                            {adxRewards > 0 ?
                                <div className="flex flex-row gap-1 items-center justify-center">
                                    <Image
                                        src={window.adrena.client.adxToken.image}
                                        alt="ADX logo"
                                        className="w-4 h-4"
                                    />

                                    <FormatNumber
                                        format='number'
                                        suffix='ADX'
                                        nb={adxRewards}
                                        precision={0}
                                        isAbbreviate={true}
                                        isAbbreviateIcon={false}
                                        className="text-md font-semibold text-txtfade"
                                        suffixClassName='text-base font-semibold text-txtfade'
                                        isDecimalDimmed={false}
                                    />

                                    {jtoRewards || bonkRewards ? <div className='flex text-md text-txtfade'>/</div> : null}
                                </div> : null}

                            {jtoRewards ? <>
                                <div className="flex flex-row gap-1 items-center justify-center">
                                    <Image src={jtoLogo} alt="JTO logo" className="w-5 h-5" />

                                    <FormatNumber
                                        format='number'
                                        suffix='JTO'
                                        nb={jtoRewards}
                                        precision={0}
                                        isAbbreviate={true}
                                        isAbbreviateIcon={false}
                                        className="text-md font-semibold text-txtfade"
                                        suffixClassName='text-base font-semibold text-txtfade'
                                        isDecimalDimmed={false}
                                    />
                                </div>
                            </> : null}

                            {bonkRewards ? <>
                                <div className='flex text-md text-txtfade'>/</div>

                                <div className="flex flex-row gap-1 items-center justify-center">
                                    <Image src={bonkLogo} alt="BONK logo" className="w-4 h-4" />

                                    <FormatNumber
                                        format='number'
                                        suffix='BONK'
                                        nb={bonkRewards}
                                        precision={0}
                                        isAbbreviate={true}
                                        isAbbreviateIcon={false}
                                        className="text-md font-semibold text-txtfade"
                                        suffixClassName='text-base font-semibold text-txtfade'
                                        isDecimalDimmed={false}
                                    />
                                </div>
                            </> : null}
                        </div>
                    </div>
                </div> : null}

                {seasonName !== 'anniversary1' ? <div
                    className={twMerge(
                        'flex flex-row items-center gap-3 z-10 sm:absolute sm:bottom-6 sm:right-8',
                        startDate && startDate.getTime() >= Date.now() ? 'mt-[2em]' : 'mt-[4em]',
                    )}
                >
                    <p className="tracking-[0.2rem] uppercase">Sponsored by</p>

                    <Image
                        src={jitoLogo}
                        alt="jito logo"
                        className="w-[3em] md:w-[4em]"
                    />

                    {seasonName === 'factions' || seasonName === 'interseason3' ? <>
                        <p className="tracking-[0.2rem] uppercase">And</p>

                        <Image
                            src={bonkLogo}
                            alt="BONK logo"
                            className="w-[1.7em] md:w-[2.5em]"
                        />
                    </> : null}
                </div> : null}
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
                                <span className="ml-2 text-base font-semibold tracking-widest">
                                    left
                                </span>
                            </>
                        ) : (
                            <span className="font-semibold tracking-widest text-sm">
                                Begins{' '}
                                {startDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        )
                    ) : (
                        <span className="font-semibold tracking-widest text-sm">
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
