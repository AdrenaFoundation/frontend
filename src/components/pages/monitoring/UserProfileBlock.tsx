import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FormatNumber from '@/components/Number/FormatNumber';
import { SuperchargedUserProfile } from '@/hooks/useAllUserSupercharedProfiles';
import { UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress, getNonUserProfile } from '@/utils';

import OnchainAccountInfo from './OnchainAccountInfo';

interface UserProfileBlockProps {
  superchargedProfile: SuperchargedUserProfile;
  className?: string;
  setActiveProfile: (profile: UserProfileExtended) => void;
}

export default function UserProfileBlock({
  superchargedProfile,
  setActiveProfile,
  className,
}: UserProfileBlockProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full flex flex-col border rounded-md bg-[#050D14] overflow-hidden p-3 ${className}`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row gap-6 justify-between items-center">
        <div
          className="flex flex-1 flex-col items-start"
          onClick={() =>
            setActiveProfile(
              superchargedProfile.profile ||
              getNonUserProfile(superchargedProfile.wallet.toBase58()),
            )
          }
        >
          <div className="flex w-full font-mono text-xxs">
            <span className="text-blue cursor-pointer hover:underline text-base sm:text-lg">
              {(superchargedProfile.profile &&
                superchargedProfile.profile.nickname) ??
                getAbbrevWalletAddress(superchargedProfile.wallet.toBase58())}
            </span>
          </div>
          <OnchainAccountInfo
            address={superchargedProfile.wallet}
            shorten={true}
            className="text-xxs"
            iconClassName="w-2 h-2"
          />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex w-full font-mono text-xxs text-txtfade">
            {t('monitoring.totalFeesPaid')}
          </div>
          <div className="flex">
            <FormatNumber
              nb={superchargedProfile.traderProfile?.totalFees}
              format="currency"
              className="text-gray-400 text-xs lowercase"
              isDecimalDimmed={true}
              precision={0}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex w-full font-mono text-xxs text-txtfade">
            {t('monitoring.totalOpenVolume')}
          </div>
          <div className="flex">
            <FormatNumber
              nb={superchargedProfile.traderProfile?.totalVolume}
              format="currency"
              className="text-gray-400 text-xs lowercase"
              isDecimalDimmed={true}
              precision={0}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col mt-2 sm:mt-0">
          <div className="flex w-full font-mono text-xxs text-txtfade">
            {t('monitoring.totalPnl')}
          </div>
          <div className="flex">
            <FormatNumber
              nb={superchargedProfile.traderProfile?.totalPnl}
              format="currency"
              className={`text-gray-400 text-xs lowercase ${(superchargedProfile.traderProfile?.totalPnl ?? 0) > 0 ? 'text-green' : 'text-red'}`}
              isDecimalDimmed={false}
              precision={0}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
