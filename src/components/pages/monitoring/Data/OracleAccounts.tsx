import { PublicKey } from '@solana/web3.js';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { CustodyExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function OracleAccounts({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  return (
    <StyledContainer
      title="Oracle Accounts"
      subTitle="Oracle on-chain accounts (PDAs)."
      className="w-[37em] grow min-w-[37em]"
      titleClassName={titleClassName}
    >
      <Table
        breakpoint="767px"
        rowTitleWidth="30%"
        data={[
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Pyth Program
                <InfoAnnotation
                  text="Account containing the source code of the Pyth smart contract."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={
                  new PublicKey('rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ')
                }
              />
            ),
          },
          ...custodies
            .map((custody) => {
              const rows = [
                {
                  rowTitle: (
                    <div className="flex items-center">
                      {custody.tokenInfo.symbol} Oracle
                      <TitleAnnotation text="PDA" />
                    </div>
                  ),
                  value: (
                    <OnchainAccountInfo
                      className="md:ml-auto"
                      address={custody.nativeObject.oracle}
                    />
                  ),
                },
              ];

              if (custody.tradeTokenInfo.symbol !== custody.tokenInfo.symbol) {
                rows.push({
                  rowTitle: (
                    <div className="flex items-center">
                      {custody.tradeTokenInfo.symbol} Oracle
                      <TitleAnnotation text="PDA" />
                    </div>
                  ),
                  value: (
                    <OnchainAccountInfo
                      className="md:ml-auto"
                      address={custody.nativeObject.tradeOracle}
                    />
                  ),
                });
              }

              return rows.flat();
            })
            .flat(),
        ]}
      />
    </StyledContainer>
  );
}
