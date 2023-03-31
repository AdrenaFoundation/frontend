import {
  autoConnectWalletAction,
  connectWalletAction,
  disconnectWalletAction,
} from "@/actions/walletActions";
import { useSelector, useDispatch } from "@/store/store";
import React, { useEffect } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../Button/Button";
import Modal from "../Modal/Modal";

function getAbbrevWalletAddress(address: string) {
  return `${address.slice(0, 4)}..${address.slice(address.length - 4)}`;
}

function WalletAdapter(
  { className }: { className?: string },
  ref?: React.Ref<HTMLDivElement>
) {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const wallet = useSelector((s) => s.wallet);

  const connected = !!wallet;

  // When component gets created, try to auto-connect to wallet
  useEffect(() => {
    dispatch(autoConnectWalletAction("phantom"));

    // Only once when page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={twMerge(className)}>
      {!connected ? (
        <Button
          leftIcon="images/wallet-icon.svg"
          title="Connect wallet"
          onClick={() => setOpenModal(true)}
          ref={ref}
        />
      ) : null}

      {connected ? (
        <Button
          title={getAbbrevWalletAddress(wallet.walletAddress)}
          onClick={() => {
            dispatch(disconnectWalletAction(wallet.adapterName));
            setOpenModal(false);
          }}
          rightIcon="images/disconnect.png"
        />
      ) : null}

      {openModal ? (
        <Modal
          title="Select wallet"
          close={() => setOpenModal(false)}
          className={twMerge(
            "w-64",
            "h-32",
            "flex",
            "flex-col",
            "items-center",
            "justify-center"
          )}
        >
          <div
            className={twMerge(
              "w-full",
              "h-full",
              "flex",
              "flex-col",
              "justify-evenly",
              "items-center"
            )}
            onClick={() => {
              dispatch(connectWalletAction("phantom"));
              setOpenModal(false);
            }}
          >
            <div
              className={twMerge(
                "flex",
                "p-2",
                "border",
                "border-grey",
                "items-center",
                "w-40",
                "justify-around",
                "cursor-pointer",
                "hover:opacity-90"
              )}
            >
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="w-8 h-8"
                  src="/images/phantom.png"
                  alt="phantom icon"
                />
              }
              <span className="text-lg">Phantom</span>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default React.forwardRef(WalletAdapter);
