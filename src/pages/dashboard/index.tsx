import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import ALPIndexComposition from "@/components/ALPIndexComposition/ALPIndexComposition";
import { twMerge } from "tailwind-merge";
import useAdrenaClient from "@/hooks/useAdrenaClient";
import useCustodies from "@/hooks/useCustodies";
import useMainPool from "@/hooks/useMainPool";
import useConnection from "@/hooks/useConnection";

export default function Trade() {
  const client = useAdrenaClient();
  const connection = useConnection();
  const mainPool = useMainPool(client);
  const custodies = useCustodies(client, mainPool);

  useListenToPythTokenPricesChange(client, connection);
  useWatchWalletBalance(client, connection);

  return (
    <div
      className={twMerge(
        "w-full",
        "h-full",
        "flex",
        "p-4",
        "overflow-auto",
        "flex-col",
        "bg-main"
      )}
    >
      <ALPIndexComposition client={client} custodies={custodies} />
    </div>
  );
}
