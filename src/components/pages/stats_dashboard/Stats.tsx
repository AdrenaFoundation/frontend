import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import BarRechart from '@/components/pages/stats_dashboard/BarRechart';
import LineRechart from '@/components/pages/stats_dashboard/LineRechart';
import { TokenInfo } from '@/config/IConfiguration';

import SizeOfCustodyLine from './SizeOfCustodyLine';

export default function StatsDashboard() {
  const [custody, setCustody] = useState<any>(null);
  const [custodyInfo, setCustodyInfo] = useState<any>(null);

  const [AUM, setAUM] = useState<any>(null);

  useEffect(() => {
    getPoolInfo();
    getCustodyInfo();
  }, []);

  const getPoolInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/poolinfo?aum_usd=true&lp_token_price=true&short_pnl=true&long_pnl=true&open_interest_long_usd=true&open_interest_short_usd=true&cumulative_profit_usd=true&cumulative_loss_usd=true&cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true',
      );
      const { data } = await res.json();
      const { aum_usd, snapshot_timestamp } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const formattedData = aum_usd.map((aum: number, i: string | number) => ({
        name: timeStamp[i],
        value: aum,
      }));

      setAUM(formattedData);
    } catch (e) {
      console.error(e);
    }
  };

  const getCustody = async (mint: string) => {
    const custody = await window.adrena.client.getCustodyByPubkey(
      new PublicKey(mint),
    );
    return custody;
  };

  const getCustodyInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/custodyinfo?assets_value_usd=true&limit=9000',
      );
      const { data } = await res.json();
      const { assets_value_usd, snapshot_timestamp } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const custodyInfos = [];

      let custodyData = {
        USDC: [],
        WBTC: [],
        BONK: [],
        JITOSOL: [],
      };

      for (const [key, value] of Object.entries(assets_value_usd)) {
        const custody = await getCustody(key);
        if (!custody || !value) return;

        custodyInfos.push(custody.tokenInfo);

        custodyData = {
          ...custodyData,
          [custody.tokenInfo.symbol]: value,
        };
      }

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,
        WBTC: Number(custodyData.WBTC[i]) ? Number(custodyData.WBTC[i]) : 0,
        USDC: Number(custodyData.USDC[i]) ?? 0,
        BONK: Number(custodyData.BONK[i]) ?? 0,
        JITOSOL: Number(custodyData.JITOSOL[i]) ?? 0,
      }));

      setCustody(formatted);
      setCustodyInfo(custodyInfos);
    } catch (e) {
      console.error(e);
    }
  };

  if (!AUM || !custody) return <div>Loading...</div>;

  return (
    <StyledContainer className="mt-6 flex h-full" bodyClassName="h-full flex">
      <div className="grid grid-cols-2 gap-16">
        <LineRechart title={'AUM'} data={AUM} labels={[{ name: 'value' }]} />
        <SizeOfCustodyLine
          title={'Size of each custody'}
          data={custody}
          labels={
            custodyInfo.map((info: TokenInfo) => ({
              symbol: info.symbol,
              color: info.color,
            })) ?? []
          }
        />
      </div>
    </StyledContainer>
  );
}
