import {
  connectWalletAction,
  disconnectWalletAction,
} from "@/actions/walletActions";
import { useSelector, useDispatch } from "@/store/store";
import { useState } from "react";
import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import styles from "./WalletAdapter.module.scss";

function getAbbrevWalletAddress(address: string) {
  return `${address.slice(0, 4)}..${address.slice(address.length - 4)}`;
}

export default function WalletAdapter({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const wallet = useSelector((s) => s.wallet);

  const connected = !!wallet;

  return (
    <div className={`${styles.walletAdapter} ${className ?? ""}`}>
      {!connected ? (
        <Button title="Connect wallet" onClick={() => setOpenModal(true)} />
      ) : null}

      {connected ? (
        <Button
          title={getAbbrevWalletAddress(wallet.walletAddress)}
          onClick={() => {
            dispatch(disconnectWalletAction(wallet.adapterName));
            setOpenModal(false);
          }}
          rightIcon="images/power-off.svg"
        />
      ) : null}

      {openModal ? (
        <Modal
          title="Select wallet"
          close={() => setOpenModal(false)}
          className={styles.walletAdapter__modal}
        >
          <div
            className={styles.walletAdapter__modal_wallet_list}
            onClick={() => {
              dispatch(connectWalletAction("phantom"));
              setOpenModal(false);
            }}
          >
            <div className={styles.walletAdapter__modal_wallet_list_item}>
              <img
                className={styles.walletAdapter__modal_wallet_list_item_logo}
                src="/images/phantom.png"
              />
              <span
                className={styles.walletAdapter__modal_wallet_list_item_title}
              >
                Phantom
              </span>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
