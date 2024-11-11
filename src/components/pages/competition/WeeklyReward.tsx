import Image from 'next/image';
import React from 'react';

import firstImage from '@/../public/images/first-place.svg';
import jitoImage from '@/../public/images/jito-logo.svg';
import jtoImage from '@/../public/images/jito-logo-2.png';
import ticketImage from '@/../public/images/tickets.png';
import interrogationImage from '@/../public/images/interrogation.png';
import FormatNumber from '@/components/Number/FormatNumber';
import { ImageRef } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

export type TicketData = {
    totalTickets: number | null;
    connectedWalletTickets: number | null;
    trader: string | null;
    type: 'ticket';
    reward: number | null;
    rewardToken: 'ADX' | 'JITO';
    rewardImage: ImageRef;
};

export type RewardData = {
    trader: string | null;
    result: number | null;
    type: 'reward';
    reward: number | null;
    rewardToken: 'ADX' | 'JITO';
    rewardImage: ImageRef;
};

export default function WeeklyReward({
    rewards,
}: {
    rewards: [
        { title: 'Biggest Liquidation' } & RewardData,
        { title: 'Fees Prize' } & TicketData,
        { title: 'Top Degen' } & RewardData,
        { title: 'SOL Trading Volume Prize' } & TicketData,
    ];
}) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {rewards.map((award) => {
                if (award.type === 'ticket') {
                    return <div
                        className="flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl grow relative"
                        key={award.title}
                    >
                        <div
                            className='absolute w-full h-full mb-3 z-10'
                            style={{
                                backgroundImage: 'url(images/interrogation.png)',
                                backgroundRepeat: 'repeat',
                                backgroundSize: '20px 20px',
                                opacity: 0.05,
                            }}></div>

                        <div className='flex flex-col gap-2 items-center justify-between p-3 z-20'>
                            <div className='flex flex-col items-center gap-2'>
                                {award.title === 'SOL Trading Volume Prize' ? <Image
                                    src={jitoImage}
                                    alt="first place logo"
                                    width={55}
                                    height={55}
                                    className='h-10'
                                /> : <Image
                                    src={firstImage}
                                    alt="first place logo"
                                    className='h-10'
                                    width={40}
                                    height={40}
                                />}

                                <p className="text-base sm:text-lg text-center font-boldy mb-0.5">
                                    {award.title}
                                </p>
                            </div>

                            {
                                award.trader !== null ?
                                    // There is no winner yet
                                    <div className="flex items-center justify-center h-[3em]">
                                        <div className="mb-0 gap-1 items-center justify-center flex">
                                            <FormatNumber
                                                nb={award.connectedWalletTickets}
                                                className="text-lg text-center font-boldy"
                                                isAbbreviate={true}
                                                isAbbreviateIcon={false}
                                            />

                                            <span>/</span>

                                            <FormatNumber
                                                nb={award.totalTickets}
                                                className="text-lg text-center font-boldy"
                                                isAbbreviate={true}
                                                isAbbreviateIcon={false}
                                            />
                                        </div>

                                        <Image
                                            src={ticketImage}
                                            alt="ticket image"
                                            className="w-10 h-8" />
                                    </div> :
                                    // There is a winner
                                    <div className='flex items-center justify-center h-[3em]'>
                                        <p className="opacity-75">
                                            {award.trader
                                                ? getAbbrevWalletAddress(award.trader)
                                                : 'Unknown'}
                                        </p>
                                    </div>
                            }

                            <div className="flex flex-row gap-2 items-center justify-center bg-[#1B212A] border rounded-lg p-2 px-3 sm:px-8">
                                {award.rewardToken === 'ADX' ? <Image
                                    src={window.adrena.client.adxToken.image}
                                    alt="adx logo"
                                    className="w-3 h-3 sm:w-5 sm:h-5"
                                /> : <Image
                                    src={jtoImage}
                                    alt="JTO logo"
                                    className="w-5 h-5 sm:w-7 sm:h-7" width={80} height={80} />}

                                <FormatNumber
                                    nb={award.reward}
                                    className="text-sm sm:text-2xl font-boldy"
                                    suffixClassName="text-sm sm:text-2xl font-boldy"
                                    suffix={` ${award.rewardToken}`}
                                />
                            </div>

                            <p className="opacity-50">Prize</p>
                        </div>
                    </div >;
                }

                return <div
                    className="flex flex-col gap-2 items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl p-3 flex-1"
                    key={award.title}
                >
                    <div className='flex flex-col items-center gap-2'>
                        <Image
                            src={firstImage}
                            alt="first place logo"
                            width={40}
                            height={40}
                            className='h-10'
                        />

                        <p className="text-base sm:text-lg text-center font-boldy mb-0.5">
                            {award.title}
                        </p>
                    </div>

                    <div className="flex flex-col items-center">

                        {award.result ? (
                            <FormatNumber
                                nb={award.result}
                                format={'currency'}
                                className={
                                    award.result >= 0
                                        ? 'text-green font-bold'
                                        : 'text-red font-bold'
                                }
                                isDecimalDimmed={false}
                            />
                        ) : (
                            '-'
                        )}
                    </div>
                    <p className="opacity-75">
                        {award.trader
                            ? getAbbrevWalletAddress(award.trader)
                            : 'Unknown'}
                    </p>

                    <div className="flex flex-row gap-2 items-center justify-center bg-[#1B212A] border rounded-lg p-2 px-3 sm:px-8">
                        {award.rewardToken === 'ADX' ? <Image
                            src={window.adrena.client.adxToken.image}
                            alt="adx logo"
                            className="w-3 h-3 sm:w-5 sm:h-5"
                        /> : <Image
                            src={jtoImage}
                            alt="JTO logo"
                            className="w-3 h-3 sm:w-5 sm:h-5" />}

                        <FormatNumber
                            nb={award.reward}
                            className="text-sm sm:text-2xl font-boldy"
                            suffixClassName="text-sm sm:text-2xl font-boldy"
                            suffix={` ${award.rewardToken}`}
                        />
                    </div>

                    <p className="opacity-50">Prize</p>
                </div>;
            })}
        </div >
    );
}
