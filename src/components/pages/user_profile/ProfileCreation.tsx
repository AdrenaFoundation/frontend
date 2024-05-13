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
  return (
    <>
      <div className="flex flex-col items-center justify-center z-20 border bg-bcolor/85 backdrop-blur-md p-7 m-4 w-[25em] self-center rounded-lg">
        <div className="font-special text-3xl text-center">
          Create my profile
        </div>

        <span className="mt-6 max-w-[28em] flex text-center opacity-75 italic text-lg">
          Profile&apos;s optional – no need for trading, swapping, or staking.
          Handy for tracking your stats: average leverage, PnL, fees, and more.
        </span>

        <div className="w-2/3 h-[1px] bg-bcolor mt-8"></div>

        <div className="flex flex-col items-center justify-center">
          <div className="font-special text-xl mt-10 ">My Nickname</div>

          <InputString
            value={nickname ?? ''}
            onChange={setNickname}
            placeholder="The Great Trader"
            className="mt-4 text-center w-[20em] p-4 bg-third border rounded-xl"
            inputFontSize="1.1em"
            maxLength={24}
          />
        </div>

        <Button
          disabled={
            nickname ? !(nickname.length >= 3 && nickname.length <= 24) : true
          }
          className="mt-4 text-sm w-full"
          size="lg"
          title="Create"
          onClick={() => initUserProfile()}
        />
      </div>
    </>
  );
}
