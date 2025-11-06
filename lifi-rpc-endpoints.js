/**
 * LiFi Widget RPC Endpoints
 * 
 * Comprehensive list of RPC endpoints for all chains supported by LiFi.
 * Separated from next.config.js to keep CSP configuration manageable.
 * 
 * These endpoints are added to the Content Security Policy's connect-src directive.
 */

module.exports = [
  // ========== MAJOR RPC PROVIDER WILDCARDS ==========
  // These cover 90%+ of chains via third-party providers
  'https://*.publicnode.com',      // 30+ chains
  'https://*.drpc.org',             // 50+ chains
  'https://*.g.alchemy.com',        // Ethereum, Polygon, Arbitrum, etc.
  'https://*.infura.io',            // Major chains
  'https://*.ankr.com',             // Multi-chain
  'https://*.quiknode.pro',         // Multi-chain
  'https://*.chainbase.online',     // Multi-chain
  'https://*.nodereal.io',          // BSC and multi-chain
  'https://*.blastapi.io',          // Multi-chain
  'https://cloudflare-eth.com',     // Cloudflare ETH
  'https://*.1rpc.io',              // Privacy-focused
  'https://*.llamarpc.com',         // Aggregator
  'https://*.helius-rpc.com',       // Solana
  'wss://*.helius-rpc.com',         // Solana WebSocket
  'https://*.stakely.io',           // Multi-chain
  'https://*.matterhosted.dev',     // Lens and others
  'https://*.rpcpool.com',          // Solana
  'wss://*.rpcpool.com',            // Solana WebSocket
  'https://*.blockpi.network',      // Multi-chain
  'https://*.chainstack.com',       // Multi-chain
  'https://*.bnbchain.org',         // BSC and opBNB
  'https://*.moonbeam.network',     // Moonbeam/Moonriver
  'https://*.alt.technology',       // Alternative tech
  'https://*.flare.network',        // Flare Network
  'https://*.merkle.io',            // Merkle provider

  // ========== MAJOR L1/L2 CHAINS ==========
  // Chain-owned RPC endpoints not covered by provider wildcards
  'https://mainnet.optimism.io',
  'https://arb1.arbitrum.io',
  'https://mainnet.base.org',
  'https://polygon-rpc.com',
  'https://bsc-dataseed.binance.org',
  'https://api.avax.network',

  // ========== ADDITIONAL L2s & ALT-L1s ==========
  // Less common chains that users might bridge to/from
  'https://evm.cronos.org',
  'https://public-node.rsk.co',
  'https://mycrypto.rsk.co',
  'https://rpc.xdcrpc.com',
  'https://rpc.gnosischain.com',
  'https://rpc.fuse.io',
  'https://mainnet.unichain.org',
  'https://rpc.soniclabs.com',
  'https://rpcapi.fantom.network',
  'https://rpc.fantom.network',
  'https://mainnet.evm.nodes.onflow.org',
  'https://rpc.hyperliquid.xyz',
  'https://rpc.hyperlend.finance',
  'https://rpc.hypurrscan.io',
  'https://andromeda.metis.io',
  'https://zkevm-rpc.com',
  'https://mainnet.era.zksync.io',
  'https://evm-rpc.sei-apis.com',
  'https://rpc.api.moonbeam.network',
  'https://rpc.api.moonriver.moonbeam.network',
  'https://rpc.gravity.xyz',
  'https://rpc.soneium.org',
  'https://api.roninchain.com',
  'https://rpc.plasma.to',
  'https://rpc.immutable.com',
  'https://rpc.apechain.com',
  'https://mainnet.mode.network',
  'https://forno.celo.org',
  'https://node.mainnet.etherlink.com',
  'https://rpc.hemi.network',
  'https://rpc.sophon.xyz',
  'https://rpc.superposition.so',
  'https://rpc-gel.inkonchain.com',
  'https://rpc.linea.build',
  'https://rpc.gobob.xyz',
  'https://rpc.berachain.com',
  'https://rpc.blast.io',
  'https://rpc.plume.org',
  'https://rpc.mainnet.taiko.xyz',
  'https://rpc.taiko.xyz',
  'https://mainnet.aurora.dev',
  'https://rpc.mantle.xyz',
  'https://public-en.node.kaia.io',
  'https://rpc.scroll.io',
  'https://rpc.vana.org',
  'https://api.mainnet.abs.xyz',
  'https://rpc.katana.network',
  'https://mainnet.corn-rpc.com',
  'https://mainnet.boba.network',
  'https://replica.boba.network',
  'https://rpc.frax.com',
  'https://rpc.api.lisk.com',
];

