import Image from 'next/image';

import InfiniteScroll from '../common/InfiniteScroll/InfiniteScroll';

export default function LandingX() {
  const POSTS = [
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1966126222125019137/P9qNmSYp_400x400.jpg',
      user: 'Nom',
      handle: '@TheOnlyNom',
      content:
        "I heard you all got bullish on alternative Perp Dexs recently just in time for Adrena's Birthday!",
      link: 'https://x.com/TheOnlyNom/status/1970553582530261275',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1966140776888385536/hUx6QDye_400x400.jpg',
      user: 'Gaius',
      handle: '@gaius1337',
      content:
        '“How protocol revenue flows to owners” can be a competitive advantage. Study Adrena',
      link: 'https://x.com/gaius1337/status/1834846605083595098',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1972556108431839232/c5i19yv8_400x400.jpg',
      user: '孤鹤.hl',
      handle: '@ZKSgu',
      content:
        'perp dex是一个有真实营收的赛道，这意味着跟公链项目迥异，不是只有玩没tge的项目才能赚。之前整理的关于perp dex分红和质押分红的两张图表  里，都有提到这个项目 @AdrenaProtocol',
      link: 'https://x.com/ZKSgu/status/1971090308931948834',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1769928533655351296/bhKhNBjy_400x400.jpg',
      user: 'c2',
      handle: '@c2yptic',
      content:
        "tbh, I am very impressed with the @AdrenaDAO that's governing @AdrenaProtocol no bullshit, great- and educational conversations, people being respectful not that many daos out there that have this level of engagement and quality",
      link: 'https://x.com/c2yptic/status/1976707014861504780',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1946226298767962112/Cbu4xPDp_400x400.jpg',
      user: 'Johann',
      handle: '@joh55nn',
      content:
        'Adrena is shaping up to be the first perps dex on sol with (1) a buyable gov token that prints USDC while you sleep AND has continuous buy pressure (2) 100% of revenue distributed back to the community',
      link: 'https://x.com/joh55nn/status/1802725296287662133',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1863509572947755008/qeRLYFSK_400x400.jpg',
      user: 'Realms',
      handle: '@realmsdaos',
      content:
        "This week we're giving the DAO spotlight to @AdrenaProtocol\n\nOne of our R.E.D members and a true DAO in every sense of the word.\n\nAdrena’s approach sets a high bar—not just for how to do governance on Solana, but for how to do it well. It’s not flashy. \n\nIt’s not hyped. But it’s rock-solid and already live, quietly rewriting what “community-owned” can actually mean.",
      link: 'https://x.com/realmsdaos/status/1910368418332553485',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1968751038351212544/MiWT8OBc_400x400.jpg',
      user: 'FG',
      handle: '@ForrestGalt',
      content:
        "Adrena's liquidity is mind blowingly efficient\n\nAdrena is earning > 10x more than competitors for the same TVL\n\nADX is criminally undervalued @AdrenaProtocol",
      link: 'https://x.com/ForrestGalt/status/1904768315857264814',
    },
    {
      avatar:
        'https://pbs.twimg.com/profile_images/1966522911197683712/BXgWydGT_400x400.jpg',
      user: '◢',
      handle: '@joemccann',
      content: '.@AdrenaProtocol cook $ADX',
      link: 'https://x.com/joemccann/status/1974102059218866536',
    },
  ];
  return (
    <div className="w-full">
      <div className="w-full h-0.5 border-b border-bcolor border-dashed" />
      <div className="my-[3rem]">
        <InfiniteScroll
          speed={100}
          gap="xl"
          className="w-full"
          fadeColor="from-main to-transparent"
        >
          {POSTS.map((post) => (
            <div
              key={post.link}
              className="flex flex-col gap-3 w-[18.75rem] border p-3 rounded-lg bg-secondary"
            >
              <div className="flex flex-row items-center gap-3">
                <Image
                  src={post.avatar}
                  alt={post.user}
                  width={30}
                  height={30}
                  className="w-9 h-9 rounded-full border border-inputcolor"
                />
                <div>
                  <p className="text-base font-semibold">{post.user}</p>
                  <p className="text-xs opacity-50 font-mono">{post.handle}</p>
                </div>
              </div>
              <div className="w-full h-0.5 border-b border-bcolor border-dashed" />
              <p className="text-sm line-clamp-3 leading-relaxed text-wrap">
                &rdquo;{post.content}&rdquo;
              </p>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <div className="w-full h-0.5 border-b border-bcolor border-dashed" />
    </div>
  );
}
