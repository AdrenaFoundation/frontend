import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import VestProgress from '@/components/pages/vest/VestProgress';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import useCountDown from '@/hooks/ux/useCountDown';
import { useDispatch } from '@/store/store';
import { PageProps } from '@/types';
import { getWalletAddress, nativeToUi } from '@/utils';

export default function UserVest({
  userVest: paramUserVest,
  userDelegatedVest,
  triggerUserVestReload,
  wallet,
  connected,
}: PageProps & {
  readonly?: boolean;
}) {
  const dispatch = useDispatch();

  // Vest takes priority over delegate - But tbh, Vest + Delegate is not handled
  const userVest = paramUserVest ? paramUserVest : userDelegatedVest;

  const { days, hours, minutes, seconds } = useCountDown(
    new Date(),
    userVest
      ? new Date(userVest.unlockEndTimestamp.toNumber() * 1000)
      : new Date(),
  );

  const isDelegate =
    userVest &&
    wallet &&
    userVest?.delegate.toBase58() === getWalletAddress(wallet);

  const [updatedDelegate, setUpdatedDelegate] = useState<string | null>(null);
  const [proofedUpdatedDelegate, setProofedUpdatedDelegate] =
    useState<PublicKey | null>(null);
  const [delegateError, setDelegateError] = useState<string | null>(null);

  useEffect(() => {
    if (!userVest) return;

    setUpdatedDelegate(userVest.delegate.toBase58());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!userVest]);

  const claimVest = useCallback(
    async (targetWallet: PublicKey) => {
      if (!userVest || !wallet) return;

      const notification =
        MultiStepNotification.newForRegularTransaction('Claim Vest').fire();

      try {
        await window.adrena.client.claimUserVest({
          notification,
          targetWallet,
          caller: wallet.publicKey,
          owner: userVest.owner,
        });

        if (triggerUserVestReload) triggerUserVestReload();

        dispatch(fetchWalletTokenBalances());
      } catch (error) {
        console.log('error', error);
      }
    },
    [dispatch, triggerUserVestReload, userVest, wallet],
  );

  useEffect(() => {
    const trimmed = updatedDelegate?.trim() ?? '';

    if (trimmed.length) {
      try {
        setProofedUpdatedDelegate(new PublicKey(trimmed));

        if (trimmed === getWalletAddress(wallet)) {
          setDelegateError('Cannot delegate to yourself');
        } else {
          setDelegateError(null);
        }
      } catch {
        setDelegateError('Invalid delegate address');
      }
    } else {
      // Want to remove the delegate
      setProofedUpdatedDelegate(null);
      setDelegateError(null);
    }
  }, [updatedDelegate, wallet]);

  const setDelegate = useCallback(async () => {
    if (delegateError) return;

    const notification =
      MultiStepNotification.newForRegularTransaction(
        'Set Vest Delegate',
      ).fire();

    try {
      await window.adrena.client.setVestDelegate({
        delegate: proofedUpdatedDelegate,
        notification,
      });
    } catch (error) {
      console.log('error', error);
    }
  }, [delegateError, proofedUpdatedDelegate]);

  const [amounts, setAmounts] = useState<{
    amount: number;
    claimedAmount: number;
    claimableAmount: number;
  }>({
    amount: 0,
    claimedAmount: 0,
    claimableAmount: 0,
  });

  // Handle special usecase where user loaded the page with no vest (by loading the page directly in the URL for example)
  useEffect(() => {
    if (userDelegatedVest === false && userVest === false) {
      window.location.href = '/trade';
    }
  }, [userDelegatedVest, userVest]);

  useEffect(() => {
    if (!userVest) return;

    const amount = nativeToUi(
      userVest.amount,
      window.adrena.client.adxToken.decimals,
    );

    const claimedAmount = nativeToUi(
      userVest.claimedAmount,
      window.adrena.client.adxToken.decimals,
    );

    // Calculate how much tokens per seconds are getting accrued for the userVest
    const amountPerSecond =
      amount /
      (userVest.unlockEndTimestamp.toNumber() * 1000 -
        userVest.unlockStartTimestamp.toNumber() * 1000);

    const start = new Date(userVest.unlockStartTimestamp.toNumber() * 1000);

    const interval = setInterval(() => {
      if (!userVest) return;
      if (start > new Date()) return;

      // Calculate how many seconds has passed since the last claim
      const nbSecondsSinceLastClaim =
        Date.now() -
        (userVest.lastClaimTimestamp.toNumber() === 0
          ? userVest.unlockStartTimestamp.toNumber()
          : userVest.lastClaimTimestamp.toNumber()) *
          1000;

      const claimableAmount = nbSecondsSinceLastClaim * amountPerSecond;

      setAmounts({
        amount,
        claimedAmount,
        claimableAmount,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userVest]);

  if (!userVest) {
    return (
      <div className="flex flex-col max-w-[65em] gap-4 p-4 w-full h-full self-center">
        <div className="flex h-full bg-main w-full border items-center justify-center rounded-md z-10">
          <WalletConnection connected={connected} />
        </div>
      </div>
    );
  }

  const hasVestStarted =
    new Date(userVest.unlockStartTimestamp.toNumber() * 1000) <= new Date();

  return (
    <>
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-100 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

      <div className="flex flex-col max-w-[60em] pl-4 pr-4 pb-4 w-full self-center bg-main z-10 rounded-md mt-4 mb-[100px] sm:mb-4 relative ">
        <OnchainAccountInfo
          address={userVest.pubkey}
          shorten={true}
          className="self-center mt-4 sm:mt-0 sm:absolute sm:top-4 sm:left-4 opacity-50 text-sm z-10"
        />

        {hasVestStarted ? (
          <>
            <div className="flex flex-col items-center justify-center relative ">
              {isDelegate ? null : (
                <Button
                  title="Claim"
                  className="mt-6 sm:mt-0 max-w-[15em] w-[15em] sm:w-[12em] self-center sm:absolute sm:top-6 sm:right-6"
                  size="lg"
                  disabled={amounts.claimableAmount === 0}
                  onClick={() => claimVest(userVest.owner)}
                />
              )}

              <div className="flex w-full flex-col items-center justify-center">
                <div className="text-txtfade pt-8 uppercase font-thin">
                  completed in
                </div>

                <ul className="flex flex-row gap-3 md:gap-9 px-6 md:px-9 p-3 z-10 h-[6em] items-center w-full justify-center bg-third rounded-md mt-4">
                  <li className="flex flex-col items-center justify-center">
                    <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                      {days}
                    </p>
                    <p className="text-center text-sm font-semibold tracking-widest">
                      Days
                    </p>
                  </li>

                  <li className="h-[50%] w-[1px] bg-[#ffffff10] rounded-full" />

                  <li className="flex flex-col items-center justify-center">
                    <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                      {hours}
                    </p>
                    <p className="text-center text-sm font-semibold tracking-widest">
                      Hours
                    </p>
                  </li>

                  <li className="h-[50%] w-[1px] bg-[#ffffff10] rounded-full" />

                  <li className="flex flex-col items-center justify-center">
                    <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                      {minutes}
                    </p>
                    <p className="text-center text-sm font-semibold tracking-widest">
                      Minutes
                    </p>
                  </li>

                  <li className="h-[50%] w-[1px] bg-[#ffffff10] rounded-full" />

                  <li className="flex flex-col items-center justify-center">
                    <p className="text-center text-[1rem] md:text-[2rem] font-mono leading-[30px] md:leading-[46px]">
                      {seconds}
                    </p>
                    <p className="text-center text-sm font-semibold tracking-widest">
                      seconds
                    </p>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 mt-8 pb-8">
                <div className="flex gap-2">
                  <div className="text-sm font-semibold text-txtfade">
                    {new Date(
                      userVest.unlockStartTimestamp.toNumber() * 1000,
                    ).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-semibold text-txtfade">-</div>
                  <div className="text-sm font-semibold text-txtfade">
                    {new Date(
                      userVest.unlockEndTimestamp.toNumber() * 1000,
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-txtfade text-xs font-semibold opacity-60">
                  vest period
                </div>
              </div>

              {isDelegate ? (
                <>
                  <div className="h-[1px] w-full bg-bcolor mb-6" />

                  <div className="flex gap-4 pb-8 flex-col items-center justify-center">
                    <div className="text-sm text-txtfade font-semibold">
                      As delegate of this vest you can
                    </div>

                    <div className="flex gap-4 flex-col sm:flex-row">
                      <Button
                        title="Claim to your wallet"
                        className="max-w-[20em] w-[20em] sm:w-[20em] self-center"
                        size="lg"
                        disabled={amounts.claimableAmount === 0}
                        onClick={() => claimVest(userVest.delegate)}
                      />

                      <Button
                        title="Claim to original wallet"
                        className="max-w-[20em] w-[20em] sm:w-[20em] self-center"
                        size="lg"
                        disabled={amounts.claimableAmount === 0}
                        onClick={() => claimVest(userVest.owner)}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="h-[1px] w-full bg-bcolor" />

            <div className="flex flex-col">
              <div className="flex-wrap flex-row w-full flex gap-6 p-4">
                <NumberDisplay
                  title="Vested"
                  nb={amounts.amount}
                  format="number"
                  suffix="ADX"
                  precision={2}
                  className="border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]"
                  headerClassName="pb-2"
                  titleClassName="text-[0.7em] sm:text-[0.7em]"
                  isDecimalDimmed={false}
                />

                <NumberDisplay
                  title="Claimed"
                  nb={amounts.claimedAmount}
                  format="number"
                  suffix="ADX"
                  precision={2}
                  className="border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]"
                  headerClassName="pb-2"
                  titleClassName="text-[0.7em] sm:text-[0.7em]"
                  isDecimalDimmed={false}
                />

                <NumberDisplay
                  title="Claimable"
                  nb={amounts.claimableAmount}
                  format="number"
                  suffix="ADX"
                  precision={2}
                  className="border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]"
                  headerClassName="pb-2"
                  titleClassName="text-[0.7em] sm:text-[0.7em]"
                  isDecimalDimmed={false}
                />
              </div>

              <div className="flex w-full mt-4 mb-4">
                <VestProgress {...amounts} />
              </div>

              {!isDelegate ? (
                <>
                  <div className="h-[1px] w-full bg-bcolor" />

                  <div className="flex flex-col gap-2 w-full p-5 max-w-[40em] items-center justify-center self-center">
                    <div className="mb-4 gap-2 flex flex-col bg-[#223664] border p-4">
                      <div className="text-sm font-semibold text-center">
                        A delegate wallet lets you assign another wallet to
                        claim your vested ADX tokens on your behalf. This is
                        useful if you want to use a different wallet than the
                        original one to manage your claims. However, a delegate
                        wallet cannot change the delegation to another wallet.
                        It can only claim tokens either to the original wallet
                        or to itself.
                      </div>
                    </div>

                    <div className="w-full relative">
                      <InputString
                        className="pt-2 pb-2 rounded-md text-center pr-[2.8em] pl-4 sm:pl-[2.8em]"
                        value={updatedDelegate ?? ''}
                        onChange={setUpdatedDelegate}
                        placeholder="Delegate Address"
                        inputFontSize="1em"
                      />

                      <div
                        className="absolute top-3 right-4 text-sm opacity-60 hover:opacity-100 cursor-pointer"
                        onClick={() => {
                          setUpdatedDelegate('');
                        }}
                      >
                        reset
                      </div>
                    </div>

                    <div className="min-h-[1.5em] flex items-center justify-center">
                      {delegateError ? (
                        <div className="text-orange text-sm">
                          {delegateError}
                        </div>
                      ) : proofedUpdatedDelegate ? (
                        <div className="text-sm flex gap-1 font-semibold text-txtfade">
                          check{' '}
                          <OnchainAccountInfo
                            address={proofedUpdatedDelegate}
                            shorten={true}
                          />
                        </div>
                      ) : null}
                    </div>

                    <Button
                      title="Set Delegate"
                      className="w-full h-8"
                      size="lg"
                      onClick={() => setDelegate()}
                      disabled={delegateError !== null}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <div className="p-8 flex items-center justify-center">
            Vest starting{' '}
            {new Date(
              userVest.unlockStartTimestamp.toNumber() * 1000,
            ).toLocaleDateString()}
          </div>
        )}
      </div>
    </>
  );
}
