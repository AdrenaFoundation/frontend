import Image from 'next/image';

import infoIcon from '../../../../../../public/images/Icons/info.svg';

export default function LimitOrderWarning() {
  return (
    <div className="flex items-start gap-2 relative w-full  text-xs mt-1">
      <Image
        className="opacity-30 translate-y-0.5"
        src={infoIcon}
        height={14}
        width={14}
        alt="Info icon"
      />
      <span className="text-sm opacity-50 font-medium">
        Limit orders will only execute if sufficient liquidity is available at the time of order execution.
      </span>
    </div>
  )
}
