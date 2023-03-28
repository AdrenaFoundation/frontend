import Link from "next/link";
import { twMerge } from "tailwind-merge";
import Button from "../Button/Button";
import WalletAdapter from "../WalletAdapter/WalletAdapter";

export default function Header() {
  return (
    <div
      className={twMerge(
        "flex w-full h-20",
        "bg-main",
        "items-center",
        "border-b",
        "border-grey"
      )}
    >
      <Link className="font-bold ml-6 mr-6 uppercase" href="/">
        Adrena
      </Link>

      <>
        <Link
          className="ml-6 cursor-pointer hover:opacity-90"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <Link className="ml-6 cursor-pointer hover:opacity-90" href="/earn">
          Earn
        </Link>
        <Link className="ml-6 cursor-pointer hover:opacity-90" href="/buy">
          Buy
        </Link>
      </>

      <Button
        className="bg-blue ml-auto"
        title={<Link href="/trade">Trade</Link>}
        onClick={() => {}}
      />

      <WalletAdapter className="ml-4 mr-6" />
    </div>
  );
}
