import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';

export default function AUM({ connected }: { connected: boolean }) {
  const aumUsd = useAssetsUnderManagement();

  return (
    <NumberDisplay
      title="AUM"
      nb={aumUsd}
      format="currency"
      precision={0}
      className="bg-mainDark"
      subtitle={!connected ? 'Expect up to a 5-minute delay in the data' : ''}
    />
  );
}
