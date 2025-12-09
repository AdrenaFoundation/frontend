import { useTranslation } from 'react-i18next';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import { useDispatch } from '@/store/store';

import phantomLogo from '../../../public/images/phantom.svg';
import Button from '../common/Button/Button';

export default function WalletConnection({
  connected,
}: {
  connected?: boolean;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <Button
        title={t('common.connectWallet')}
        variant="secondary"
        rightIcon={phantomLogo}
        className="mb-2"
        onClick={handleClick}
      />

      <p className="text-sm opacity-50 font-normal">
        {t('common.waitingForWalletConnection')}
      </p>
    </div>
  );
}
