import { BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Congrats } from '@/components/Congrats/Congrats';
import ProgressBar from '@/components/Genesis/ProgressBar';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import GenesisEndView from '@/components/pages/genesis/GenesisEndView';
import TradingInput from '@/components/pages/trading/TradingInput/TradingInput';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import Settings from '@/components/Settings/Settings';
import WalletAdapter from '@/components/WalletAdapter/WalletAdapter';
import { GENESIS_REWARD_ADX_PER_USDC } from '@/constant';
import useCountDown from '@/hooks/useCountDown';
import { useDebounce } from '@/hooks/useDebounce';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { GenesisLock, PageProps, SolanaExplorerOptions, WalletAdapterExtended } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi, uiToNative } from '@/utils';

import adrenaMonsters from '../../../public/images/adrena-monsters.png';
import alpIcon from '../../../public/images/alp.svg';
import capsuleMonster from '../../../public/images/capsule.png';
import timerBg from '../../../public/images/genesis-timer-bg.png';
import errorImg from '../../../public/images/Icons/error.svg';
import lockIcon from '../../../public/images/Icons/lock.svg';
import logo from '../../../public/images/logo.png';
import xIcon from '../../../public/images/x-black-bg.png';

export default function Genesis({
  connected,
  userProfile,
  triggerWalletTokenBalancesReload,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  preferredSolanaExplorer,
  adapters,
}: PageProps & {
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  preferredSolanaExplorer: SolanaExplorerOptions;
  adapters: WalletAdapterExtended[];
}) {
  const { wallet } = useSelector((s) => s.walletState);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const usdc = window.adrena.client?.tokens.find((t) => t.symbol === 'USDC');
  const walletTokenABalance = walletTokenBalances?.['USDC'];
  const [fundsAmount, setFundsAmount] = useState<number | null>(null);
  const [feeAndAmount, setFeeAndAmount] = useState<{
    amount: number;
    fee: number;
  } | null>(null);
  const [genesis, setGenesis] = useState<GenesisLock | null>(null);
  const [currentStep, setCurrentStep] = useState(2);
  const fundsAmountDebounced = useDebounce(fundsAmount, 500);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenesisLoading, setIsGenesisLoading] = useState(true);
  const [hasReservedCampaignEnded, setHasReservedCampaignEnded] =
    useState(false);
  const [hasCampaignEnded, setHasCampaignEnded] = useState(false);
  const [totalStakedAmount, setTotalStakedAmount] = useState<number | null>(
    null,
  );
  const from = new Date();

  const campaignEndDate = genesis
    ? new Date(
      genesis.campaignStartDate.toNumber() * 1000 +
      genesis.campaignDuration.toNumber() * 1000,
    )
    : new Date();

  const { days, hours, minutes, seconds } = useCountDown(from, campaignEndDate);
  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  useEffect(() => {
    getAlpAmount();
  }, [fundsAmountDebounced]);

  useEffect(() => {
    getGenesis();

    setTimeout(() => {
      setIsGenesisLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getGenesis();
    }, 2000);

    return () => clearInterval(interval);
  }, [connected, isSuccess]);

  useEffect(() => {
    const isRebalancing = process.env.NEXT_PUBLIC_IS_REBALANCING === 'true';

    if (isRebalancing) return setCurrentStep(3);
    if (hasReservedCampaignEnded && hasCampaignEnded) return setCurrentStep(2);
    if (hasReservedCampaignEnded) return setCurrentStep(1);

    setCurrentStep(0);
  }, [hasCampaignEnded, hasReservedCampaignEnded]);

  useEffect(() => {
    getTotalLockedStake();
  }, [stakingAccounts, connected]);

  const getTotalLockedStake = () => {
    if (!stakingAccounts || !stakingAccounts['ALP'] || !connected) {
      setTotalStakedAmount(null);
      return;
    }

    const total = stakingAccounts['ALP'].lockedStakes.reduce(
      (acc, stake) =>
        acc + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals),
      0,
    );

    setTotalStakedAmount(total);
  };

  const getGenesis = async () => {
    try {
      const genesis = await window.adrena.client.getGenesisLock();

      if (!genesis) {
        return;
      }

      const campaignEndDate = new Date(
        genesis.campaignStartDate.toNumber() * 1000 +
        genesis.campaignDuration.toNumber() * 1000,
      );

      const resrevedCampaignEndDate = new Date(
        genesis.campaignStartDate.toNumber() * 1000 +
        genesis.reservedGrantDuration.toNumber() * 1000,
      );

      setHasCampaignEnded(new Date() >= campaignEndDate);
      setHasReservedCampaignEnded(new Date() >= resrevedCampaignEndDate);
      setGenesis(genesis as GenesisLock);
    } catch (error) {
      console.log('error fetching genesis', error);
    }
  };

  const getAlpAmount = async () => {
    if (!fundsAmount || !usdc) {
      setFeeAndAmount(null);
      setIsLoading(false);
      return;
    }

    const price = tokenPrices[usdc?.symbol];

    if (!wallet) return;

    try {
      const alp = await window.adrena.client.getAddLiquidityAmountAndFee({
        amountIn: uiToNative(fundsAmount, usdc.decimals),
        token: usdc,
      });

      if (!alp || !price) {
        setFeeAndAmount(null);
        setIsLoading(false);
        return;
      }

      setFeeAndAmount({
        amount: nativeToUi(alp.amount, window.adrena.client.alpToken.decimals),
        fee: price * nativeToUi(alp.fee, usdc.decimals),
      });
      setIsLoading(false);
    } catch (error) {
      console.log('error', error);
      setErrorMsg('Error fetching ALP amount');
      setIsLoading(false);
      setFeeAndAmount(null);
    }
  };

  const addGenesisLiquidity = async () => {
    if (!fundsAmount || !usdc || !wallet) {
      return;
    }

    const userStaking = await window.adrena.client.getUserStakingAccount({
      owner: new PublicKey(wallet.walletAddress),
      stakedTokenMint: window.adrena.client.alpToken.mint,
    });

    if (!userStaking) {
      const notification =
        MultiStepNotification.newForRegularTransaction('Stake ALP 1/2').fire();

      try {
        await window.adrena.client.initUserStaking({
          owner: new PublicKey(wallet.walletAddress),
          stakedTokenMint: window.adrena.client.alpToken.mint,
          threadId: new BN(Date.now()),
          notification,
        });
      } catch (error) {
        console.error('error', error);
        return;
      }
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      !userStaking ? `Stake ALP (2/2)` : `Stake ALP`,
    ).fire();

    try {
      if (!wallet) return;

      await window.adrena.client.addGenesisLiquidity({
        amountIn: fundsAmount,

        // TODO: Apply proper slippage
        minLpAmountOut: new BN(0),
        notification,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setFundsAmount(null);
      setIsSuccess(true);
      return;
    } catch (error) {
      console.log('error', error);
      setErrorMsg('Error buying ALP');
      return;
    }
  };

  const reservedGrantOwners = genesis?.reservedGrantOwners.map((key, i) => {
    return {
      walletAddress: key.toString(),
      maxAmount: genesis.reservedGrantAmounts[i],
    };
  });

  const isReserved =
    wallet?.walletAddress &&
    reservedGrantOwners?.find(
      (owner) => owner.walletAddress === wallet.walletAddress,
    );

  let twitterText;

  if (totalStakedAmount) {
    twitterText = `I just bought ${formatNumber(
      totalStakedAmount,
      2,
    )} ALP locked and staked for 180 days! @adrenaprotocol`;
  }

  const url = 'https://app.adrena.xyz/genesis';

  const MAX_USDC_AMOUNT = 250_000;

  const maxAmount = walletTokenABalance
    ? walletTokenABalance >= MAX_USDC_AMOUNT
      ? MAX_USDC_AMOUNT
      : walletTokenABalance
    : null;

  const reservedGrantOwnerLeftAmount = reservedGrantOwners?.find(
    (owner) => owner.walletAddress === wallet?.walletAddress,
  )?.maxAmount;

  const OGIMage =
    'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/adrena_genesis_og-tXy102rrl9HR0SfCsj0d4LywnaXTJM.jpg';

  if (isGenesisLoading || !genesis) {
    return (
      <div className="m-auto">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Genesis Lock</title>
        <meta
          name="description"
          content="Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool"
        />
        <meta property="og:title" content="Adrena Genesis Liquidity Program" />
        <meta
          property="og:description"
          content="Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool"
        />
        <meta property="og:image" content={OGIMage} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Adrena" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@AdrenaProtocol" />
        <meta name="twitter:title" content="Adrena Genesis Liquidity Program" />
        <meta
          name="twitter:description"
          content="Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool"
        />
        <meta name="twitter:image" content={OGIMage} />
        <meta name="twitter:url" content={url} />
      </Head>

      <ProgressBar currentStep={currentStep} genesis={genesis} />

      <div className="relative p-4 m-auto max-w-[1150px]">
        <Image
          src={capsuleMonster}
          alt="Monster Capsule"
          className="fixed top-0 object-contain left-[-250px] h-full w-[650px] opacity-10"
        />

        <Image
          src={capsuleMonster}
          alt="Monster Capsule"
          className="fixed top-0 object-contain right-[-250px] h-full w-[650px] opacity-10 -scale-x-[1]"
        />

        <div className="flex items-center justify-center relative">
          <p className="absolute font-mono translate-y-[7px] z-10">
            {!hasCampaignEnded
              ? `${days}d ${hours}h ${minutes}m ${seconds}s left`
              : 'Campaign has ended'}
          </p>
          <Image
            src={timerBg}
            alt="background graphic"
            className="w-[300px] translate-y-1"
          />
        </div>
        <div className="relative items-center border rounded-lg w-full p-2 shadow-2xl bg-[#050D14]">
          <div className="flex flex-col md:flex-row gap-2 m-auto z-20">
            <div className="sm:hidden h-full bg-gradient-to-tr from-[#07111A] to-[#0B1722] rounded-lg p-5 shadow-lg border border-bcolor">
              <Image src={logo} alt="Adrena logo" width={60} />
              <div className="flex flex-row gap-3 mb-3">
                <h1 className="text-[24px]">Genesis Lock</h1>
                <Image
                  src={alpIcon}
                  alt="ALP logo"
                  className="opacity-10 w-[30px]"
                />
              </div>

              <ul className="mb-4 ml-4">
                <li className="text-sm font-mono opacity-75 list-disc mb-3">
                  Deposits will open for everyone (both reserved and public) at
                  1200 UTC Sep 17th
                </li>
                <li className="text-sm font-mono opacity-75 list-disc mb-3">
                  After 24 hours any amount that is not claimed from the
                  reserved allocation will move into the public allocation
                </li>
                <li className="text-sm font-mono opacity-75 list-disc">
                  The total amount for Genesis Liquidity will be capped at $10M
                </li>
                <li className="text-sm font-mono opacity-75 list-disc">
                  Individual transactions are capped at $250k per wallet to
                  promote distribution
                </li>
                <li className="text-sm font-mono opacity-75 list-disc">
                  Depositors receive ALP tokens that are automatically locked
                  for 180D. You will be able to track your position at &apos;My
                  Dashboard&apos; once the app goes live
                </li>
                <li className="text-sm font-mono opacity-75 list-disc">
                  $ADX rewards for locked ALP will start once trading is live.
                  Rewards accrue every 6 hours and can be claimed
                </li>
                <li className="text-sm font-mono opacity-75 list-disc">
                  Be sure to re-stake your $ADX for additional yield and
                  additional $ADX rewards!
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 order-2 md:order-1">
              <div className="hidden sm:block h-full bg-gradient-to-tr from-[#07111A] to-[#0B1722] rounded-lg p-5 shadow-lg border border-bcolor">
                <Image src={logo} alt="Adrena logo" width={60} />
                <div className="flex flex-row gap-3 mb-3">
                  <h1 className="text-[24px]">Genesis Lock</h1>
                  <Image
                    src={alpIcon}
                    alt="ALP logo"
                    className="opacity-10 w-[30px]"
                  />
                </div>

                <ul className="mb-4 ml-4">
                  <li className="text-sm font-mono opacity-75 list-disc mb-3">
                    Deposits will open for everyone (both reserved and public)
                    at 1200 UTC Sep 17th
                  </li>
                  <li className="text-sm font-mono opacity-75 list-disc mb-3">
                    After 24 hours any amount that is not claimed from the
                    reserved allocation will move into the public allocation
                  </li>
                  <li className="text-sm font-mono opacity-75 list-disc mb-3">
                    The total amount for Genesis Liquidity will be capped at
                    $10M
                  </li>
                  <li className="text-sm font-mono opacity-75 list-disc mb-3">
                    Individual transactions are capped at $250k per wallet to
                    promote distribution
                  </li>
                  <li className="text-sm font-mono opacity-75 list-disc mb-3">
                    Depositors receive ALP tokens that are automatically locked
                    for 180D. You will be able to track your position at
                    &apos;My Dashboard&apos; once the app goes live
                  </li>
                  <li className="text-sm font-mono opacity-75 list-disc mb-3">
                    $ADX rewards for locked ALP will start once trading is live.
                    Rewards accrue every 6 hours and can be claimed
                  </li>
                  <li className="text-sm font-mono opacity-75 list-disc">
                    Be sure to re-stake your $ADX for additional yield and
                    additional $ADX rewards!
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6 justify-between flex-none min-h-[170px] bg-gradient-to-tr from-[#07111A] to-[#0B1722] rounded-lg p-5 shadow-lg border border-bcolor">
                <h2>Liquidity pool</h2>
                {genesis?.publicAmountClaimed &&
                  genesis?.publicAmount &&
                  usdc?.decimals ? (
                  <div className="flex flex-row items-center">
                    <div className="w-full mt-auto">
                      <p className="opacity-50 text-sm sm:text-base mb-1">
                        Public liquidity
                      </p>
                      <p className="text-base sm:text-lg font-mono">
                        {usdc.decimals &&
                          formatPriceInfo(
                            nativeToUi(
                              genesis.publicAmountClaimed,
                              usdc?.decimals,
                            ),
                          )}{' '}
                        <span className="text-base sm:text-lg font-mono opacity-50">
                          /{' '}
                          {formatPriceInfo(
                            nativeToUi(genesis.publicAmount, usdc.decimals),
                          )}
                        </span>
                      </p>

                      <div className="flex-start flex h-3 w-full overflow-hidden rounded-full rounded-l-none bg-bcolor mt-3 p-1 pl-0 scale-[-1]">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{
                            width: `${(nativeToUi(
                              genesis.publicAmountClaimed,
                              usdc.decimals,
                            ) /
                              nativeToUi(
                                genesis.publicAmount,
                                usdc.decimals,
                              )) *
                              100
                              }%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="flex items-center justify-center h-1 overflow-hidden break-all bg-gradient-to-r from-[#1F2A8A] to-[#5B6AE8] rounded-full"
                        ></motion.div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center bg-bcolor h-[60px] w-[4px] z-1 mt-auto">
                      <div className="absolute top-0 w-2 h-2 rounded-full bg-bcolor" />
                    </div>

                    <div className="w-full mt-auto">
                      <p className="opacity-50 text-right text-sm sm:text-base mb-1">
                        Reserved liquidity
                      </p>
                      {genesis?.reservedAmount &&
                        genesis?.reservedAmountClaimed &&
                        usdc?.decimals && (
                          <p className="text-base sm:text-lg font-mono text-right">
                            {usdc.decimals &&
                              formatPriceInfo(
                                nativeToUi(
                                  genesis?.reservedAmountClaimed,
                                  usdc?.decimals,
                                ),
                              )}{' '}
                            {/* <span className="text-base sm:text-lg font-mono opacity-50">
                              /{' '}
                              {formatPriceInfo(
                                nativeToUi(
                                  genesis.reservedAmount,
                                  usdc.decimals,
                                ),
                              )}
                            </span> */}
                          </p>
                        )}

                      {isReserved && reservedGrantOwnerLeftAmount && (
                        <p className="hidden sm:block opacity-50 text-right font-mono">
                          Reserved amount left:{' '}
                          <FormatNumber
                            nb={nativeToUi(
                              reservedGrantOwnerLeftAmount,
                              usdc.decimals,
                            )}
                            suffix="USDC"
                            className="inline-block"
                          />
                        </p>
                      )}
                      {genesis?.reservedAmountClaimed &&
                        genesis?.reservedAmount &&
                        usdc && (
                          <div className="flex-start flex h-3 w-full overflow-hidden rounded-full rounded-l-none bg-bcolor mt-3 p-1 pl-0">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{
                                width: `${(nativeToUi(
                                  genesis.reservedAmountClaimed,
                                  usdc.decimals,
                                ) /
                                  nativeToUi(
                                    genesis.reservedAmount,
                                    usdc.decimals,
                                  )) *
                                  100
                                  }%`,
                              }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                              className="flex items-center justify-center h-1 overflow-hidden break-all bg-gradient-to-r from-[#6D1324] to-[#A33D50] rounded-full"
                            ></motion.div>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <p className="font-mono animate-pulse">Loading</p>
                )}
                {isReserved && usdc && reservedGrantOwnerLeftAmount && (
                  <p className="sm:hidden opacity-50 text-center font-mono">
                    Reserved amount left:{' '}
                    <FormatNumber
                      nb={nativeToUi(
                        reservedGrantOwnerLeftAmount,
                        usdc.decimals,
                      )}
                      className="inline-block"
                    />
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 h-full flex-none order-1 md:order-2 ">
              <div
                className={twMerge(
                  'bg-gradient-to-tr from-[#07111A] to-[#0B1722] w-full md:w-[400px] rounded-lg p-5 shadow-lg border border-bcolor',
                  currentStep >= 2 && 'from-secondary to-secondary',
                )}
              >
                <div className="flex flex-row gap-1 justify-end items-center">
                  <RefreshButton />
                  <Settings
                    activeRpc={activeRpc}
                    rpcInfos={rpcInfos}
                    autoRpcMode={autoRpcMode}
                    customRpcUrl={customRpcUrl}
                    customRpcLatency={customRpcLatency}
                    favoriteRpc={favoriteRpc}
                    setAutoRpcMode={setAutoRpcMode}
                    setCustomRpcUrl={setCustomRpcUrl}
                    setFavoriteRpc={setFavoriteRpc}
                    preferredSolanaExplorer={preferredSolanaExplorer}
                    isIcon
                    isGenesis
                  />
                  <WalletAdapter userProfile={userProfile} adapters={adapters} />
                </div>

                {hasCampaignEnded ? (
                  <GenesisEndView connected={connected} />
                ) : (
                  <>
                    <div className="w-full">
                      <p className="opacity-50 text-sm mb-3">Pay</p>
                      {usdc && (
                        <TradingInput
                          className="text-sm rounded-full"
                          inputClassName={'bg-inputcolor'}
                          tokenListClassName={twMerge(
                            'rounded-tr-lg rounded-br-lg border-l border-l-inputcolor bg-inputcolor',
                          )}
                          menuClassName="shadow-none justify-end mr-2"
                          menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
                          value={fundsAmount}
                          selectedToken={usdc}
                          tokenList={[usdc]}
                          onChange={(e) => {
                            if (e !== null && e >= MAX_USDC_AMOUNT) {
                              setFundsAmount(MAX_USDC_AMOUNT);
                              return;
                            }
                            setIsLoading(true);
                            setErrorMsg(null);
                            setFundsAmount(e);
                          }}
                        />
                      )}

                      <span className="flex flex-row justify-end items-center gap-1 mt-3 w-full text-right">
                        <p className="opacity-50 inline">Wallet · </p>
                        <FormatNumber nb={walletTokenABalance} suffix=" USDC" />
                      </span>
                    </div>

                    <div
                      className={twMerge(
                        'w-full transition-opacity duration-300',
                      )}
                    >
                      <p className="opacity-50 text-sm mb-3">Receive</p>
                      <StyledSubContainer className="bg-transparent">
                        <div>
                          <div className="relative flex flex-row gap-2 items-center transition-opacity duration-300">
                            <Image
                              src={window.adrena.client.alpToken.image}
                              width={16}
                              height={16}
                              alt="ALP logo"
                            />
                            <FormatNumber
                              nb={feeAndAmount?.amount}
                              suffix="ALP"
                              placeholder="0.00 ALP"
                              placeholderClassName="opacity-50"
                              className="text-lg"
                              isLoading={isLoading}
                            />
                          </div>
                          <div className="flex flex-row gap-1 items-center mt-3">
                            <Image
                              src={lockIcon}
                              width={12}
                              height={12}
                              alt="ALP logo"
                              className="opacity-50"
                            />
                            <p>Immediately staked and locked for 180 days</p>
                          </div>
                        </div>
                      </StyledSubContainer>
                    </div>

                    <Button
                      size="lg"
                      title="Provide Liquidity"
                      className="w-full mt-3 py-3"
                      disabled={
                        !connected ||
                        !usdc ||
                        isLoading ||
                        !fundsAmount ||
                        !feeAndAmount?.amount
                      }
                      onClick={() => addGenesisLiquidity()}
                    />

                    {errorMsg !== null ? (
                      <AnimatePresence>
                        <motion.div
                          className="flex w-full h-auto relative overflow-hidden pl-6 pt-2 pb-2 pr-2 my-4 border-2 border-[#BE3131] backdrop-blur-md z-40 items-center justify-center rounded-xl"
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          transition={{ duration: 0.5 }}
                          style={{ originY: 0 }}
                        >
                          <Image
                            className="absolute left-[0.5em]"
                            src={errorImg}
                            width={16}
                            alt="Error icon"
                          />

                          <div className="items-center justify-center">
                            <div className="text-sm">{errorMsg}</div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : null}

                    <div className="w-full mt-6">
                      <p className="opacity-50 text-sm mb-3">Rewards</p>
                      <ul className="flex gap-1 sm:gap-3 items-center flex-wrap justify-evenly p-1 py-2 sm:p-3 rounded-lg border border-bcolor">
                        <li className="flex flex-col items-center">
                          <p className="text-sm">USDC Yield</p>
                          <p className="font-medium font-mono text-sm sm:text-lg">
                            1.5x
                          </p>
                        </li>

                        <li className="h-[40px] w-[1px] bg-bcolor" />

                        <li className="flex flex-col items-center">
                          <p className="text-sm">ADX rewards</p>
                          <p className="font-medium font-mono text-sm sm:text-lg">
                            1.75x
                          </p>
                        </li>

                        <li className="h-[40px] w-[1px] bg-bcolor" />

                        <li className="flex flex-col items-center">
                          <p className="text-sm">Bonus ADX</p>

                          <FormatNumber
                            nb={
                              fundsAmount
                                ? fundsAmount * GENESIS_REWARD_ADX_PER_USDC
                                : null
                            }
                            className="font-medium font-mono text-sm sm:text-lg"
                            suffix="ADX"
                          />
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-row justify-between items-center bg-gradient-to-tr from-[#07111A] to-[#0B1722] w-full h-[53px] md:w-[400px] rounded-lg p-2 px-5 shadow-lg border border-bcolor">
                <p className="font-mono opacity-50">My Total Locked ALP </p>
                <FormatNumber
                  nb={totalStakedAmount}
                  precision={4}
                  suffix="ALP"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <Modal close={() => setIsSuccess(false)}>
            <div className="relative p-10">
              <div className="absolute top-0 w-[300px] left-[150px]">
                <Congrats />
              </div>
              <div className="relative">
                <Image
                  src={adrenaMonsters}
                  alt="Adrena monsters"
                  className="w-full max-w-[400px] m-auto"
                />
                <div className="absolute bottom-0 h-[120px] w-full bg-gradient-to-b from-secondary/0 to-secondary" />
              </div>

              <h1 className="text-center mt-6">Welcome to Adrena!</h1>
              <p className="text-center mt-1 text-base max-w-[400px] font-mono font-semibold">
                <span className="font-mono font-light text-base opacity-50">
                  You have bought{' '}
                </span>{' '}
                <FormatNumber
                  nb={totalStakedAmount}
                  precision={4}
                  suffix="ALP"
                  isDecimalDimmed={false}
                />
                ,{' '}
                <span className="font-mono font-light text-base opacity-50">
                  they have been locked and staked for
                </span>{' '}
                180 days!
              </p>
              <Button
                size="lg"
                title="Share on"
                className="w-full mt-6 py-3 text-base"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  twitterText
                    ? twitterText
                    : 'Just bought ALP on Adrena! @adrenaprotocol',
                )}&url=${encodeURIComponent(url)}`}
                isOpenLinkInNewTab
                rightIcon={xIcon}
                rightIconClassName="w-4 h-4"
                onClick={() => setIsSuccess(false)}
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
