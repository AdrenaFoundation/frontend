import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import { useDispatch } from '@/store/store';

import phantomLogo from '../../../public/images/phantom.svg';
import Button from '../common/Button/Button';

export default function WalletConnection({
  connected,
  disableSubtext,
  className,
}: {
  connected?: boolean;
  disableSubtext?: boolean;
  className?: string;
}) {
  const dispatch = useDispatch();

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }
  };

  return (
    <div className={twMerge("flex flex-col h-full items-center justify-center", className)}>
      <Button
        title="Connect wallet"
        variant="secondary"
        rightIcon={phantomLogo}
        className={twMerge(!disableSubtext && "mb-2")}
        onClick={handleClick}
      />

      {disableSubtext ? <p className="text-sm opacity-50 font-normal">
        Waiting for wallet connection
      </p> : null}
    </div>
  );
}
