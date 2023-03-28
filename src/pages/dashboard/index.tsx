import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import ALPIndexComposition from "@/components/ALPIndexComposition/ALPIndexComposition";
import { twMerge } from "tailwind-merge";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

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
      <ALPIndexComposition className="flex flex-col" />
    </div>
  );
}
