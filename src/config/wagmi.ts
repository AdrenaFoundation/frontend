import { createConfig, http } from 'wagmi';
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
} from 'wagmi/chains';

// Configure Wagmi for EVM chains that LI.FI supports
// Solana is handled separately by LI.FI's native Solana support
export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc, avalanche],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
  },
});
