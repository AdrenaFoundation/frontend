import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import infoIcon from '../../../../../../public/images/Icons/info.svg';

export default function LimitOrderWarning({ message }: { message: string }) {

  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-2 relative w-full  text-xs mt-1">
      <Image
        className="opacity-30 translate-y-0.5"
        src={infoIcon}
        height={14}
        width={14}
        alt="Info icon"
      />
      <span className="text-sm opacity-50 font-semibold">
        {t('trade.limitOrderWarning')}
      </span>
    </div>
  )
}
