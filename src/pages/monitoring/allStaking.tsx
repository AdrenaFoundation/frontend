import React from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { useSelector } from '@/store/store';

import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import AllStakingChartADX from '@/components/pages/global/AllStakingChart/AllStakingChartADX';
import AllStakingChartALP from '@/components/pages/global/AllStakingChart/AllStakingChartALP';

export default function AllStaking() {
    const wallet = useSelector((state) => state.walletState.wallet);
    const { allStakingStats } = useAllStakingStats();

    return (
        <div className="flex flex-col gap-2 p-2">
            <StyledContainer className="p-4" bodyClassName='items-center justify-center flex'>
                <h2>ADX STAKING</h2>

                <div className='flex w-full min-h-[15em] h-[15em] grow'>
                    <AllStakingChartADX allStakingStats={allStakingStats} />
                </div>

                <h2>ALP STAKING</h2>

                <div className='flex w-full min-h-[15em] h-[15em] grow'>
                    <AllStakingChartALP allStakingStats={allStakingStats} />
                </div>
            </StyledContainer >
        </div >
    );
}
