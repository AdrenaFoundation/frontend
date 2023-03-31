import { twMerge } from "tailwind-merge";
import Button from "../../Button/Button";
import InputNumber from "../../InputNumber/InputNumber";
import Select from "../../Select/Select";
import { Token } from "@/types";
import { ReactNode } from "react";

export default function TradingInput({
  className,
  textTopLeft,
  textTopRight,
  value,
  maxButton,
  selectedToken,
  tokenList,
  onTokenSelect,
  onChange,
  onMaxButtonClick,
}: {
  className?: string;
  textTopLeft?: ReactNode;
  textTopRight?: ReactNode;
  value?: number | null;
  maxButton?: boolean;
  selectedToken?: Token;
  tokenList: Token[];
  onTokenSelect: (t: Token) => void;
  onChange: (v: number | null) => void;
  onMaxButtonClick?: () => void;
}) {
  return (
    <div className={twMerge("relative", "flex", "flex-col", className)}>
      {/* Input A */}
      <div
        className={twMerge(
          "h-32",
          "w-32",
          "p-6",
          "bg-third",
          "flex",
          "items-center",
          "w-full",
          "justify-between",
          "flex-col"
        )}
      >
        <div
          className={twMerge(
            "shrink-0",
            "flex",
            "items-center",
            "w-full",
            "justify-between"
          )}
        >
          <div className="text-txtfade">{textTopLeft}</div>
          <div className="text-txtfade">{textTopRight}</div>
        </div>

        <div className="flex w-full items-center">
          <InputNumber
            value={value ?? undefined}
            placeholder="0.00"
            className={twMerge(
              "bg-third",
              "border-0",
              "text-lg",
              "outline-none",
              "w-full",
              "font-bold"
            )}
            onChange={onChange}
          />

          {maxButton ? (
            <Button
              title="MAX"
              className={twMerge(
                "bg-highlight",
                "border-grey",
                "mr-2",
                "text-sm",
                "h-6"
              )}
              onClick={() => onMaxButtonClick?.()}
            />
          ) : null}

          {tokenList.length ? (
            <Select
              className="shrink-0 text-2xl"
              selected={selectedToken?.name ?? ""}
              options={tokenList.map((v) => v.name)}
              onSelect={(name) =>
                onTokenSelect(tokenList.find((token) => token.name === name)!)
              }
            />
          ) : (
            <div>{selectedToken?.name ?? "-"}</div>
          )}
        </div>
      </div>
    </div>
  );
}
