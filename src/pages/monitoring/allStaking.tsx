import React from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { useSelector } from '@/store/store';

import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import AllStakingChartADX from '@/components/pages/global/AllStakingChart/AllStakingChartADX';
import AllStakingChartALP from '@/components/pages/global/AllStakingChart/AllStakingChartALP';
import FormatNumber from '@/components/Number/FormatNumber';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';

export default function AllStaking() {
    const wallet = useSelector((state) => state.walletState.wallet);
    const { allStakingStats } = useAllStakingStats();
    const totalSupplyADX = useADXTotalSupply();
    const totalSupplyALP = useALPTotalSupply();

    return (
        <div className="flex flex-col gap-2 p-2 items-center justify-center">
            <StyledContainer className="p-4" bodyClassName='items-center justify-center flex'>
                <div className='flex flex-col items-center justify-center gap-1'>
                    <h2 className='flex'>STAKED ADX</h2>

                    {allStakingStats && totalSupplyADX ? <div className='flex items-center gap-2'>
                        <FormatNumber
                            nb={allStakingStats.ADX.totalLocked + allStakingStats.ADX.liquid}
                            isAbbreviate={true}
                            isAbbreviateIcon={false}
                            className='text-txtfade text-base'
                            isDecimalDimmed={false}
                        />

                        <span className='text-txtfade text-base font-mono'>{"STAKED /"}</span>

                        <FormatNumber
                            nb={totalSupplyADX}
                            isAbbreviate={true}
                            isAbbreviateIcon={false}
                            className='text-txtfade text-base'
                            isDecimalDimmed={false}
                        />

                        <span className='text-txtfade text-base font-mono'>TOTAL SUPPLY</span>
                    </div> : null}
                </div>

                <div className='flex w-full min-h-[15em] h-[15em] grow'>
                    <AllStakingChartADX allStakingStats={allStakingStats} />
                </div>

                <div className='flex flex-col items-center justify-center gap-1'>
                    <h2 className='flex'>STAKED ALP</h2>

                    {allStakingStats && totalSupplyALP ? <div className='flex items-center gap-2'>
                        <FormatNumber
                            nb={allStakingStats.ALP.totalLocked}
                            isAbbreviate={true}
                            isAbbreviateIcon={false}
                            className='text-txtfade text-base'
                            isDecimalDimmed={false}
                        />

                        <span className='text-txtfade text-base font-mono'>{"STAKED /"}</span>

                        <FormatNumber
                            nb={totalSupplyALP}
                            isAbbreviate={true}
                            isAbbreviateIcon={false}
                            className='text-txtfade text-base'
                            isDecimalDimmed={false}
                        />

                        <span className='text-txtfade text-base font-mono'>TOTAL SUPPLY</span>
                    </div> : null}
                </div>
                <div className='flex w-full min-h-[15em] h-[15em] grow'>
                    <AllStakingChartALP allStakingStats={allStakingStats} />
                </div>
            </StyledContainer >
        </div >
    );
}
