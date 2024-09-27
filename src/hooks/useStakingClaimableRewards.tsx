import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { useSelector } from '@/store/store';

interface RewardsData {
    pendingUsdcRewards: number;
    pendingAdxRewards: number;
    pendingGenesisAdxRewards: number;
}

export const useStakingClaimableRewards = (isALP: boolean) => {
    const [rewards, setRewards] = useState<RewardsData>({ pendingUsdcRewards: 0, pendingAdxRewards: 0, pendingGenesisAdxRewards: 0 });
    const connection = window.adrena.client.connection;
    const wallet = useSelector((s) => s.walletState.wallet);
    const adrenaClient = window.adrena?.client;

    useEffect(() => {
        const walletAddress = wallet ? new PublicKey(wallet.walletAddress) : null;
        if (!walletAddress || !adrenaClient || !connection) {
            return;
        }

        const fetchRewards = async () => {
            try {
                const stakedTokenMint = isALP ? adrenaClient.lpTokenMint : adrenaClient.lmTokenMint;
                const simulatedRewards = await adrenaClient.simulateClaimStakes(walletAddress, stakedTokenMint);
                setRewards(simulatedRewards);
            } catch (error) {
                setRewards({ pendingUsdcRewards: 0, pendingAdxRewards: 0, pendingGenesisAdxRewards: 0 });
            }
        };

        fetchRewards();
        const intervalId = setInterval(fetchRewards, 10000); // Refresh every 10 seconds

        return () => clearInterval(intervalId);
    }, [connection, isALP, adrenaClient, wallet]);

    return rewards;
};