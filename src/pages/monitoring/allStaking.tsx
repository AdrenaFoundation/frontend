import Tippy from '@tippyjs/react';
import { useEffect } from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import AllStakingChartADX from '@/components/pages/global/AllStakingChart/AllStakingChartADX';
import UnlockStakingChart from '@/components/pages/global/AllStakingChart/UnlockStakingChart';
import { AprLmChart } from '@/components/pages/global/Apr/AprLmChart';
import { AprLpChart } from '@/components/pages/global/Apr/AprLpChart';
import StakingChart from '@/components/pages/global/Staking/StakingChart';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import { useAllStakingStats } from '@/hooks/useAllStakingStats';

export default function AllStaking({ isSmallScreen, view }: { isSmallScreen: boolean, view: string }) {
    const { allStakingStats } = useAllStakingStats();
    const totalSupplyADX = useADXTotalSupply();

    useEffect(() => {
        if (view !== 'allStaking') return;
    }, [view]);

    return (
        <div className="flex flex-col gap-2 p-2 items-center justify-center">
            <StyledContainer className="p-4">
                <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em] ">
                    <AprLpChart isSmallScreen={isSmallScreen} />
                    <AprLmChart isSmallScreen={isSmallScreen} />
                </div>
            </StyledContainer>

            <StyledContainer className="p-4" bodyClassName='items-center justify-center flex relative'>
                <div className='flex flex-col items-center justify-center gap-1'>
                    <h2 className='flex'>STAKED ADX</h2>

                    {allStakingStats && totalSupplyADX ?
                        <Tippy
                            content={
                                <div className="text-sm flex">
                                    Total staked ADX / Total supply ADX
                                </div>
                            }
                            placement="auto"
                        >
                            <div className='flex items-center gap-2'>
                                <FormatNumber
                                    nb={allStakingStats.byDurationByAmount.ADX.totalLocked + allStakingStats.byDurationByAmount.ADX.liquid}
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    className='text-txtfade text-base'
                                    isDecimalDimmed={false}
                                />

                                <span className='text-txtfade text-base font-mono'>{"/"}</span>

                                <FormatNumber
                                    nb={totalSupplyADX}
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    className='text-txtfade text-base'
                                    isDecimalDimmed={false}
                                />

                                <div className='flex'>
                                    <span className='text-txtfade text-base font-mono'>{"("}</span>
                                    <FormatNumber
                                        nb={(allStakingStats.byDurationByAmount.ADX.totalLocked + allStakingStats.byDurationByAmount.ADX.liquid) * 100 / totalSupplyADX}
                                        className='text-txtfade text-base'
                                        isDecimalDimmed={false}
                                        format='percentage'
                                    />
                                    <span className='text-txtfade text-base font-mono'>{")"}</span>
                                </div>
                            </div>
                        </Tippy> : null}
                </div>

                <div className='flex w-full min-h-[15em] h-[15em] grow'>
                    <AllStakingChartADX allStakingStats={allStakingStats} />
                </div>

                <div className='flex flex-col items-center justify-center gap-1 w-full mt-4'>
                    <h2 className='flex'>ADX STAKING REMAINING TIME</h2>

                    <div className='w-full flex h-[20em]'>
                        <UnlockStakingChart allStakingStats={allStakingStats} stakingType="ADX" />
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center gap-1 w-full mt-4'>
                    <h2 className='flex'>LOCKED STAKE REPARTITION</h2>

                    <div className='w-full flex h-[20em]'>
                        <StakingChart />
                    </div>
                </div>
            </StyledContainer >
        </div >
    );
}
