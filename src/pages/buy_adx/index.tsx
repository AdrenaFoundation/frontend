import Image from 'next/image';
import React from 'react';

import ADXFeeStreamAnimation from '@/components/buy_adx/ADXFeeStreamAnimation';
import ADXVoteAnimation from '@/components/buy_adx/ADXVoteAnimation';
import Button from '@/components/common/Button/Button';

import communityIllustration from '../../../public/images/community-illustration.png';
import coralIllustration from '../../../public/images/coral.svg';
import fishIllustration from '../../../public/images/fish.svg';
import jellyfishIllustration from '../../../public/images/jellyfish.svg';
import orcaIllustration from '../../../public/images/orca.svg';
import orcaIcon from '../../../public/images/orca-icon.png';

export default function BuyADX() {
  return (
    <div className="flex flex-col gap-[200px] lg:gap-[300px] px-7">
      <div className="flex flex-col justify-center items-start w-full h-[800px] z-10">
        <div className="flex flex-row gap-3 items-center">
          <Image
            src={window.adrena.client.adxToken.image}
            className="w-6 h-6"
            alt="adx logo"
          />
          <div>
            <h3 className="inline-block">ADX</h3>{' '}
            <h3 className="inline-block text-txtfade">
              – The Governance Token
            </h3>
          </div>
        </div>
        <h1 className="text-[2.6rem] lg:text-[3rem] uppercase max-w-[840px]">
          Unlocking Rewards, Voting Power, and Community Influence with Adrena
          Token
        </h1>

        <p className="text-[1.2rem] max-w-[640px] text-txtfade mb-6">
          Dive into the dynamic world of the Adrena ecosystem with the Adrena
          Token, where ownership is not just about holding, but about actively
          shaping the future.
        </p>
        <Button
          title="Buy ADX on Orca"
          href="https://www.orca.so/"
          rightIcon={orcaIcon}
          iconClassName="w-5 h-5"
          size="lg"
          className="mt-4 px-14 py-3 text-base"
        />
      </div>
      <>
        <Image
          src={orcaIllustration}
          alt="orca illustration"
          className="absolute top-[900px] lg:top-[100px] right-28 opacity-50 w-[200px] lg:w-[400px]"
        />

        <Image
          src={fishIllustration}
          alt="fish illustration"
          className="absolute left-0 opacity-50 w-96"
        />

        <Image
          src={fishIllustration}
          alt="fish illustration"
          className="absolute left-[0px] md:left-[500px] top-[600px] opacity-50 w-96"
        />
      </>

      <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-center w-full ">
        <div className="relative">
          <h1 className="text-[1.2rem] opacity-75">Rewarding Ownership</h1>
          <p className="text-[2rem] max-w-[800px] mb-6">
            By holding the token, they receive a share of the platform&apos;s
            fees in USDC, providing a consistent passive income stream.
            Secondly, when the token is held in liquid form, holders gain voting
            power in the ecosystem&apos;s governance, allowing them to shape the
            platform&apos;s future.
          </p>
        </div>

        <ADXFeeStreamAnimation />
      </div>

      <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-center w-full ">
        <div className="relative">
          <h1 className="text-[1.2rem] opacity-75">Empowered Voting Rights</h1>
          <p className="text-[2rem] max-w-[800px] mb-6">
            The token grants its holders a powerful voice within the Adrena
            ecosystem&apos;s governance structure. Through their ownership,
            holders can participate directly in decision-making processes that
            shape the platform&apos;s development, evolution, and future
            direction.
          </p>
        </div>

        <ADXVoteAnimation />
        <Image
          src={jellyfishIllustration}
          alt="jellyfish"
          className="absolute top-[0px] right-[100px] md:right-[600px] w-[100px] rotate-45 -z-10"
        />
      </div>

      <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-center w-full ">
        <div className="relative">
          <h1 className="text-[1.2rem] opacity-75">
            Thriving Community Engagement
          </h1>
          <p className="text-[2rem] max-w-[800px] mb-6">
            United by a shared vision of innovation and progress, community
            members actively collaborate, share insights, and drive forward
            initiatives that benefit the entire ecosystem. Whether through
            governance proposals, strategic partnerships, or grassroots
            marketing efforts, the community plays a pivotal role in shaping the
            ecosystem&apos;s success.
          </p>
        </div>

        <Image
          src={communityIllustration}
          alt="community illustration"
          className="w-full lg:max-w-[600px]"
        />

        <Image
          src={jellyfishIllustration}
          alt="jellyfish"
          className="absolute -top-[150px] left-[100px] w-[100px] -z-10"
        />
      </div>

      <div>
        <div className="relative">
          <Image
            src={coralIllustration}
            alt="coral illustration"
            className=" w-full mx-auto mb-6"
          />
          <div className="absolute bottom-0 w-full h-[100px] bg-gradient-to-t from-[#050F19] rounded-b-2xl z-10" />
        </div>
        <div className="my-[200px]">
          <h3 className="text-center text-[1.6rem]">Buy ADX at Orca Today</h3>
          <p className="text-center opacity-50 mb-6 text-lg max-w-[400px] mx-auto">
            Be part of the Adrena ecosystem by purchasing ADX tokens on Orca
          </p>
          <Button
            title="Buy ADX on Orca"
            href="https://www.orca.so/"
            rightIcon={orcaIcon}
            size="lg"
            className="mt-4 px-8 py-3 mx-auto"
            iconClassName="w-4 h-4"
          />
        </div>
      </div>
    </div>
  );
}
