import styles from "./Footer.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <Link
        href="https://github.com/orgs/AdrenaDEX/repositories"
        target="_blank"
      >
        <Image
          className={styles.footer__image}
          src="/images/github.svg"
          alt="github icon"
          width="25"
          height="25"
        />
      </Link>
    </div>
  );
}
