import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { twMerge } from 'tailwind-merge';

export const config = {
    runtime: 'edge',
};

export default async function handler(request: NextRequest) {
    const fontData = await fetch(
        new URL('../../assets/ArchivoBlack-Regular.ttf', import.meta.url),
    ).then((res) => res.arrayBuffer());

    const { searchParams } = request.nextUrl;

    const pnlPercentage = Number(searchParams.get('pnl') || '99.33');
    const symbol =
        searchParams.get('symbol') ||
        ('JITOSOL' as 'JITOSOL' | 'USDC' | 'BONK' | 'WBTC');
    const side = searchParams.get('side') || 'long';
    const sizeUsd = Number(searchParams.get('size'));
    const collateralUsd = Number(searchParams.get('collateral'));
    const price = Number(searchParams.get('price'));
    const mark = Number(searchParams.get('mark'));
    const openedOn = new Date(
        Number(searchParams.get('opened')),
    ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        minute: 'numeric',
        hour: 'numeric',
    });
    const opt = Number(searchParams.get('opt') || '2');

    const OPTIONS = [
        {
            id: 0,
            img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/monster_1.png',
            gradient: ['#625320', '#625320'],
        },
        {
            id: 1,
            img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/monster_2.png',
            gradient: ['#84194C', '#D40E27'],
        },
        {
            id: 2,
            img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/monster_3.png',
            gradient: ['#376624', '#8FCA77'],
        },
        {
            id: 3,
            img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/monster_4.png',
            gradient: ['#1F6773', '#6F2474'],
        },
    ];

    const TOKEN_SYMBOL: { [key: string]: string } = {
        JITOSOL:
            'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/jitosol.png',
        USDC: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/usdc.svg',
        BONK: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/bonk.png',
        WBTC: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wbtc.png',
        SOL: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/sol.png',
        BTC: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/btc.svg',
    };

    const nFormat = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: symbol === 'BONK' ? 8 : 2,
    });

    return new ImageResponse(
        (
            <div tw="relative flex flex-col items-start p-[50px] w-full h-full bg-[#061018] overflow-hidden">
                <img
                    src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/logo.svg"
                    alt="Adrena Logo"
                    tw="w-[150px] mt-[10px]"
                />

                <div tw="flex flex-row items-center relative mt-[20px]">
                    <div tw="flex flex-row items-center">
                        <img
                            src={TOKEN_SYMBOL[symbol]}
                            alt="Adrena Logo"
                            tw="w-[50px] h-[50px]"
                        />

                        <h2 tw="text-[60px] font-bold text-white archivo-black m-0 ml-2">
                            {symbol}
                        </h2>
                    </div>

                    <p
                        tw={twMerge(
                            'flex text-[24px] px-4 py-1 rounded-lg archivo-black capitalize ml-3',
                            side === 'long'
                                ? 'bg-[#0F2E2B] text-[#49d7ad]'
                                : 'bg-[#c9243a] text-[#c9243a]',
                        )}
                    >
                        {side} {Number(Number(sizeUsd) / Number(collateralUsd)).toFixed(2)}x
                    </p>
                </div>
                <p
                    tw={twMerge(
                        'text-[180px] archivo-black font-bold m-0 mt-[50px]',
                        pnlPercentage < 0 ? 'text-[#c9243a]' : 'text-[#07956b]',
                    )}
                >
                    {pnlPercentage.toFixed(2)}%
                </p>
                <ul tw="flex flex-row mt-[10px] mt-[120px]">
                    <li tw="flex flex-col">
                        <span tw="opacity-50 text-[24px] font-semibold text-white">
                            Entry Price
                        </span>
                        <span
                            tw={twMerge(
                                'archivo-black text-[36px] text-white mt-2',
                                symbol === 'BONK' && 'text-[30px]',
                            )}
                        >
                            ${nFormat.format(price)}
                        </span>
                    </li>
                    <li tw="flex flex-col ml-6">
                        <span tw="opacity-50 text-[24px] font-semibold text-white">
                            Mark Price
                        </span>
                        <span
                            tw={twMerge(
                                'archivo-black text-[36px] text-white mt-2',
                                symbol === 'BONK' && 'text-[30px]',
                            )}
                        >
                            ${nFormat.format(mark)}
                        </span>
                    </li>
                    <li tw="flex flex-col ml-6">
                        <span tw="opacity-50 text-[24px] font-semibold text-white">
                            Opened on
                        </span>
                        <span
                            tw={twMerge(
                                'archivo-black text-[36px] text-white mt-2',
                                symbol === 'BONK' && 'text-[30px]',
                            )}
                        >
                            {openedOn}
                        </span>
                    </li>
                </ul>

                <div
                    style={{
                        opacity: 0.3,

                        backgroundImage: `radial-gradient(${OPTIONS[opt].gradient[0]}, #061018)`,
                        filter: 'blur(30px)',
                    }}
                    tw="absolute bottom-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full"
                />
                <div
                    style={{
                        opacity: 0.3,
                        backgroundImage: `radial-gradient(${OPTIONS[opt].gradient[1]}, #061018)`,
                        filter: 'blur(30px)',
                    }}
                    tw="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full"
                />
                <div tw="absolute flex bottom-0 right-0">
                    <img src={OPTIONS[opt].img} alt="Monster" tw="w-[400px]" />
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'archivo-black',
                    data: fontData,
                    style: 'normal',
                },
            ],
        },
    );
}
