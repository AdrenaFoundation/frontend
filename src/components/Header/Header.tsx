import Link from "next/link";
import { twMerge } from "tailwind-merge";
import Button from "../Button/Button";
import WalletAdapter from "../WalletAdapter/WalletAdapter";

export default function Header() {
  return (
    <div
      className={twMerge(
        "flex",
        "bg-main",
        "w-full",
        "items-center",
        "border-b",
        "border-grey",
        "sm:h-20",
        "flex-col",
        "sm:flex-row",
        "p-4",
        "sm:p-0"
      )}
    >
      <Link className="font-bold sm:ml-6 sm:mr-6 uppercase" href="/">
        Adrena
      </Link>

      <>
        <Link
          className="mt-2 sm:mt-0 sm:ml-6 cursor-pointer hover:opacity-90"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <Link
          className="mt-2 sm:mt-0 sm:ml-6 cursor-pointer hover:opacity-90"
          href="/earn"
        >
          Earn
        </Link>
        <Link
          className="mt-2 sm:mt-0 sm:ml-6 cursor-pointer hover:opacity-90"
          href="/buy"
        >
          Buy
        </Link>
      </>

      <Button
        className="bg-highlight sm:ml-auto w-full sm:w-20 mt-2 sm:mt-0"
        title={<Link href="/trade">Trade</Link>}
        onClick={() => {}}
      />

      <WalletAdapter className="sm:ml-4 sm:mr-6 w-full sm:w-auto mt-2 sm:mt-0" />
    </div>
  );
}
