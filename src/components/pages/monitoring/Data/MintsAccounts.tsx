import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { CustodyExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function MintAccounts({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  return (
    <StyledContainer
      title="Mints"
      className="w-auto grow min-w-[45%]"
      titleClassName={titleClassName}
    >
      <Table
        breakpoint="767px"
        rowTitleWidth="30%"
        data={[
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                ADX <TitleAnnotation text="Mint" />
                <InfoAnnotation
                  text="Adrena's Governance token mint, can be staked for governance and revenue share access."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.lmTokenMint}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                ALP <TitleAnnotation text="Mint" />
                <InfoAnnotation
                  text="Adrena's Liquidity Pool token mint, represents a share of the pool."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.lpTokenMint}
              />
            ),
          },

          ...custodies.map((custody) => ({
            rowTitle: (
              <div className="font-boldy">
                {custody.tokenInfo.symbol}
                <TitleAnnotation text="Mint" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={custody.mint}
              />
            ),
          })),
        ]}
      />
    </StyledContainer>
  );
}
