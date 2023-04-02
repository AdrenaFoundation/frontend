import { useDispatch, useSelector } from "@/store/store";
import { Connection, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect } from "react";
import { findATAAddressSync } from "@/utils";
import { setWalletTokenBalancesAction } from "@/actions/walletBalancesActions";
import { TokenName } from "@/types";
import { AdrenaClient } from "@/AdrenaClient";

// TODO: Make it responsive to wallet token balance change
const useWatchWalletBalance = (
  client: AdrenaClient | null,
  connection: Connection | null
) => {
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.wallet);

  const loadWalletBalances = useCallback(async () => {
    if (!connection || !wallet || !dispatch || !client) return;

    const balances = await Promise.all(
      client.tokens.map(async ({ mint }) => {
        const ata = findATAAddressSync(
          new PublicKey(wallet.walletAddress),
          mint
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
          acc[client.tokens[index].name] = balance;

          return acc;
        }, {} as Record<TokenName, number | null>)
      )
    );
  }, [connection, wallet, dispatch, client]);

  useEffect(() => {
    loadWalletBalances();
  }, [loadWalletBalances]);
};

export default useWatchWalletBalance;
