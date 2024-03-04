import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import EmphasizedTitle from '@/components/pages/user_profile/EmphasizedTitle';
import { PageProps, UserProfileExtended } from '@/types';

import UserProfile from '../user_profile';

export default function OtherUserProfile(pageProps: PageProps) {
  const router = useRouter();

  // false = error loading user profile
  // null = loading
  const [otherUserProfile, setOtherUserProfile] = useState<
    UserProfileExtended | null | false
  >(null);

  // only when there is an error loading the profile
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Read from URL params
    const otherUser = router.query.wallet;

    console.log('Other user wallet', otherUser);

    if (otherUser === null) {
      setOtherUserProfile(false);
      setErrorMessage('Cannot parse user wallet from URL');
      return;
    }

    (async () => {
      try {
        const pubkey = new PublicKey(otherUser as string);

        const otherUserProfile = await window.adrena.client.loadUserProfile(
          pubkey,
        );

        if (otherUserProfile === false) {
          setOtherUserProfile(false);
          setErrorMessage('The user does not have a profile');
          return;
        }

        setOtherUserProfile(otherUserProfile);
      } catch {
        setOtherUserProfile(false);
        setErrorMessage(
          'An error happened retrieving user profile information',
        );
        return;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, !!window.adrena.client.readonlyConnection]);

  if (otherUserProfile === null) {
    return <Loader className="mt-[20%]" />;
  }

  // An error happened loading the user profile
  if (otherUserProfile === false) {
    return (
      <div className="mt-[10%] ml-auto mr-auto flex items-center flex-col">
        <div className="mt-16 flex flex-col items-center">
          <span className="text-5xl text-txt">Oops!</span>
          <span className="text-3xl mt-4">{errorMessage}</span>
        </div>

        <div className="mt-16">
          <EmphasizedTitle title="User wallet" />

          <div className="text-sm italic text-txtfade mt-2 w-[30em] text-center">
            {router.query.wallet ?? '-'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm ml-4 flex items-center border-b border-white w-[18em]">
        <div>
          Visiting
          <span className="font-specialmonster text-lg ml-2 mr-2">
            {otherUserProfile.nickname}
          </span>
          profile
        </div>
      </div>

      <div className="mt-4"></div>

      <UserProfile
        {...pageProps}
        readonly={true}
        userProfile={otherUserProfile}
        triggerUserProfileReload={() => {
          // nothing
        }}
      />
    </div>
  );
}
