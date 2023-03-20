import { tokenAddresses, tokenList } from "@/constant";
import { useDispatch, useSelector } from "@/store/store";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect } from "react";
import { findATAAddressSync } from "@/utils";
import useConnection from "./useConnection";
import { setWalletTokenBalancesAction } from "@/actions/walletBalancesActions";
import { Token } from "@/types";

// TODO: Make it responsive to wallet token balance change
const useWatchWalletBalance = () => {
  const dispatch = useDispatch();
  const connection = useConnection();
  const wallet = useSelector((s) => s.wallet);

  const loadWalletBalances = useCallback(async () => {
    if (!connection) return;
    if (!wallet) return;

    const balances = await Promise.all(
      tokenList.map(async (token) => {
        const ata = findATAAddressSync(
          new PublicKey(wallet.walletAddress),
          tokenAddresses[token]
        );

        try {
          const balance = await connection.getTokenAccountBalance(ata);
          return balance.value.uiAmount;
        } catch {
          // Cannot find ATA
          return null;
        }
      })
    );

    dispatch(
      setWalletTokenBalancesAction(
        balances.reduce((acc, balance, index) => {
          acc[tokenList[index]] = balance;

          return acc;
        }, {} as Record<Token, number | null>)
      )
    );
  }, [connection, wallet]);

  useEffect(() => {
    loadWalletBalances();
  }, [connection, wallet]);
};

export default useWatchWalletBalance;
