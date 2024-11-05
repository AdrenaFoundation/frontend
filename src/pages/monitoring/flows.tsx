import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended } from '@/types';

export default function Flow({
  custodies,
}: {
  custodies: CustodyExtended[] | null;
}) {
  const { data, loading, setStartDate } = usePositionStats();

  if (loading) return <div>Loading...</div>;

  const stats = Array.isArray(data) ? data : [];

  // Group stats by symbol
  const groupedStats = stats.reduce((acc, stat) => {
    if (!acc[stat.symbol]) {
      acc[stat.symbol] = [];
    }
    acc[stat.symbol].push(stat);
    return acc;
  }, {} as Record<string, typeof stats>);

  return (
    <StyledContainer className="rounded-lg overflow-hidden m-2 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Custodies Flows</h2>
        <select
          onChange={(e) => {
            const value = e.target.value;
            const date = new Date();
            switch (value) {
              case 'all-time':
                setStartDate('2020-01-01T00:00:00Z');
                break;
              case 'last-month':
                date.setMonth(date.getMonth() - 1);
                setStartDate(date.toISOString());
                break;
              case 'last-week':
                date.setDate(date.getDate() - 7);
                setStartDate(date.toISOString());
                break;
              case 'yesterday':
                date.setDate(date.getDate() - 1);
                setStartDate(date.toISOString());
                break;
              default:
                break;
            }
          }}
          className="px-4 py-2 bg-[#050D14] rounded hover:bg-[#0a1721]"
        >
          <option value="all-time">All Time</option>
          <option value="last-month">Last Month</option>
          <option value="last-week">Last Week</option>
          <option value="yesterday">Yesterday</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(groupedStats).map(([symbol, symbolStats]) => (
          <div key={symbol} className="p-4 border rounded bg-[#050D14]">
            <h3 className="font-semibold flex items-center gap-2">
              <Image
                src={custodies?.find((c) => c.tokenInfo.symbol.toLocaleLowerCase() === symbol.toLowerCase())?.tokenInfo.image || ''}
                alt="token icon"
                width="24"
                height="24"
              />
              {symbol}
            </h3>
            {symbolStats.map((stat, index) => (
              <div key={stat.side} className={'mt-2'}>
                <StyledContainer className="rounded-lg overflow-hidden ">
                  <h4 className={`font-semibold ${stat.side === 'long' ? 'text-green' : 'text-red'}`}>{stat.side}</h4>
                  <div className="flex justify-between text-txtfade">
                    <span>Positions count:</span>
                    <FormatNumber
                      nb={stat.count_positions}
                      precision={0}
                      minimumFractionDigits={0}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Total PnL over the period:</span>
                    <FormatNumber
                      nb={stat.total_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                      className={stat.total_pnl < 0 ? 'text-red' : 'text-green'}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Average PnL:</span>
                    <FormatNumber
                      nb={stat.average_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                      className={stat.average_pnl < 0 ? 'text-red' : 'text-green'}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Worst PnL:</span>
                    <FormatNumber
                      nb={stat.min_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                      className={stat.min_pnl < 0 ? 'text-red' : 'text-green'}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Best PnL:</span>
                    <FormatNumber
                      nb={stat.max_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                      className={stat.max_pnl < 0 ? 'text-red' : 'text-green'}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Total Trade Volume:</span>
                    <FormatNumber
                      nb={stat.total_volume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                    />
                  </div>
                  <div className="h-[1px] bg-third my-2" />
                  <div className="flex justify-between text-txtfade">
                    <span>Smallest Trade Size:</span>
                    <FormatNumber
                      nb={stat.min_volume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Biggest Trade Size:</span>
                    <FormatNumber
                      nb={stat.max_volume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Average Trade Size:</span>
                    <FormatNumber
                      nb={stat.average_volume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix='$'
                      showSignBeforePrefix={true}
                    />
                  </div>
                </StyledContainer>
              </div>
            ))}
          </div>
        ))}
      </div>
    </StyledContainer >
  );
}
