import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { Line } from 'react-chartjs-2';

import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartData,
  Color,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React from 'react';

ChartJS.register(
  ArcElement,
  ChartDataLabels,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
);

function plus10Percent(price: number) {
  return price + (price * 10) / 100;
}

function minus10Percent(price: number) {
  return price - (price * 10) / 100;
}

export default function StopLossTakeProfit({
  className,
  position,
  triggerPositionsReload,
  triggerUserProfileReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  onClose: () => void;
}) {
  const [stopLossInput, setStopLossInput] = useState<number | null>(null);
  const [takeProfitInput, setTakeProfitInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const markPrice: number | null = tokenPrices[position.token.symbol];
  const [datasets, setDatasets] = useState<
    ChartData<'line'>['datasets'] | null
  >(null);

  const rowStyle = 'w-full flex justify-between mt-2';

  const generateInput = (
    type: 'Stop Loss' | 'Take Profit',
    input: number | null,
    setInput: Dispatch<SetStateAction<number | null>>,
  ) => {
    {
      /* TODO: REPLACE BY IF STOP LOSS IS THERE */
    }
    const isActive = false;

    return (
      <>
        <div className="border-t border-bcolor w-full h-[1px]" />
        <h5 className="w-full ml-16">{type}</h5>

        <div className="flex flex-col items-center w-full gap-4 pl-6 pr-6">
          <div className="flex items-center border rounded-lg bg-inputcolor pl-4 pr-4 pt-2 pb-2 w-full">
            <div className="text-txtfade text-xl">$</div>

            <InputNumber
              value={input === null ? undefined : input}
              placeholder={
                markPrice !== null
                  ? (() => {
                      if (type === 'Stop Loss') {
                        return position.side === 'long'
                          ? minus10Percent(markPrice).toFixed(2)
                          : plus10Percent(markPrice).toFixed(2);
                      }

                      return position.side === 'long'
                        ? plus10Percent(markPrice).toFixed(2)
                        : minus10Percent(markPrice).toFixed(2);
                    })()
                  : 'pick a price'
              }
              className="font-mono border-0 outline-none bg-transparent"
              onChange={setInput}
              inputFontSize="1em"
            />
          </div>

          {/* <div className="flex w-full items-center justify-center gap-4">
            {isActive ? (
              <Button
                className="font-boldy text-xs w-[10em] grow"
                size="lg"
                title="Set"
                variant="outline"
                onClick={() => {
                  // TODO
                }}
              />
            ) : (
              <>
                <Button
                  className="font-boldy text-xs w-[10em] grow"
                  size="lg"
                  title="Update"
                  variant="outline"
                  onClick={() => {
                    // TODO
                  }}
                />
                <Button
                  className="font-boldy text-xs w-[10em] grow"
                  size="lg"
                  variant="danger"
                  title="Delete"
                  onClick={() => {
                    // TODO
                  }}
                />
              </>
            )}
          </div> */}
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!markPrice) return;

    const d = [
      {
        label: 'Mark Price',
        data: Array.from(Buffer.alloc(20)).fill(markPrice),
        backgroundColor: '#ffffff',
        borderColor: '#ffffff',
        pointRadius: 0,
        pointHoverRadius: 0,
        borderWidth: 2,
        fillOpacity: 1,
      },
      {
        label: 'Entry Price',
        data: Array.from(Buffer.alloc(20)).fill(position.price),
        backgroundColor: '#9f8cae',
        borderColor: '#9f8cae',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ] as ChartData<'line'>['datasets'];

    if (
      position.liquidationPrice !== null &&
      typeof position.liquidationPrice !== 'undefined'
    ) {
      d.push({
        label: 'Liquidation Price',
        data: Array.from(Buffer.alloc(20)).fill(position.liquidationPrice),
        backgroundColor: '#eb6672',
        borderColor: '#eb6672',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      });

      d.push({
        label: 'Stop Loss',
        data: Array.from(Buffer.alloc(20)).fill(position.liquidationPrice + 80),
        backgroundColor: '#edb40e',
        borderColor: '#edb40e',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      });
    }

    // TODO: If there is a stop loss, add it
    // #edb40e

    // TODO: If there is a take profit, add it

    setDatasets(d);
  }, [position.price, markPrice, position.liquidationPrice]);

  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 mt-4 h-full w-full items-center pb-6',
        className,
      )}
    >
      {datasets ? (
        <div className="w-[90%] ml-auto mr-auto ">
          <Line
            data={{
              labels: Array.from(Buffer.alloc(20)).fill(0),
              datasets,
            }}
            options={{
              animation: false,
              plugins: {
                legend: {
                  labels: {
                    color: 'white',
                  },
                  display: false,
                },
                datalabels: {
                  display: function (context) {
                    // Adjust display logic based on dataset index and data index
                    if (
                      // Mark Price
                      context.datasetIndex === 0 &&
                      context.dataIndex === 9
                    ) {
                      return true;
                    }

                    if (
                      // Entry Price
                      context.datasetIndex === 1 &&
                      context.dataIndex === 3
                    ) {
                      return true;
                    }

                    if (
                      // Liquidation Price
                      context.datasetIndex === 2 &&
                      context.dataIndex === 3
                    ) {
                      return true;
                    }

                    if (context.datasetIndex >= 3 && context.dataIndex === 16) {
                      // For stop loss and take profit, display the label at the last point (index 4)
                      return true;
                    }

                    return false;
                  },
                  formatter: function (value, context) {
                    const name = context.dataset.label
                      ? {
                          'Mark Price': 'Mark',
                          'Entry Price': 'Entry',
                          'Liquidation Price': 'Liq',
                          'Stop Loss': 'SL',
                          'Take Profit': 'TP',
                        }[context.dataset.label]
                      : null;

                    if (name) {
                      return `${name} $${value}`;
                    }

                    return `$${value}`;
                  },
                  align: 'top',
                  anchor: 'end',
                  color: function (context) {
                    return (context.dataset.backgroundColor ||
                      'white') as Color;
                  },
                  font: {
                    weight: 'bold',
                  },
                },
              },
              scales: {
                y: {
                  ticks: {
                    callback: function (value) {
                      return `$${value}`;
                    },
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                  grid: {
                    display: true,
                    color: 'rgba(21, 32, 44, 1)',
                  },
                },
                x: {
                  display: false,
                },
              },
            }}
          />

          <div className="flex flex-row flex-wrap gap-2 justify-center mt-2">
            <div className="flex gap-1 items-center">
              <div className="rounded-full bg-[#ffffff] h-2 w-2" />
              <div className="text-xs mt-[2px]">Mark Price</div>
            </div>
            <div className="flex gap-1 items-center">
              <div className="rounded-full bg-[#9f8cae] h-2 w-2" />
              <div className="text-xs mt-[2px] text-[#9f8cae]">Entry Price</div>
            </div>
            <div className="flex gap-1 items-center">
              <div className="rounded-full bg-[#eb6672] h-2 w-2" />
              <div className="text-xs mt-[2px] text-[#eb6672]">
                Liquidation Price
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <div className="rounded-full bg-[#edb40e] h-2 w-2" />
              <div className="text-xs mt-[2px] text-[#edb40e]">Stop Loss</div>
            </div>
            <div className="flex gap-1 items-center">
              <div className="rounded-full bg-[#7fd7c1] h-2 w-2" />
              <div className="text-xs mt-[2px] text-[#7fd7c1]">Take Profit</div>
            </div>
          </div>
        </div>
      ) : null}

      {generateInput('Stop Loss', stopLossInput, setStopLossInput)}
      {generateInput('Take Profit', takeProfitInput, setTakeProfitInput)}

      <div className="w-full mt-4 gap-4 flex pl-6 pr-6">
        <Button
          className="font-boldy text-xs w-[10em] grow"
          size="lg"
          title="Cancel"
          variant="outline"
          onClick={() => {
            // TODO
          }}
        />

        <Button
          className="font-boldy text-xs w-[10em] grow"
          size="lg"
          title="Confirm"
          onClick={() => {
            // TODO
          }}
        />
      </div>

      {/* <Button
        className="rounded-none font-boldy text-lg w-full"
        size="lg"
        title="Set Both"
        onClick={() => {
          // TODO
        }}
      /> */}
    </div>
  );
}
