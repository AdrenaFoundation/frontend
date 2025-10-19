import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/common/Button/Button';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import AllVestingChart from '@/components/pages/global/AllVestingChart/AllVestingChart';
import { EmissionsChart } from '@/components/pages/global/Emissions/EmissionsChart';
import TokenomicsPieChart from '@/components/pages/monitoring/Data/Tokenomics';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import useADXCirculatingSupply from '@/hooks/useADXCirculatingSupply';
import useADXHolderCount from '@/hooks/useADXHolderCount';
import useADXJupiterInfo from '@/hooks/useADXJupiterInfo';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useStakingAccount from '@/hooks/useStakingAccount';
import useVests from '@/hooks/useVests';
import { useSelector } from '@/store/store';
import { nativeToUi } from '@/utils';

import coingeckoImg from '../../../public/images/coingecko.png';
import dexscreenerImg from '../../../public/images/dexscreener.png';
import jupImg from '../../../public/images/jup-logo.png';
import raydiumImg from '../../../public/images/raydium.png';
import rugcheckImg from '../../../public/images/rugcheck.jpg';

export default function Tokenomics({ isSmallScreen, view }: { isSmallScreen: boolean, view: string }) {
    const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

    const totalSupplyADX = useADXTotalSupply();

    const adxJupiterInfo = useADXJupiterInfo();

    const {
        stakingAccount: adxStakingAccount,
    } = useStakingAccount(window.adrena.client.lmTokenMint);

    const circulatingSupplyADX = useADXCirculatingSupply({
        totalSupplyADX,
    });

    const vests = useVests();

    const [{
        vestingClaimed,
        vestingClaimable,
        vestingVested,
    }, setVestingData] = useState({
        vestingClaimed: 0,
        vestingClaimable: 0,
        vestingVested: 0,
    });

    const adxHolderCount = useADXHolderCount();

    useEffect(() => {
        (async () => {

        })();
    }, [totalSupplyADX, adxStakingAccount]);

    const marketCap = useMemo(() => {
        if (!tokenPriceADX || !circulatingSupplyADX) return 0;

        return tokenPriceADX * circulatingSupplyADX;
    }, [tokenPriceADX, circulatingSupplyADX]);

    const fullyDilutedValue = useMemo(() => {
        if (!tokenPriceADX || !totalSupplyADX) return 0;

        return tokenPriceADX * totalSupplyADX;
    }, [totalSupplyADX, tokenPriceADX]);

    useEffect(() => {
        const calculateVestingData = () => {
            if (!vests) {
                return {
                    vestingClaimed: 0,
                    vestingClaimable: 0,
                    vestingVested: 0,
                };
            }

            return vests.reduce((acc, vest) => {
                const vestedAmount = nativeToUi(vest.amount, window.adrena.client.adxToken.decimals);
                const claimedAmount = nativeToUi(vest.claimedAmount, window.adrena.client.adxToken.decimals);

                acc.vestingClaimed += claimedAmount;

                if (vest.unlockStartTimestamp.toNumber() <= Date.now() / 1000) {
                    const total =
                        (vestedAmount / (vest.unlockEndTimestamp.toNumber() - vest.unlockStartTimestamp.toNumber())) *
                        ((Date.now() - vest.unlockStartTimestamp.toNumber() * 1000) / 1000);

                    acc.vestingClaimable += total - claimedAmount;
                }

                acc.vestingVested += vestedAmount;

                return acc;
            }, {
                vestingClaimed: 0,
                vestingClaimable: 0,
                vestingVested: 0,
            });
        };

        const interval = setInterval(() => {
            setVestingData(calculateVestingData());
        }, 300);

        return () => clearInterval(interval);
    }, [vests]);

    useEffect(() => {
        if (view !== 'tokenomics') return;
    }, [view]);

    return (
        <div className="flex flex-col gap-2 p-2 items-center justify-center">
            <StyledContainer className="p-0">
                <div className="flex flex-wrap justify-between">
                    <NumberDisplay
                        title="MARKET CAP"
                        nb={marketCap}
                        format="currency"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="Fully Diluted Value"
                        nb={fullyDilutedValue}
                        format="currency"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="CIRCULATING SUPPLY"
                        nb={circulatingSupplyADX}
                        format="number"
                        suffix='ADX'
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="sm:text-[0.85em]"
                        tippyInfo='All the distributed ADX tokens'
                    />

                    <NumberDisplay
                        title="TOTAL SUPPLY"
                        nb={totalSupplyADX}
                        format="number"
                        suffix='ADX'
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="HOLDER COUNT"
                        nb={adxHolderCount}
                        format="number"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="LIQUIDITY"
                        nb={adxJupiterInfo?.liquidity ?? null}
                        format="currency"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="sm:text-[0.85em]"
                        tippyInfo='Total liquidity available through Jupiter aggregator'
                    />
                </div>
            </StyledContainer>

            <div className="grid lg:grid-cols-2 gap-2 w-full">
                <StyledContainer className="p-4" bodyClassName='items-center justify-center'>
                    <div className='flex flex-col items-center justify-center h-full w-full'>
                        <h2 className='flex'>TOKEN ALLOCATION</h2>

                        <div className="h-[17em] w-full">
                            <TokenomicsPieChart />
                        </div>
                    </div>
                </StyledContainer>

                <StyledContainer className="p-4" bodyClassName='items-center justify-center h-full min-h-[14em]'>
                    <div className='flex flex-col items-center justify-center w-full h-full pb-6'>
                        <h2 className='flex mb-4'>CHECK IT OUT</h2>

                        <div className='flex w-full items-center justify-evenly grow relative'>
                            <div className='flex flex-col items-center justify-center gap-y-2 opacity-80 hover:opacity-100 cursor-pointer'>
                                <Image
                                    src={coingeckoImg}
                                    height={50}
                                    width={50}
                                    alt="coingecko"
                                    onClick={() => {
                                        window.open('https://www.coingecko.com/en/coins/adrena');
                                    }}
                                />

                                <div className='text-sm font-semibold'>Coingecko</div>
                            </div>

                            <div className='flex flex-col items-center justify-center gap-y-2 opacity-80 hover:opacity-100 cursor-pointer'>
                                <Image
                                    src={dexscreenerImg}
                                    height={54}
                                    width={54}
                                    alt="dex screener icon"
                                    onClick={() => {
                                        window.open('https://dexscreener.com/solana/2qnwswsp1deymnbuzgjfrz55jnubiwgrnpk6fmiz1mef');
                                    }}
                                />

                                <div className='text-sm font-semibold'>DEX screener</div>
                            </div>

                            <div className='flex flex-col items-center justify-center gap-y-2 opacity-80 hover:opacity-100 cursor-pointer'>
                                <Image
                                    src={raydiumImg}
                                    height={55}
                                    width={55}
                                    alt="raydium"
                                    onClick={() => {
                                        window.open('https://raydium.io/liquidity-pools/?tab=standard&token=AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw');
                                    }}
                                />

                                <div className='text-sm font-semibold'>Raydium</div>
                            </div>

                            <div className='flex flex-col items-center justify-center gap-y-1 opacity-80 hover:opacity-100 cursor-pointer'>
                                <Image
                                    src={jupImg}
                                    height={60}
                                    width={60}
                                    alt="jupiter"
                                    onClick={() => {
                                        window.open('https://jup.ag/swap/USDC-ADX');
                                    }}
                                />

                                <div className='text-sm font-semibold'>Jupiter</div>
                            </div>

                            <div className='flex flex-col items-center justify-center gap-y-1 opacity-80 hover:opacity-100 cursor-pointer'>
                                <Image
                                    src={rugcheckImg}
                                    height={60}
                                    width={60}
                                    alt="rugcheck"
                                    className='border-2'
                                    onClick={() => {
                                        window.open('https://rugcheck.xyz/tokens/AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw');
                                    }}
                                />

                                <div className='text-sm font-semibold'>Rugcheck</div>
                            </div>
                        </div>

                        <OnchainAccountInfo
                            className="absolute top-4 right-4"
                            address={window.adrena.client.adxToken.mint}
                            shorten={true}
                        />

                        <div className='flex gap-2 w-full items-center justify-evenly'>
                            <Button
                                className="mt-auto w-full max-w-[20em]"
                                title="See docs"
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    window.open('https://docs.adrena.trade/tokenomics/adx');
                                }}
                            />

                            <Button
                                className="mt-auto w-full max-w-[20em]"
                                title="Buy ADX"
                                size="lg"
                                onClick={() => {
                                    window.open('https://jup.ag/swap/USDC-ADX');
                                }}
                            />
                        </div>
                    </div>
                </StyledContainer>
            </div>

            <StyledContainer className="p-4" bodyClassName='items-center justify-center flex relative'>
                <div className='flex flex-col items-center justify-center gap-1 w-full'>
                    <h2 className='flex'>daily emission rate</h2>

                    <div className="h-[20em] w-full mt-4">
                        <EmissionsChart isSmallScreen={isSmallScreen} />
                    </div>
                </div>
            </StyledContainer>

            <StyledContainer className="p-4" bodyClassName='items-center justify-center flex relative'>
                <div className='flex flex-col items-center justify-center gap-1 w-full'>
                    <h2 className='flex'>VESTS</h2>
                    <div className="flex flex-wrap justify-between">
                        <NumberDisplay
                            title="CLAIMED"
                            nb={vestingClaimed}
                            format="number"
                            precision={0}
                            suffix='ADX'
                            className="border-0 min-w-[12em]"
                            bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                            headerClassName="pb-2"
                            titleClassName="text-[0.7em] sm:text-[0.7em]"
                        />

                        <NumberDisplay
                            title="CLAIMABLE"
                            nb={vestingClaimable}
                            format="number"
                            precision={0}
                            suffix='ADX'
                            className="border-0 min-w-[12em]"
                            bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                            headerClassName="pb-2"
                            titleClassName="text-[0.7em] sm:text-[0.7em]"
                        />

                        <NumberDisplay
                            title="TOTAL VESTED"
                            nb={vestingVested}
                            format="number"
                            precision={0}
                            suffix='ADX'
                            className="border-0 min-w-[12em]"
                            bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                            headerClassName="pb-2"
                            titleClassName="text-[0.7em] sm:text-[0.7em]"
                        />
                    </div>

                    <div className="h-[20em] w-full mt-8">
                        <AllVestingChart vests={vests} />
                    </div>

                    <div>
                        {/* TOP TOKEN HOLDERS */}
                    </div>
                </div>
            </StyledContainer >
        </div >
    );
}
