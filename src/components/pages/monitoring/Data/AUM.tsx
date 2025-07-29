import { PublicKey } from '@solana/web3.js';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';

export default function AUM({ connected, poolKey }: { connected: boolean; poolKey: PublicKey }) {
  const aumUsd = useAssetsUnderManagement({ poolKey });

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
