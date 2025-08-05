import React from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import AumChart from '@/components/pages/global/Aum/AumChart';
import CompositionChart from '@/components/pages/global/Composition/CompositionChart';
import DrawdownChart from '@/components/pages/global/Drawdown/DrawdownChart';
import OpenInterestLongShortChart from '@/components/pages/global/OpenInterestLongShort/OpenInterestLongShortChart';
import UtilizationChart from '@/components/pages/global/UtilizationChart/UtilizationChart';
import VolumeAndUtilizationChart from '@/components/pages/global/Volume/VolumeAndUtilizationChart';
import { useSelector } from '@/store/store';

export default function AdvancedPoolMonitoring({ isSmallScreen }: { isSmallScreen: boolean }) {
    const useSqrtScaleForVolumeAndFeeChart = useSelector((state) => state.settings.useSqrtScaleForVolumeAndFeeChart);

    return (
        <div className="flex flex-col gap-2">
            <StyledContainer className="flex gap-6">
                <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
                    <OpenInterestLongShortChart />
                    <DrawdownChart />
                </div>

                <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
                    <VolumeAndUtilizationChart isSmallScreen={isSmallScreen} yAxisBarScale={useSqrtScaleForVolumeAndFeeChart ? 'sqrt' : 'linear'} />
                    <UtilizationChart />
                </div>

                <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
                    <AumChart disableLpPrice={true} />
                    <CompositionChart />
                </div>
            </StyledContainer >
        </div >
    );
}
