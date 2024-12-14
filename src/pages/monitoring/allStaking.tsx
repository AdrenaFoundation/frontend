import Tippy from '@tippyjs/react';
import React from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import AllStakingChartADX from '@/components/pages/global/AllStakingChart/AllStakingChartADX';
import AllStakingChartALP from '@/components/pages/global/AllStakingChart/AllStakingChartALP';
import UnlockStakingChart from '@/components/pages/global/AllStakingChart/UnlockStakingChart';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';

export default function AllStaking() {
    const { allStakingStats } = useAllStakingStats();
    const totalSupplyADX = useADXTotalSupply();
    const totalSupplyALP = useALPTotalSupply();

    return (
        <div className="flex flex-col gap-2 p-2 items-center justify-center">
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

                <div className='flex flex-col items-center justify-center gap-1'>
                    <h2 className='flex'>STAKED ALP</h2>

                    {allStakingStats && totalSupplyALP ?
                        <Tippy
                            content={
                                <div className="text-sm flex">
                                    Total staked ALP / Total supply ALP
                                </div>
                            }
                            placement="auto"
                        >
                            <div className='flex items-center gap-2'>
                                <FormatNumber
                                    nb={allStakingStats.byDurationByAmount.ALP.totalLocked}
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    className='text-txtfade text-base'
                                    isDecimalDimmed={false}
                                />

                                <span className='text-txtfade text-base font-mono'>{"/"}</span>

                                <FormatNumber
                                    nb={totalSupplyALP}
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    className='text-txtfade text-base'
                                    isDecimalDimmed={false}
                                />

                                <div className='flex'>
                                    <span className='text-txtfade text-base font-mono'>{"("}</span>
                                    <FormatNumber
                                        nb={allStakingStats.byDurationByAmount.ALP.totalLocked * 100 / totalSupplyALP}
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
                    <AllStakingChartALP allStakingStats={allStakingStats} />
                </div>

                <div className='flex flex-col items-center justify-center gap-1 w-full mt-4'>
                    <h2 className='flex'>ADX STAKING REMAINING TIME</h2>

                    <div className='w-full flex h-[20em]'>
                        <UnlockStakingChart allStakingStats={allStakingStats} stakingType="ADX" />
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center gap-1 w-full mt-4'>
                    <h2 className='flex'>ALP STAKING REMAINING TIME</h2>

                    <div className='w-full flex h-[20em]'>
                        <UnlockStakingChart allStakingStats={allStakingStats} stakingType="ALP" />
                    </div>
                </div>
            </StyledContainer >
        </div >
    );
}
