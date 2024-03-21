import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import ALPInfo from '@/components/pages/buy_alp_adx/ALPInfo/ALPInfo';
import ALPSwap from '@/components/pages/buy_alp_adx/ALPSwap/ALPSwap';
import SaveOnFees from '@/components/pages/buy_alp_adx/SaveOnFees/SaveOnFees';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PageProps, Token } from '@/types';
import { nativeToUi, uiToNative } from '@/utils';

import externalLinkIcon from '../../../public/images/external-link-logo.png';
import orcaImg from '../../../public/images/orca.png';

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

type feesAndAmountsType = {
  [tokenSymbol: string]: {
    fees: number | null;
    amount: number | null;
    equivalentAmount: number | null;
  };
};

export default function Buy({
  triggerWalletTokenBalancesReload,
  custodies,
}: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [collateralInput, setCollateralInput] = useState<number | null>(null);
  const [collateralToken, setCollateralToken] = useState<Token | null>(null);
  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [allowedCollateralTokens, setAllowedCollateralTokens] = useState<
    Token[] | null
  >(null);
  const [feesUsd, setFeesUsd] = useState<number | null>(null);
  const [feesAndAmounts, setFeesAndAmounts] =
    useState<feesAndAmountsType | null>(null);
  const [isFeesLoading, setIsFeesLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');
  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [collateralPrice, setCollateralPrice] = useState<number | null>(null);
  const debouncedInputs = useDebounce(
    selectedAction === 'buy' ? collateralInput : alpInput,
    1000,
  );

  const getFeesAndAmounts = useCallback(async () => {
    const localLoadingCounter = ++loadingCounter;

    const data = await Promise.all(
      window.adrena.client.tokens.map(async (token) => {
        const price = tokenPrices[token.symbol];

        if (!price || !collateralToken || !alpInput || !collateralInput) {
          return {
            tokenSymbol: token.symbol,
            fees: null,
            amount: null,
            equivalentAmount: null,
          };
        }

        const input = selectedAction === 'buy' ? collateralInput : alpInput;

        const collateralTokenPrice = tokenPrices[collateralToken.symbol];

        if (collateralTokenPrice === null) {
          return {
            tokenSymbol: token.symbol,
            fees: null,
            amount: null,
            equivalentAmount: null,
          };
        }

        const equivalentAmount = (collateralTokenPrice * input) / price;

        if (equivalentAmount === 0) {
          return {
            tokenSymbol: token.symbol,
            fees: 0,
            amount: 0,
            equivalentAmount,
          };
        }

        try {
          const amountAndFees = await (selectedAction === 'buy'
            ? window.adrena.client.getAddLiquidityAmountAndFee({
                amountIn: uiToNative(equivalentAmount, token.decimals),
                token,
              })
            : window.adrena.client.getRemoveLiquidityAmountAndFee({
                lpAmountIn: uiToNative(
                  alpInput,
                  window.adrena.client.alpToken.decimals,
                ),
                token,
              }));

          if (amountAndFees === null) {
            return {
              tokenSymbol: token.symbol,
              fees: null,
              amount: null,
              equivalentAmount,
            };
          }

          return {
            tokenSymbol: token.symbol,
            fees: price * nativeToUi(amountAndFees.fee, token.decimals),
            amount: nativeToUi(
              amountAndFees.amount,
              window.adrena.client.alpToken.decimals,
            ),
            equivalentAmount,
          };
        } catch (e) {
          console.log(e);
          return {
            tokenSymbol: token.symbol,
            fees: null,
            amount: null,
            equivalentAmount,
          };
        }
      }),
    );

    const formattedData = data.reduce((acc, token) => {
      if (token === null) return acc;
      return {
        ...acc,
        [token.tokenSymbol]: {
          fees: token.fees,
          amount: token.amount,
          equivalentAmount: token.equivalentAmount,
        },
      };
    }, {} as feesAndAmountsType);

    // Verify that information is not outdated
    // If loaderCounter doesn't match it means
    // an other request has been casted due to input change
    if (localLoadingCounter !== loadingCounter) {
      setIsFeesLoading(false);
      console.log('Ignore deprecated result');
      return;
    }

    console.count('fetched fees and amounts...');

    setIsFeesLoading(false);
    setFeesAndAmounts(formattedData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction, debouncedInputs]);

  useEffect(() => {
    getFeesAndAmounts();
  }, [getFeesAndAmounts, debouncedInputs]);

  useEffect(() => {
    // setIsFeesLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction === 'buy' ? collateralInput : alpInput]);

  useEffect(() => {
    if (!window.adrena.client.tokens.length) return;

    if (!collateralToken) {
      setCollateralToken(window.adrena.client.tokens[0]);
    }

    setAllowedCollateralTokens(window.adrena.client.tokens);
  }, [collateralToken]);

  const onCollateralTokenChange = (t: Token) => {
    if (selectedAction === 'sell') {
      setAlpInput(null);
      setAlpPrice(null);
      setFeesUsd(null);
    } else {
      setCollateralInput(null);
      setCollateralPrice(null);
      setFeesUsd(null);
    }
    // Reset the loading counter to ignore outdated informations
    loadingCounter += 1;
    setCollateralToken(t);
  };

  if (allowedCollateralTokens === null) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col lg:flex-row items-evenly gap-x-4">
      <div className="flex w-full h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center">
          <Image
            src={window.adrena.client.alpToken.image}
            width={32}
            height={32}
            alt="ALP icon"
          />

          <div className="flex flex-col justify-start ml-2">
            <h2 className="">ALP</h2>
            <span className="opacity-50">The Pool Token</span>
          </div>
        </div>

        <ALPSwap
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
          collateralInput={collateralInput}
          setCollateralInput={setCollateralInput}
          alpInput={alpInput}
          setAlpInput={setAlpInput}
          collateralToken={collateralToken}
          allowedCollateralTokens={allowedCollateralTokens}
          feesUsd={feesUsd}
          setFeesUsd={setFeesUsd}
          setIsFeesLoading={setIsFeesLoading}
          onCollateralTokenChange={onCollateralTokenChange}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          setAlpPrice={setAlpPrice}
          setCollateralPrice={setCollateralPrice}
          alpPrice={alpPrice}
          collateralPrice={collateralPrice}
        />
      </div>

      <div className="flex w-full h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center">
          <Image
            src={window.adrena.client.adxToken.image}
            width={32}
            height={32}
            alt="ADX icon"
          />

          <div className="flex flex-col justify-start ml-2">
            <h2 className="">ADX</h2>
            <span className="opacity-50">The Governance Token</span>
          </div>
        </div>

        <div className="bg-[#ffd15d] rounded-2xl h-full w-full flex relative p-4 justify-center">
          <Image
            src={orcaImg}
            alt="ADX icon"
            className="absolute mb-12 mt-8 w-[20em]"
          />

          <Button
            className="mt-auto w-full ml-auto mr-auto"
            rightIcon={externalLinkIcon}
            title="Buy ADX on Orca"
            size="lg"
            onClick={() => {
              window.open('https://www.orca.so');
            }}
          />
        </div>
      </div>
    </div>
  );
}
