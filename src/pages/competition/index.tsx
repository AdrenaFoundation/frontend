import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import banner from '@/../public/images/comp-banner.png';
import starsIcon from '@/../public/images/Icons/stars.svg';
import trophyIcon from '@/../public/images/Icons/trophy.svg';
import jitoLogo from '@/../public/images/jito-logo.svg';
import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import LeaderboardTable from '@/components/pages/competition/LeaderboardTable';

export default function Competition() {

    const [data, setData] = useState<
        {
            [key in
            | 'Abomination'
            | 'Chimera'
            | 'Morph'
            | 'Spawn'
            | 'No Division']: {
                rank: number;
                username: string;
                volume: number;
                pnl: number;
                rewards: number;
            }[];
        }
        | null
    >(null);

    useEffect(() => {
        // fetch data
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await fetch(
                'https://datapi.adrena.xyz/awakening?season=preseason&show_achievements=true&show_trader_divisions=true',
            );
            const { data } = await response.json();
            const { trader_divisions } = data;

            const formattedData = trader_divisions.reduce(
                (acc: any, { division, traders }: any) => {
                    acc[division] = traders.map((trader: any) => {
                        return {
                            rank: trader.rank_in_division,
                            username: trader.address,
                            volume: trader.total_volume,
                            pnl: trader.total_pnl,
                            rewards: trader.adx_reward,
                        };
                    });
                    return acc;
                },
                {} as {
                    [key in
                    | 'Abomination'
                    | 'Chimera'
                    | 'Morph'
                    | 'Spawn'
                    | 'No Division']: {
                        rank: number;
                        username: string;
                        volume: number;
                        pnl: number;
                        rewards: number;
                    }[];
                },
            );
            console.log(formattedData);
            setData(formattedData);
        } catch (error) {
            console.error(error);
        }
    };

    if (!data) {
        return <div className='m-auto'>
            <Loader />
        </div>
    }

    const division = ['Abomination', 'Chimera', 'Morph', 'Spawn', 'No Division'] as const

    return (
        <div className="flex flex-col gap-[50px] pb-[50px]">
            <div className="relative flex flex-col justify-between items-center w-full h-[400px] p-[50px] border-b">
                <div>
                    <Image
                        src={banner}
                        alt="competition banner"
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-b from-transparent to-secondary z-10" />
                    <div className="absolute top-0 right-0 w-[100px] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                    <div className="absolute top-0 left-0 w-[100px] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                </div>
                <div className="z-10 text-center">
                    <p className="text-lg tracking-[0.2rem]">SEASON 1</p>
                    <h1 className="text-[36px] md:text-[60px] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%]">
                        PRE-SEASON: AWAKENING
                    </h1>
                </div>
                <div className="flex flex-row items-center gap-3 z-10">
                    <p className="tracking-[0.2rem]">Sponsored by</p>
                    <Image src={jitoLogo} alt="jito logo" className='w-[50px] md:w-[100px]' />
                </div>
            </div>
            <div className='px-[20px] sm:px-[50px]'>
                <h2 className="font-boldy">Adrena Trading Competition</h2>
                <p className="text-txtfade mt-1 mb-3">From Nov 11 - Nov 23, 2024</p>
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <p className="max-w-[640px] text-txtfade">
                        Adrena&apos;s first trading competition. A 6 week long competition that
                        is an intro to the upcoming recurring trading seasons. Starting
                        November 11th and ending December 23rd. There will be 4 separate
                        divisions. You&apos;ll be qualifying for a given division based on your
                        total trading volume during the 6 week event.
                    </p>
                    <div className="flex flex-row gap-2 items-center justify-center bg-secondary border rounded-lg p-4 px-12">
                        <Image
                            src={window.adrena.client.adxToken.image}
                            alt="adx logo"
                            width={18}
                            height={18}
                        />
                        <p className="text-xl font-boldy">
                            178,000 ADX <span className="">Rewards</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-3 px-[20px] sm:px-[50px]">
                <Button title="Leaderboard" className='w-full md:w-auto' size='lg' />
                <Button title="Weekly Rewards" className='w-full md:w-auto' variant="text" size='lg' />
            </div>

            <div className="grid lg:grid-cols-2 gap-[50px] px-[20px] sm:px-[50px]">
                {division.map((division) => {
                    return <LeaderboardTable division={division} data={data[division]} key={division} />;
                })}
            </div>
        </div>
    );
}
