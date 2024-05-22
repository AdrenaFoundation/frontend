import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';

import InfoAnnotation from '../monitoring/InfoAnnotation';

export default function ProfileCreation({
  initUserProfile,
  nickname,
  setNickname,
}: {
  initUserProfile: () => void;
  nickname: string | null;
  setNickname: (v: string | null) => void;
}) {
  return (
    <>
      <div className="flex flex-col w-full z-20 border bg-bcolor/85 backdrop-blur-md p-7 self-center rounded-lg">
        <div className="flex">
          <h2>Create my profile (optional)</h2>
          <InfoAnnotation
            text="Profile's optional – no need for trading, swapping, or staking.
          Handy for tracking your stats: average leverage, PnL, fees, and more."
            className="mr-1"
          />
        </div>

        <div className="flex flex-col mt-4">
          <h5 className="flex flex-col text-fade mb-3">Nickname</h5>
          <div className="flex">
            <InputString
              value={nickname ?? ''}
              onChange={setNickname}
              placeholder="The Great Trader"
              className="text-center w-[80%] bg-inputcolor border rounded-xl"
              inputFontSize="1em"
              maxLength={24}
            />

            <Button
              disabled={
                nickname
                  ? !(nickname.length >= 3 && nickname.length <= 24)
                  : true
              }
              className="text-sm w-[20%] ml-4"
              size="lg"
              variant="primary"
              title="Create"
              onClick={() => initUserProfile()}
            />
          </div>
        </div>
      </div>
    </>
  );
}
