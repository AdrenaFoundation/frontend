import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { PositionExtended } from "@/types";
import ClosePosition from "../ClosePosition/ClosePosition";
import Modal from "@/components/Modal/Modal";
import PositionsArray from "./PositionsArray";
import PositionsBlocs from "./PositionsBlocs";
import { useMediaQuery } from "react-responsive";

export default function Positions({
  className,
  positions,
}: {
  className?: string;
  positions: PositionExtended[] | null;
}) {
  const [closePosition, setClosePosition] = useState<PositionExtended | null>(
    null
  );

  const isBigScreen = useMediaQuery({ query: "(min-width: 950px)" });

  return (
    <>
      {closePosition ? (
        <Modal
          title="Close Position"
          close={() => setClosePosition(null)}
          className={twMerge("flex", "flex-col", "items-center", "p-4")}
        >
          <ClosePosition
            position={closePosition}
            onClose={() => {
              setClosePosition(null);
            }}
          />
        </Modal>
      ) : null}

      {isBigScreen ? (
        <PositionsArray
          positions={positions}
          className={className}
          triggerClosePosition={setClosePosition}
        />
      ) : (
        <PositionsBlocs
          positions={positions}
          className={className}
          triggerClosePosition={setClosePosition}
        />
      )}
    </>
  );
}
