import { twMerge } from "tailwind-merge";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div
      className={twMerge(
        "flex",
        "w-full",
        "h-20",
        "bg-secondary",
        "border-t",
        "border-grey",
        "justify-center",
        "items-center"
      )}
    >
      <Link
        href="https://github.com/orgs/AdrenaDEX/repositories"
        target="_blank"
      >
        <Image
          className="hover:opacity-90 cursor-pointer"
          src="/images/github.svg"
          alt="github icon"
          width="25"
          height="25"
        />
      </Link>
    </div>
  );
}
