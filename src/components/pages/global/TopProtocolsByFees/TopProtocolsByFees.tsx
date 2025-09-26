import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import defillamaImg from '@/../public/images/defillama.png';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import PeriodSelector from '@/components/ReCharts/PeriodSelector';

export default function TopProtocolsByFees() {
  const [data, setData] = useState<{
    name: string;
    fees: number;
    rank: number;
    logo: string;
  }[] | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const [apiRetProtocols, setApiRetProtocols] = useState<Array<{
    name: string;
    total24h: number;
    total7d: number;
    total30d: number;
    logo: string;
  }> | null>(null);

  const getTopProtocolsByApi = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
      );

      console.log('res', res);

      const d: {
        protocols: Array<{
          name: string;
          total24h: number;
          total7d: number;
          total30d: number;
          logo: string;
        }>;
      } = await res.json();

      setApiRetProtocols(d.protocols);
    } catch (error) {
      console.error('Error fetching top protocols by fees:', error);
    }
  }, []);

  const getTopProtocolsByFees = useCallback(async () => {
    if (!period || !apiRetProtocols) return;

    try {
      const attributeName = ({
        '1d': 'total24h',
        '7d': 'total7d',
        '1M': 'total30d',
      } as const)[period];

      if (!attributeName) return;

      const protocols = apiRetProtocols.filter((p) => typeof p[attributeName] != 'undefined').map((protocol) => [protocol[attributeName], protocol.name, protocol.logo] as const);

      // Sort protocols by total7d in descending order and take the 3 protocols UP and down Adrena
      const sortedProtocols = protocols
        .sort((a, b) => b[0] - a[0]);

      const adrenaIndex = sortedProtocols.findIndex(([, protocolName]) => protocolName === 'Adrena Protocol');

      // Extract the 3 protocols above and below Adrena
      const topProtocols = sortedProtocols.slice(Math.max(0, adrenaIndex - 3), adrenaIndex)
        .concat(sortedProtocols.slice(adrenaIndex, adrenaIndex + 4));

      setData(topProtocols.map(([fees, name, logo], i) => ({
        name,
        fees,
        rank: adrenaIndex - 3 + i + 1,
        logo,
      })));
    } catch (e) {
      console.error(e);
    }
  }, [period, apiRetProtocols]);

  useEffect(() => {
    getTopProtocolsByFees();
  }, [getTopProtocolsByFees]);

  useEffect(() => {
    getTopProtocolsByApi();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getTopProtocolsByApi, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [getTopProtocolsByApi]);


  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return <div className='flex flex-col'>
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className='flex flex-col mb-3'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <Image src={defillamaImg} alt="DefiLlama" className='h-6 w-6' />

            <h2>TOP PROTOCOLS BY FEES</h2>
          </div>
          <PeriodSelector period={period} setPeriod={setPeriod} periods={['1d', '7d', '1M']} />
        </div>

        <Tippy content={<div className='flex flex-col'>
          <div>
            Note: The ranking shown on DeFiLlama differs from the one displayed here. We use the DeFiLlama API<span className='text-white/50 text-sm ml-1'>* </span>, while their site uses a different data source for rankings.
          </div>

          <div className='text-white/50 text-sm mt-2'>* https://api-docs.defillama.com/#tag/fees-and-revenue/get/overview/fees</div>
        </div>}>

          <div className='text-xxs lowercase opacity-30 cursor-pointer hover:opacity-60'>
            Source: <a href="https://defillama.com/fees" target='_blank'>
              https://defillama.com/fees
            </a>
          </div>
        </Tippy>
      </div>

      <div className='flex'>
        <div className='text-sm w-9 text-white/30'>rank</div>
        <div className='text-sm text-white/30'>protocol</div>
        <div className='ml-auto text-sm mr-4 text-white/30'>fees</div>
      </div>

      <div className='flex flex-col'>
        {data.map(({ name, fees, rank, logo }, i) => (
          <div key={name} className={`flex justify-between items-center border-b ${i === 0 ? 'border-t' : ''} border-bcolor p-1`}>
            <div className="flex items-center gap-2">
              <div className={`text-sm font-semibold w-6 text-left ${name === 'Adrena Protocol' ? 'text-[#6ebeff]' : ''}`}>{rank}</div>
              { /* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={`${name} logo`} className={`h-4 w-4 ${name === 'Adrena Protocol' ? 'grayscale' : 'grayscale'}`} />

              <div className={`text-sm font-semibold ${name === 'Adrena Protocol' ? 'text-[#6ebeff]' : ''}`}>{name}</div>
            </div>

            <div className={`text-sm`}>
              <FormatNumber nb={fees} format='currency' className={`${name === 'Adrena Protocol' ? 'text-[#6ebeff]' : ''}`} />
            </div>
          </div>
        ))}
      </div>
    </div >
  </div >;
}
