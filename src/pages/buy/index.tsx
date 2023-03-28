import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import { twMerge } from "tailwind-merge";

export default function Buy() {
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
      <div className="text-4xl font-bold">Buy / Sell ALP</div>
      <div className="mt-4">
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>
    </div>
  );
}
