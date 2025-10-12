import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import usdcLogo from '@/../../public/images/usdc.svg';
import Button from '@/components/common/Button/Button';
import CopyButton from '@/components/common/CopyButton/CopyButton';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import { UserProfileExtended } from '@/types';
import { addNotification } from '@/utils';

export default function Referrer({
  userProfile,
  setActiveProfile,
  connected,
}: {
  userProfile: UserProfileExtended | false | null;
  setActiveProfile: (profile: UserProfileExtended) => void;
  connected: boolean;
}) {
  const link = useMemo(
    () =>
      userProfile
        ? `https://app.adrena.trade/trade?referral=${encodeURIComponent(userProfile.nickname)}`
        : '',
    [userProfile],
  );

  const { allUserProfiles } = useAllUserProfiles({
    referrerProfileFilter: userProfile ? userProfile.pubkey : null,
  });

  return (
    <div
      className={twMerge(
        'flex flex-col gap-6 w-full',
        userProfile === false || !connected
          ? 'blur-2xl pointer-events-none'
          : '',
      )}
    >
      <div className="flex gap-8 pb-8 pt-4 flex-col md:flex-row w-full justify-center items-center md:items-start">
        <div className="flex flex-col items-center gap-8 w-[15em]">
          <div className="font-light uppercase tracking-widest text-md text-txtfade">
            Referees
          </div>

          <div className="flex items-center justify-center gap-2">
            <FormatNumber
              nb={allUserProfiles !== null ? allUserProfiles.length : undefined}
              format="number"
              className="text-3xl text"
              precision={0}
            />
          </div>
        </div>

        <div className="w-full h-[1px] md:h-full md:w-[1px] bg-bcolor" />

        <div className="flex flex-col items-center gap-8 w-[15em]">
          <div className="font-light uppercase tracking-widest text-md text-txtfade">
            Pending Rewards
          </div>

          <div className="flex items-center justify-center gap-2">
            <FormatNumber
              nb={userProfile ? userProfile.claimableReferralFeeUsd : 0}
              format="currency"
              className="text-3xl text"
              precision={6}
            />

            <Image src={usdcLogo} alt="USDC logo" className="w-5 h-5" />
          </div>

          <Button
            disabled={
              userProfile ? userProfile.claimableReferralFeeUsd === 0 : true
            }
            className="w-[20em]"
            size="lg"
            title="Claim"
            onClick={async () => {
              const notification =
                MultiStepNotification.newForRegularTransaction(
                  'Claim rewards',
                ).fire();

              try {
                await window.adrena.client.claimReferralRewards({
                  notification,
                });
              } catch (error) {
                console.log('error', error);
              }
            }}
          />
        </div>

        <div className="w-full h-[1px] md:h-full md:w-[1px] bg-bcolor" />

        <div className="flex flex-col items-center gap-8 w-[15em]">
          <div className="font-light uppercase tracking-widest text-md text-txtfade">
            TOTAL GENERATED
          </div>

          <div className="flex items-center justify-center gap-2">
            <FormatNumber
              nb={userProfile ? userProfile.totalReferralFeeUsd : 0}
              format="currency"
              className="text-3xl text"
              precision={6}
            />

            <Image src={usdcLogo} alt="USDC logo" className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-bcolor" />

      <div className="flex flex-col gap-6 items-center pb-8">
        <div className="font-light uppercase tracking-widest text-md text-txtfade">
          MY REFERRAL LINK
        </div>

        <div className="flex rounded-md bg-third">
          <div className=" pl-4 pr-4 pt-2 pb-2 text-sm md:min-w-[30em] cursor-pointer hover:opacity-100 opacity-90">
            {link}
          </div>

          <div className="h-full w-8 bg-inputcolor rounded-tr-lg rounded-br-lg items-center justify-center flex">
            <CopyButton
              textToCopy={link}
              notificationTitle="Referral link copied to clipboard"
              className="w-4 h-4"
            />
          </div>
        </div>

        <Button
          className="w-[20em]"
          size="lg"
          title="Share my referral link!"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);

              addNotification({
                title: 'Referral link copied to clipboard',
                message: '',
                type: 'info',
                duration: 'regular',
              });
            } catch (err) {
              console.error('Could not copy text: ', err);
            }
          }}
        />
      </div>

      <div className="w-full h-[1px] bg-bcolor" />

      <div className="pb-8 flex items-center flex-col gap-2 w-full">
        <div className="font-light uppercase tracking-widest text-md text-txtfade pb-6">
          REFEREES
        </div>

        <div className="flex flex-col gap-2 items-center w-[80%] max-w-[40em] border pt-2 pb-2 bg-third/40">
          {allUserProfiles !== null ? (
            allUserProfiles.map((referee, i) => (
              <div
                key={`one-referee-${i}`}
                className="w-full gap-2 flex flex-col"
              >
                {i > 0 ? <div className="w-full h-[1px] bg-bcolor" /> : null}

                <div
                  className="w-full items-center justify-center flex flex-col gap-2  opacity-70 hover:opacity-100 cursor-pointer"
                  onClick={() => {
                    setActiveProfile(referee);
                  }}
                >
                  <div className="flex text-sm text-white">
                    {referee.nickname.length
                      ? referee.nickname
                      : referee.owner.toBase58()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}

          {allUserProfiles !== null && allUserProfiles.length === 0 ? (
            <div className="w-full items-center justify-center flex text-sm opacity-80 pt-8 pb-8">
              No referee yet. Share your referral link!
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
