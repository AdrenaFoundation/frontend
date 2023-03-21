import { Wallet } from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { getWalletAdapters } from "@/adapters/walletAdapters";
import { useSelector } from "@/store/store";

const useWallet = () => {
  const walletState = useSelector((s) => s.wallet);

  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!walletState) return;

    const adapter = getWalletAdapters()[walletState.adapterName];
    setWallet(adapter as unknown as Wallet);
  }, [walletState]);

  return wallet;
};

export default useWallet;
