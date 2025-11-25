import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import useAssetsUnderManagement from '@/hooks/analytics-metrics/useAssetsUnderManagement';

export default function AUM({ connected }: { connected: boolean }) {
  const aumUsd = useAssetsUnderManagement();

  return (
    <NumberDisplay
      title="AUM"
      nb={aumUsd}
      format="currency"
      precision={0}
      className="bg-[#050D14]"
      subtitle={!connected ? 'Expect up to a 5-minute delay in the data' : ''}
    />
  );
}
