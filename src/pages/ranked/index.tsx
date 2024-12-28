import Image from 'next/image';
import Confetti from 'react-confetti-boom';

import aboBanner from '@/../public/images/abo-banner.png';
import awekningBanner from '@/../public/images/comp-banner.png';
import discordIcon from '@/../public/images/discord-black.svg';
import levBanner from '@/../public/images/lev-banner.png';
import leviathanCup from '@/../public/images/leviathan.png';
import mutBanner from '@/../public/images/mut-banner.png';
import spaBanner from '@/../public/images/spa-banner.png';
import banner from '@/../public/images/winter-season.png';
import xIcon from '@/../public/images/x-black-bg.png';
import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';

export default function Ranked() {
    const twitterText = `Join the Adrena Trading Competition! 🚀📈🏆 @adrenaprotocol`;

    return (
        <>
            <div>

                <div className="flex flex-col gap-6 relative overflow-hidden bg-[#070E18] border-white/50">
                    <div className="relative flex flex-col justify-center items-center w-full h-[30em]">
                        <div>
                            <Image
                                src={banner}
                                alt="competition banner"
                                className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
                            />
                            <Confetti mode='fall' particleCount={50} colors={['#ffffff', '#5D6E7C']} />

                            <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                            <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                            <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                        </div>

                        <div className="z-10 text-center">
                            <p className="text-lg tracking-[0.3rem] font-boldy">New Season</p>
                            <h1 className="text-[3em] md:text-[4em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#59B9E5,45%,#fff,55%,#59B9E5)] bg-[length:250%_100%] tracking-[0.5rem]">
                                Blizzard of Beasts
                            </h1>
                        </div>

                        <div>
                            <ul className="flex flex-row gap-4 h-full mt-6">
                                <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                                <li className="flex flex-col items-center justify-center">
                                    <p className="text-center text-[3rem] font-archivo leading-[46px]">
                                        02
                                    </p>
                                    <p className="text-center text-[1rem] font-boldy">Days</p>
                                </li>
                                <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                                <li className="flex flex-col items-center justify-center">
                                    <p className="text-center text-[3rem] font-archivo leading-[46px]">
                                        06
                                    </p>
                                    <p className="text-center text-[1rem] font-boldy">Hours</p>
                                </li>
                                <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                                <li className="flex flex-col items-center justify-center">
                                    <p className="text-center text-[3rem] font-archivo leading-[46px]">
                                        23
                                    </p>
                                    <p className="text-center text-[1rem] font-boldy">Minutes</p>
                                </li>
                                <li className="h-full w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC] to–[#999999]/0 rounded-full" />
                            </ul>
                        </div>
                        <div className='w-[800px] h-[800px] bg-[#050F19] border border-white/50 rounded-full z-20 absolute -bottom-[750px]' style={{
                            boxShadow: '-20px 0px 200px 10px #5A8DC1'
                        }}>

                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-[100px] items-center mt-20 mb-10">
                    <div>
                        <h2 className="text-center text-3xl font-boldy mb-3">
                            Adrena Trading Competition
                        </h2>
                        <p className="text-center text-base max-w-[640px] mb-3">
                            Welcome to Adrena&apos;s trading Competition, anon! This six-week event
                            is the introduction to our upcoming recurring trading seasons.
                            Traders will vie for PnL-based ranks in one of four volume-based
                            divisions.Your total trading volume during the six-week event
                            determines your division qualification.
                        </p>
                        <p className="text-center text-xs opacity-50 max-w-[640px]">
                            Only positions open after the start date and closed before the end
                            date qualify. Each weekly periods ends on Monday 12am UTC, except
                            the last one ending at 12pm UTC.Volume is determined by
                            Open/Increase and Close positions. It&apos;s accounted for when the
                            position closes (close or liquidation).
                        </p>

                        <div>
                            <div className="flex gap-4 mt-4 flex-col sm:flex-row items-center justify-center">
                                <Button
                                    title="Join Discord"
                                    className="text-sm px-8 w-[15em]"
                                    href="https://discord.gg/adrena"
                                    isOpenLinkInNewTab
                                    rightIcon={discordIcon}
                                    rightIconClassName="w-3 h-3"
                                />
                                <Button
                                    title="Share on"
                                    className="text-sm px-8 w-[15em]"
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(`https://${window.location.hostname}/competition`)}`}
                                    isOpenLinkInNewTab
                                    rightIcon={xIcon}
                                    rightIconClassName="w-3 h-3"
                                />
                                <Button
                                    title="Trade Now"
                                    className="text-sm px-8 w-[15em]"
                                    href="/trade"
                                    rightIconClassName="w-3 h-3"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full">
                        <div className="relative z-20 mx-auto mb-10 w-full h-[1px] bg-gradient-to-r from-[#F7931A]/0 via-[#F7931A] to-[#F7931A]/0" />

                        <div className="relative w-full max-w-[1200px] mx-auto z-20 p-12 mt-10">
                            <h2 className="text-center text-[2rem] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%] mb-10">
                                PRE SEASON RECAP
                            </h2>

                            <ul className="grid gap-12 grid-cols-3 justify-between">
                                <li>
                                    <p className="text-lg font-boldy opacity-50 text-center">
                                        Traders
                                    </p>
                                    <p className="text-[2rem] font-archivo text-center">876</p>
                                </li>
                                <li>
                                    <p className="text-lg font-boldy opacity-50 text-center">
                                        Volume
                                    </p>
                                    <p className="text-[2rem] font-archivo text-center">876</p>
                                </li>
                                <li>
                                    <p className="text-lg font-boldy opacity-50 text-center">
                                        JTO Rewards
                                    </p>
                                    <p className="text-[2rem] font-archivo text-center">
                                        25,000 JTO
                                    </p>
                                </li>
                                <li>
                                    <p className="text-lg font-boldy opacity-50 text-center">
                                        PnL
                                    </p>
                                    <p className="text-[2rem] font-archivo text-center text-green">
                                        $95,674.23
                                    </p>
                                </li>
                                <li>
                                    <p className="text-lg font-boldy opacity-50 text-center">
                                        Total fees
                                    </p>
                                    <p className="text-[2rem] font-archivo text-center">
                                        $1,899,998
                                    </p>
                                </li>
                                <li>
                                    <p className="text-lg font-boldy opacity-50 text-center">
                                        ADX Rewards
                                    </p>
                                    <p className="text-[2rem] font-archivo text-center">
                                        2,270,000 ADX
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <Image
                                src={awekningBanner}
                                alt="competition banner"
                                className="absolute top-0 left-0 w-full h-full object-cover opacity-10"
                            />
                            <div className="absolute top-0 left-0 w-full h-[10em] bg-gradient-to-b from-secondary to-transparent z-10" />
                            <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                            <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                            <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                        </div>
                    </div>

                    <div className="flex flex-row gap-3 justify-between items-center w-full max-w-[1400px] mx-auto">
                        <Image
                            src={levBanner}
                            alt="competition banner"
                            className="max-w-[300px]"
                        />
                        <Image
                            src={aboBanner}
                            alt="competition banner"
                            className="max-w-[300px]"
                        />
                        <Image
                            src={mutBanner}
                            alt="competition banner"
                            className="max-w-[300px]"
                        />
                        <Image
                            src={spaBanner}
                            alt="competition banner"
                            className="max-w-[300px]"
                        />
                    </div>

                    <div className="flex flex-row justify-center gap-6 bg-[#050D14] w-full border-y">
                        <div className="relative">
                            <Image
                                src={leviathanCup}
                                alt="cup"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-[#050D14] z-10" />
                            <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-[#050D14] z-10" />
                        </div>

                        <div className="p-5 my-auto">
                            <h2 className="text-[2rem] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%] mb-10">
                                market-mercenary
                            </h2>

                            <div className="flex flex-row gap-[50px]">
                                <div>
                                    <p className="text-lg font-boldy opacity-50">Total Volume</p>
                                    <p className="text-[2rem] font-mono">$11,899,998</p>

                                    <div className="mt-3">
                                        <FormatNumber
                                            nb={0.01}
                                            format="percentage"
                                            isDecimalDimmed={false}
                                            className="text-lg"
                                        />
                                        <p className="opacity-50 text-base">
                                            Top Trader Percentile
                                        </p>
                                    </div>
                                </div>

                                <div className="block h-[120px] w-[1px] bg-gradient-to-b from-[#999999]/0 via-[#CCCCCC]/25 to–[#999999]/0 rounded-full my-auto" />

                                <div>
                                    <p className="text-lg font-boldy opacity-50">PnL</p>
                                    <p className="text-[2rem] font-mono text-green">$95,674.23</p>

                                    <div className="mt-3">
                                        <FormatNumber
                                            nb={0.01}
                                            format="percentage"
                                            isDecimalDimmed={false}
                                            className="text-lg"
                                        />
                                        <p className="opacity-50 text-base">
                                            Top Trader Percentile
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <ul className="my-5 border-y border-bcolor py-5 flex flex-row justify-between">
                                <li>
                                    <p className="text-base font-boldy opacity-50">Division</p>
                                    <p className="text-lg font-mono">Leviathan</p>
                                </li>
                                <li>
                                    <p className="text-base font-boldy opacity-50">Rank</p>
                                    <p className="text-lg font-mono">#3</p>
                                </li>
                                <li>
                                    <p className="text-base font-boldy opacity-50">Trades</p>
                                    <p className="text-lg font-mono">11</p>
                                </li>
                                <li>
                                    <p className="text-base font-boldy opacity-50">JTO rewards</p>
                                    <p className="text-lg font-mono">2,4k JTO</p>
                                </li>
                                <li>
                                    <p className="text-base font-boldy opacity-50">ADX rewards</p>
                                    <p className="text-lg font-mono">320k ADX</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
