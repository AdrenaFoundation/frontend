export const INTEGRATIONS = [
  {
    id: 1,
    name: 'Send AI',
    description: 'A decentralized AI platform for Solana.',
    icon: 'https://avatars.githubusercontent.com/u/188793707?s=200&v=4',
    link: 'https://sendai.xyz/',
    tags: ['AI'],
    status: 'active',
    content: [
      {
        type: 'image-carousel',
        items: [
          'https://pbs.twimg.com/media/GowrhA_aUAAsXOQ?format=jpg&name=medium',
          'https://pbs.twimg.com/media/Geibl7aWoAAKCUl?format=png&name=900x900',
          'https://pbs.twimg.com/media/GedC5taaEAIFaUc?format=jpg&name=medium',
          'https://pbs.twimg.com/card_img/1921512207243735040/kHkFX4DI?format=png&name=small',
        ],
      },
      {
        text: 'Solana Agent Kit provides comprehensive integration with Adrena for perpetual trading. The integration supports both long and short positions with configurable leverage and slippage parameters.',
        type: 'p',
      },
      {
        type: 'h2',
        text: 'Key features include:',
      },
      {
        type: 'list',
        text: [
          'Long/Short position trading',
          'Configurable leverage up to 100x',
          'Slippage protection',
          'Automated token account setup',
          'Price feed integration',
          'Support for multiple collateral types',
        ],
      },
      {
        type: 'divider',
      },
      // {
      //   text: 'Send AI is a decentralized AI platform that allows users to create and deploy AI models on the Solana blockchain. It provides a secure and efficient way to leverage AI technology in the Solana ecosystem.',
      //   type: 'p',
      // },
      {
        type: 'h3',
        text: 'Long Position',
      },
      {
        type: 'code-block',
        content: `const signature = await agent.methods.openPerpTradeLong({
          price: 300, // USD price
          collateralAmount: 10, // Amount of collateral
          collateralMint: new PublicKey("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"), // jitoSOL
          leverage: 50000, // 5x leverage (10000 = 1x)
          tradeMint: new PublicKey("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"), // Trading asset
          slippage: 0.3, // 0.3% slippage tolerance
    });`,
      },
      {
        type: 'space',
      },
      {
        type: 'h3',
        text: 'Short Position',
      },
      {
        type: 'code-block',
        content: `const signature = await agent.methods.openPerpTradeShort({
          price: 300,
          collateralAmount: 10,
          collateralMint: TOKENS.USDC, // Default collateral for shorts
          leverage: 50000,
          tradeMint: TOKENS.jitoSOL,
          slippage: 0.3,
    });`,
      },
      {
        type: 'space',
      },
      {
        text: 'Close Long Position',
        type: 'h3',
      },
      {
        type: 'code-block',
        content: `const signature = await agent.methods.closePerpTradeLong({
          price: 200, // Minimum exit price
          tradeMint: new PublicKey("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"),
    });`,
      },
      {
        type: 'space',
      },
      {
        text: 'Close Short Position',
        type: 'h3',
      },
      {
        type: 'code-block',
        content: `const signature = await agent.methods.closePerpTradeShort({
          price: 200,
          tradeMint: new PublicKey("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"),
    });`,
      },
      {
        type: 'divider',
      },
      {
        text: 'Examples Prompts',
        type: 'h2',
      },
      {
        type: 'code-block',
        content: `"Open a long position in SOL with 5x leverage using 10 jitoSOL as collateral"

"Short ETH with 3x leverage using 100 USDC as collateral with 0.5% slippage"

"Go long on JitoSOL with maximum leverage of 10x using 5 SOL"`,
      },
      {
        type: 'divider',
      },
      {
        type: 'link',
        external: true,
        title: 'Learn more about Send AI integration with Adrena',
        icon: null,
        href: 'https://docs.sendai.fun/docs/v2/integrations/defi-integration/adrena',
      },
    ],
  },
  {
    id: 2,
    name: 'Dialect – Blinks',
    description: 'Integrate onchain experiences into your app.',
    icon: 'https://pbs.twimg.com/profile_images/1891975865589747712/K9PmLngf_400x400.jpg',
    link: 'https://dialect.so/',
    tags: ['SocialFi'],
    status: 'active',
    content: [
      {
        type: 'image-carousel',
        items: [
          'https://pbs.twimg.com/profile_banners/1433615915124465671/1745431653/1500x500',
          // 'https://pbs.twimg.com/card_img/1922685736769495040/NA6Owugy?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GkE6kBgXgAA2mLi?format=jpg&name=medium',
          'https://pbs.twimg.com/media/Gh07z3kXUAAzOap?format=jpg&name=medium',
        ],
      },
      {
        text: 'Adrena has integrated Dialect’s Blinks to bring seamless, onchain actions directly to users—no redirects, no friction. With Blinks, users can now Buy ALP, Claim ADX Rewards, and Stake ADX instantly from anywhere, whether it’s a website, social post, or messaging app. This collaboration makes Adrena’s DeFi experience faster, simpler, and more accessible.',
        type: 'p',
      },
      {
        type: 'h2',
        text: 'Key features include:',
      },
      {
        type: 'list',
        text: ['Buy ALP', 'Claim Rewards for ADX', 'Stake ADX'],
      },
      {
        type: 'divider',
      },
      {
        type: 'h1',
        text: 'Blinks',
      },
      // {
      //   type: 'p',
      //   text: 'These are the onchain actions that can be performed using Dialect Blinks:',
      // },
      // {
      //   type: 'space',
      // },
      {
        type: 'h3',
        text: 'Buy ALP',
      },
      {
        type: 'blink',
        text: 'Buy ALP',
        url: 'https://api.dial.to/v1/blink?apiUrl=https%3A%2F%2Fjito.dial.to%2Fstake%3F_bin%3D83308537-b8a4-4225-acd7-9269d79940a7',
      },
      {
        type: 'space',
      },
      {
        type: 'h3',
        text: 'Claim ADX Rewards',
      },
      {
        type: 'blink',
        text: 'Claim ADX Rewards',
        url: 'https://api.dial.to/v1/blink?apiUrl=https%3A%2F%2Fmeteora.dial.to%2Fapi%2Factions%2Fdlmm%2F2dBPJGLgNDZnzA32452zV2u6vensbo28dveBvecDg6X1%3Faction%3Dadd-liquidity',
      },
      {
        type: 'space',
      },
      {
        type: 'h3',
        text: 'Stake ADX',
      },
      {
        type: 'blink',
        text: 'Stake ADX',
        url: 'https://api.dial.to/v1/blink?apiUrl=https%3A%2F%2Fjito.dial.to%2Fstake%3F_bin%3D83308537-b8a4-4225-acd7-9269d79940a7',
      },
    ],
  },
  {
    id: 3,
    name: 'Solana ID',
    description: 'A decentralized identity solution for Solana.',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/200x200/34790.png',
    link: 'https://solana.id/',
    tags: ['SocialFi'],
    status: 'active',
    content: [
      {
        type: 'image-carousel',
        items: [
          'https://pbs.twimg.com/profile_banners/1576494445368954882/1736243569/1500x500',
          'https://pbs.twimg.com/media/GpzpjRwaYAA6OOb?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GpzphW4aEAAdnQy?format=jpg&name=medium',
        ],
      },

      {
        text: 'Solana ID is a decentralized identity solution that allows users to create and manage their identities on the Solana blockchain. It provides a secure and private way to verify identities without relying on centralized authorities.',
        type: 'p',
      },
      {
        type: 'h2',
        text: 'Key features include:',
      },
      {
        type: 'list',
        text: ['Earn Mutagen'],
      },
      {
        type: 'divider',
      },
      {
        type: 'h1',
        text: 'How to claim the perk:',
      },
      {
        type: 'video',
        // url: 'https://x.com/i/status/1917664407339032683',
        url: 'https://video.twimg.com/amplify_video/1917664353811324928/vid/avc1/1280x720/Jx8Li8NGg9R35KVo.mp4?tag=14',
      },
    ],
  },
] as const;

export const INTEGRATION_UPCOMING = [
  {
    name: 'Kamino v2',
    description: 'A decentralized liquidity management platform for Solana.',
    icon: 'https://miro.medium.com/v2/resize:fit:400/0*DxMTlQk_wu_WuvnW.jpg',
    link: 'https://kamino.finance/',
    tags: ['DeFi Integration'],
    status: 'upcoming',
  },
];
