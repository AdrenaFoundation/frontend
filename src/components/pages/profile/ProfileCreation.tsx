import { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';

export default function ProfileCreation({
  initUserProfile,
  nickname,
  setNickname,
}: {
  initUserProfile: () => void;
  nickname: string | null;
  setNickname: (v: string | null) => void;
}) {
  const [alreadyTakenNicknames, setAlreadyTakenNicknames] = useState<
    Record<string, boolean>
  >({});
  const [trimmedNickname, setTrimmedNickname] = useState<string>(
    nickname ?? '',
  );

  useEffect(() => {
    setTrimmedNickname((nickname ?? '').trim());
  }, [nickname]);

  useEffect(() => {
    if (
      trimmedNickname.length < 3 ||
      trimmedNickname.length > 24 ||
      !window.adrena.client.readonlyConnection
    ) {
      return;
    }

    const userNicknamePda =
      window.adrena.client.getUserNicknamePda(trimmedNickname);

    window.adrena.client.readonlyConnection
      .getAccountInfo(userNicknamePda)
      .then((acc) => {
        setAlreadyTakenNicknames((prev) => ({
          ...prev,
          [trimmedNickname]: !!(acc && acc.lamports > 0),
        }));
      })
      .catch(() => {
        //Ignore
      });
  }, [trimmedNickname]);

  return (
    <>
      <div className="flex flex-col w-full z-20 p-7 self-center rounded-md items-center">
        <h2>Trader profile</h2>

        <div className="flex flex-col mt-4">
          <h5 className="flex flex-col text-sm mb-3 opacity-50 items-center text-center">
            Your trader profile is required to trade. It tracks your PnL, fees,
            and trading stats, giving you a detailed view of your performance.
            It also serves as your Adrena identity in the ecosystem.
          </h5>

          <div className="w-full h-[1px] bg-bcolor mt-6 mb-6" />

          <h5 className="flex flex-col mb-3 self-center">
            Choose your Nickname!
          </h5>

          <h5 className="flex flex-col mb-3 self-center text-white/50">
            Careful! Once your nickname is set, changing it will cost ADX.
            Choose wisely!
          </h5>

          <div className="flex flex-col items-center pb-4">
            <InputString
              className="font-semibold text-xl relative p-3 border border-bcolor rounded-md text-center mt-2 mb-4 max-w-[25em] ml-auto mr-auto"
              value={nickname ?? ''}
              onChange={setNickname}
              placeholder="The Best Trader"
              inputFontSize="1em"
              maxLength={24}
            />

            <div className="h-[2em]">
              {(trimmedNickname && trimmedNickname.length < 3) ||
              !trimmedNickname ? (
                <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-semibold">
                  Nickname must be at least 3 characters
                </div>
              ) : null}

              {trimmedNickname &&
              typeof alreadyTakenNicknames[trimmedNickname] === 'undefined' &&
              trimmedNickname.length > 3 ? (
                <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-semibold">
                  Checking nickname availability...
                </div>
              ) : null}

              {trimmedNickname &&
              alreadyTakenNicknames[trimmedNickname] === true ? (
                <div className="text-red-500 text-xs text-center mb-4 text-yellow-400 font-semibold">
                  Nickname is already taken
                </div>
              ) : null}

              {trimmedNickname &&
              alreadyTakenNicknames[trimmedNickname] === false ? (
                <div className="text-red-500 text-xs text-center mb-4 text-green font-semibold">
                  Nickname is available
                </div>
              ) : null}
            </div>

            <Button
              disabled={
                nickname
                  ? !(
                      trimmedNickname.length >= 3 &&
                      trimmedNickname.length <= 24
                    )
                  : true
              }
              className="text-sm max-w-[34em] w-full"
              size="lg"
              variant="primary"
              title="Create My Profile"
              onClick={() => initUserProfile()}
            />
          </div>
        </div>
      </div>
    </>
  );
}
