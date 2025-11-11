import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import { UserProfileExtended } from '@/types';

export default function MigrateUserProfileV1Tov2Modal({
  userProfile,
  close,
  walletPubkey,
  triggerUserProfileReload,
}: {
  userProfile: UserProfileExtended;
  close: () => void;
  walletPubkey?: PublicKey;
  triggerUserProfileReload: () => void;
}) {
  const [alreadyTakenNicknames, setAlreadyTakenNicknames] = useState<
    Record<string, boolean>
  >({});
  const [updatedNickname, setUpdatedNickname] = useState<string | null>(
    userProfile.nickname,
  );
  const [trimmedUpdatedNickname, setTrimmedUpdatedNickname] = useState<string>(
    updatedNickname ?? '',
  );

  useEffect(() => {
    setTrimmedUpdatedNickname((updatedNickname ?? '').trim());
  }, [updatedNickname]);

  const migrateProfile = useCallback(async () => {
    const notification =
      MultiStepNotification.newForRegularTransaction('Edit Nickname').fire();

    if (
      trimmedUpdatedNickname.length < 3 ||
      trimmedUpdatedNickname.length > 24
    ) {
      return notification.currentStepErrored(
        'Nickname must be between 3 to 24 characters long',
      );
    }

    if (!walletPubkey)
      return notification.currentStepErrored(
        'You must be connected to edit your nickname',
      );

    if (userProfile.version >= 2) {
      return notification.currentStepErrored(
        'Migration is already done - please refresh the page',
      );
    }

    try {
      if (!walletPubkey)
        return notification.currentStepErrored('Wallet not connected');

      await window.adrena.client.migrateUserProfileFromV1ToV2({
        nickname: trimmedUpdatedNickname,
        notification,
      });

      triggerUserProfileReload();

      // pre-shot the onchain change as we know it's coming
      userProfile.nickname = trimmedUpdatedNickname;
      userProfile.version = 2;

      close();
    } catch (error) {
      console.error('error', error);
    }
  }, [
    close,
    triggerUserProfileReload,
    trimmedUpdatedNickname,
    userProfile,
    walletPubkey,
  ]);

  useEffect(() => {
    if (
      trimmedUpdatedNickname.length < 3 ||
      trimmedUpdatedNickname.length > 24 ||
      !window.adrena.client.readonlyConnection
    ) {
      return;
    }

    const userNicknamePda = window.adrena.client.getUserNicknamePda(
      trimmedUpdatedNickname,
    );

    window.adrena.client.readonlyConnection
      .getAccountInfo(userNicknamePda)
      .then((acc) => {
        setAlreadyTakenNicknames((prev) => ({
          ...prev,
          [trimmedUpdatedNickname]: !!(acc && acc.lamports > 0),
        }));
      })
      .catch(() => {
        //Ignore
      });
  }, [trimmedUpdatedNickname]);

  const [isFaqVisible, setIsFaqVisible] = useState(false);

  return (
    <Modal
      title="Mandatory Profile Migration"
      close={() => {
        close();
      }}
      className="flex flex-col overflow-y-auto w-full"
    >
      <div className="font-semibold text-white/80 pl-4 pr-4 sm:max-w-[30em] self-center text-center pt-6 pb-6 relative">
        Profiles V2 are live! <br /> Pick a unique nickname and migrate your
        existing profile.
        <div className="absolute w-full h-full left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')] -z-10" />
      </div>

      <div className="h-[1px] w-full bg-bcolor mb-4" />

      <div className="self-center text-txtfade">Nickname</div>

      <InputString
        className="font-semibold text-xl relative p-3 border border-bcolor rounded-md text-center mt-2 mb-4 max-w-[25em] ml-auto mr-auto"
        value={updatedNickname ?? ''}
        onChange={setUpdatedNickname}
        placeholder="The Best Trader"
        inputFontSize="1em"
        maxLength={24}
      />

      <div className="h-[2em]">
        {(trimmedUpdatedNickname && trimmedUpdatedNickname.length < 3) ||
        !trimmedUpdatedNickname ? (
          <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-semibold">
            Must be at least 3 characters long
          </div>
        ) : null}

        {trimmedUpdatedNickname &&
        typeof alreadyTakenNicknames[trimmedUpdatedNickname] === 'undefined' &&
        trimmedUpdatedNickname.length > 3 ? (
          <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-semibold">
            Checking nickname availability...
          </div>
        ) : null}

        {trimmedUpdatedNickname &&
        alreadyTakenNicknames[trimmedUpdatedNickname] === true ? (
          <div className="text-red-500 text-xs text-center mb-4 text-yellow-400 font-semibold">
            Nickname already taken
          </div>
        ) : null}

        {trimmedUpdatedNickname &&
        alreadyTakenNicknames[trimmedUpdatedNickname] === false ? (
          <div className="text-red-500 text-xs text-center mb-4 text-green font-semibold">
            Nickname available
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center gap-2 pb-4 pt-4">
        <Button
          title="Migrate"
          variant="primary"
          onClick={() => migrateProfile()}
          className="w-80"
        />
      </div>

      <span
        className="text-xs ml-auto mr-auto cursor-pointer text-txtfade hover:text-white mt-2"
        onClick={() => {
          setIsFaqVisible(!isFaqVisible);
        }}
      >
        {!isFaqVisible ? 'Show more info' : 'Hide info'}
      </span>

      <div className="p-3 w-full flex flex-col items-center">
        {isFaqVisible ? (
          <div className="flex flex-col sm:max-w-[30em] text-center gap-4 pb-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">
                Why do I need to migrate?
              </div>

              <div className="text-sm text-txtfade">
                Profile V2 is the first step toward new features on the profile.
                Among other things, Nicknames are now unique, hence you having
                to migrate. After this migration, you&apos;ll be able to change
                your nickname, but that will cost ADX.
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">
                What if I don&apos;t migrate?
              </div>

              <div className="text-sm text-txtfade">
                Most on-chain actions require Profile V2. Without migrating, you
                won&apos;t be able to interact with the smart contract.
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">
                What does migration cost?
              </div>

              <div className="text-sm text-txtfade">
                Only the transaction fee, nothing more!
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
