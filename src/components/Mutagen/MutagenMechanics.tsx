import 'tippy.js/dist/tippy.css';

import Tippy from '@tippyjs/react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import Button from '@/components/common/Button/Button';
import { formatNumber } from '@/utils';

export default function MutagenMechanics() {
  // Data for the Size Multiplier chart
  const sizeMultiplierData = [
    { name: '$10', multiplier: 0.00025, label: '$10' },
    { name: '$1k', multiplier: 0.05, label: '$1k' },
    { name: '$5k', multiplier: 1, label: '$5k' },
    { name: '$50k', multiplier: 5, label: '$50k' },
    { name: '$100k', multiplier: 9, label: '$100k' },
    { name: '$250k', multiplier: 17.5, label: '$250k' },
    { name: '$500k', multiplier: 25, label: '$500k' },
    { name: '$1M', multiplier: 30, label: '$1M' },
    { name: '$4.5M', multiplier: 45, label: '$4.5M' },
  ];

  const tradePerformanceTooltip = (
    <div className="text-xs leading-relaxed pl-2">
      <div className="grid grid-cols-1 gap-1">
        <div>
          Formula: (PnL after fees / volume) * 100.
          <br />
          Mutagen: <span className="text-[#e47dbb] font-bold">+0</span> to{' '}
          <span className="text-[#e47dbb] font-bold">+0.3</span>. <br />
          Minimum <span className="text-gold">mutagen values</span> may apply
          based on your volume.
        </div>
      </div>
    </div>
  );

  // Custom tooltip for the chart
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#222] p-2 border border-[#444] rounded shadow-md ">
          <p className="text-white font-semibold">{`Close size: ${label} `}</p>
          <p className="text-white">{`Multiplier: ${payload[0].value}x`}</p>
        </div>
      );
    }
    return null;
  };

  // Content for the Size Multiplier tooltip
  const sizeMultiplierTooltip = (
    <div className="text-xs leading-relaxed pl-2">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left font-normal">Close Size Range</th>
            <th className="text-left font-normal">Multiplier</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{'>= $10 and < $1,000'}</td>
            <td>0.00025x – 0.05x</td>
          </tr>
          <tr>
            <td>{'>= $1,000 and < $5,000'}</td>
            <td>0.05x – 1x</td>
          </tr>
          <tr>
            <td>{'>= $5,000 and < $50,000'}</td>
            <td>1x – 5x</td>
          </tr>
          <tr>
            <td>{'>= $50,000 and < $100,000'}</td>
            <td>5x – 9x</td>
          </tr>
          <tr>
            <td>{'>= $100,000 and < $250,000'}</td>
            <td>9x – 17.5x</td>
          </tr>
          <tr>
            <td>{'>= $250,000 and < $500,000'}</td>
            <td>17.5x – 25x</td>
          </tr>
          <tr>
            <td>{'>= $500,000 and < $1,000,000'}</td>
            <td>25x – 30x</td>
          </tr>
          <tr>
            <td>{'>= $1,000,000 and <= $4,500,000'}</td>
            <td>30x – 45x</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-2">
        The multiplier increases with trade size, rewarding larger trades with
        higher mutagen potential.
      </div>
    </div>
  );

  // Content for the Minimum Mutagen tooltip
  const minMutagenTooltip = (
    <div className="text-xs leading-relaxed pl-2">
      <div className="grid grid-cols-1 gap-1">
        <div className="flex justify-between items-center">
          <span>If volume * {'>'} 100,000:</span>
          <span>
            Minimum ={' '}
            <span className="text-[#e47dbb] font-mono font-semibold">0.1</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>If volume {'>'} 50,000:</span>
          <span>
            Minimum ={' '}
            <span className="text-[#e47dbb] font-mono font-semibold">0.02</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>If volume {'>'} 30,000:</span>
          <span>
            Minimum ={' '}
            <span className="text-[#e47dbb] font-mono font-semibold">0.01</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>If volume {'>'} 20,000:</span>
          <span>
            Minimum ={' '}
            <span className="text-[#e47dbb] font-mono font-semibold">
              0.005
            </span>
          </span>
        </div>
      </div>
      <div className="mt-2">
        The highest applicable minimum is used.
        <br />
        If your calculated mutagen is below the minimum, the minimum applies.
      </div>
      <div className="text-xs leading-relaxed mt-2">
        <span className="text-white">
          * Volume = entry size + increase sizes + close size
        </span>
      </div>
    </div>
  );

  // State for interactive calculator
  const [tradeSize, setTradeSize] = useState(100000); // USD
  const [projectedPnL, setProjectedPnL] = useState(0); // USD
  const [tradePerformance, setTradePerformance] = useState(0); // 5% (as percent, 0-7.5)
  const [tradeDuration, setTradeDuration] = useState(3600); // 1 hour in seconds

  // Update tradePerformance when projectedPnL or tradeSize changes
  const cappedPerformance = Math.max(
    0,
    Math.min(projectedPnL / (tradeSize + tradeSize + projectedPnL), 0.075),
  );
  if (tradePerformance !== cappedPerformance) {
    setTradePerformance(cappedPerformance);
  }

  // Helper: get size multiplier based on trade size
  function getSizeMultiplier(size: number) {
    if (size >= 1000000 && size <= 4500000) {
      // $1M - $4.5M: 30x - 45x
      return 30 + ((size - 1000000) * (45 - 30)) / (4500000 - 1000000);
    }
    if (size >= 500000 && size < 1000000) {
      // $500k - $1M: 25x - 30x
      return 25 + ((size - 500000) * (30 - 25)) / (1000000 - 500000);
    }
    if (size >= 250000 && size < 500000) {
      // $250k - $500k: 17.5x - 25x
      return 17.5 + ((size - 250000) * (25 - 17.5)) / (500000 - 250000);
    }
    if (size >= 100000 && size < 250000) {
      // $100k - $250k: 9x - 17.5x
      return 9 + ((size - 100000) * (17.5 - 9)) / (250000 - 100000);
    }
    if (size >= 50000 && size < 100000) {
      // $50k - $100k: 5x - 9x
      return 5 + ((size - 50000) * (9 - 5)) / (100000 - 50000);
    }
    if (size >= 5000 && size < 50000) {
      // $5k - $50k: 1x - 5x
      return 1 + ((size - 5000) * (5 - 1)) / (50000 - 5000);
    }
    if (size >= 1000 && size < 5000) {
      // $1k - $5k: 0.05x - 1x
      return 0.05 + ((size - 1000) * (1 - 0.05)) / (5000 - 1000);
    }
    if (size >= 10 && size < 1000) {
      // $10 - $1k: 0.00025x - 0.05x
      return 0.00025 + ((size - 10) * (0.05 - 0.00025)) / (1000 - 10);
    }
    return 0;
  }

  function getMinimumPerformanceMutagen(size: number) {
    if (size > 50000) return 0.1;
    if (size > 25000) return 0.02;
    if (size > 15000) return 0.01;
    if (size > 10000) return 0.005;
    return 0;
  }

  // Map tradePerformance (0-0.075) to 0-0.3 mutagen
  const performanceMutagenRaw = (tradePerformance / 0.075) * 0.3;
  const minPerformanceMutagen = getMinimumPerformanceMutagen(tradeSize);
  const performanceMutagen = Math.max(
    performanceMutagenRaw,
    minPerformanceMutagen,
  );

  // Calculate mutagen
  const sizeMultiplier = getSizeMultiplier(tradeSize);
  // Trade performance is a percent (e.g., 0.05 for 5%)
  // Trade duration is in seconds, scale to 0-0.05 for 10s-72h
  const minDuration = 10;
  const maxDuration = 72 * 3600;
  const clampedDuration = Math.max(
    minDuration,
    Math.min(tradeDuration, maxDuration),
  );
  const epsilon = 60; // 60 second tolerance for last step of slider
  const durationMutagenRaw =
    Math.abs(clampedDuration - maxDuration) < epsilon
      ? 0.05
      : ((clampedDuration - minDuration) / (maxDuration - minDuration)) * 0.05;
  const durationMutagen = durationMutagenRaw;
  const rawMutagen = (performanceMutagen + durationMutagen) * sizeMultiplier;
  const mutagen = rawMutagen;

  const isPerformanceCapEnforced =
    minPerformanceMutagen > 0 && performanceMutagenRaw < minPerformanceMutagen;

  return (
    <div className="flex flex-col gap-4">
      {/* Mutagens Card */}
      <div className="text-[#bbb] leading-relaxed text-md">
        Each trade done during the season will score mutagen based on its
        performance, duration, and close size.
      </div>
      <div className="text-[#bbb] leading-relaxed text-md">
        <span className="text-white font-regular">Formula:</span>{' '}
        <code className="bg-[#222] px-1 py-0.5 rounded text-sm">
          (Trade Performance + Trade Duration) × Size Multiplier
        </code>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        <div className="border border-[#333] rounded-md p-6">
          {/* Trade Performance */}
          <div>
            <div className="flex items-center text-[#bbb] font-semibold mb-2 cursor-help">
              <Tippy
                content={
                  <span>
                    How much PnL you make per trade volume. Mutagen:{' '}
                    <span className="text-[#e47dbb] font-bold">+0</span> to{' '}
                    <span className="text-[#e47dbb] font-bold">+0.3</span>.{' '}
                    <br />
                    Minimum <span className="text-gold">
                      mutagen values
                    </span>{' '}
                    may apply based on your volume.
                  </span>
                }
              >
                <h4 className="text-white underline-dashed">
                  Trade Performance
                </h4>
              </Tippy>
            </div>
            <ul className="leading-relaxed pl-4 list-disc mb-4">
              <li>
                Range: <span className="text-white">0.1%</span> →{' '}
                <span className="text-white">7.5%</span>
              </li>
              <li>
                Mutagen: <span className="text-[#e47dbb] font-bold">+0</span> /{' '}
                <Tippy content={minMutagenTooltip}>
                  <span className="text-gold underline-dashed cursor-help">
                    minimum mutagen value
                  </span>
                </Tippy>{' '}
                → <span className="text-[#e47dbb] font-bold">+0.3</span>
              </li>
            </ul>
          </div>
          <div className="my-4 border-t border-[#333]" />
          {/* Trade Duration */}
          <div>
            <div className="flex items-center text-[#bbb] font-semibold mb-2 cursor-help">
              <Tippy
                content={
                  <span>
                    How long you keep your trade open. Mutagen:{' '}
                    <span className="text-[#e47dbb] font-bold">+0</span> to{' '}
                    <span className="text-[#e47dbb] font-bold">+0.05</span>.
                  </span>
                }
              >
                <h4 className="text-white underline-dashed">Trade Duration</h4>
              </Tippy>
            </div>
            <ul className="leading-relaxed pl-4 list-disc mb-4">
              <li>
                Range: <span className="text-white">10s</span> →{' '}
                <span className="text-white">72h</span>
              </li>
              <li>
                Mutagen: <span className="text-[#e47dbb] font-bold">+0</span> to{' '}
                <span className="text-[#e47dbb] font-bold">+0.05</span>
              </li>
            </ul>
          </div>
          <div className="my-4 border-t border-[#333]" />
          {/* Size Multiplier */}
          <div>
            <div className="flex items-center text-[#bbb] font-semibold mb-2 cursor-help">
              <Tippy content={sizeMultiplierTooltip}>
                <h4 className="text-white underline-dashed">Size Multiplier</h4>
              </Tippy>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sizeMultiplierData} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient
                      id="multiplierGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#e47dbb" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#e47dbb"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#888', fontSize: 10 }}
                    axisLine={{ stroke: '#333' }}
                    tickLine={{ stroke: '#333' }}
                  />
                  <YAxis
                    tick={{ fill: '#888', fontSize: 10 }}
                    axisLine={{ stroke: '#333' }}
                    tickLine={{ stroke: '#333' }}
                    domain={[0, 45]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="multiplier"
                    stroke="#e47dbb"
                    strokeWidth={2}
                    fill="url(#multiplierGradient)"
                    activeDot={{ r: 5, fill: '#fff', stroke: '#e47dbb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Mutagen Calculator */}
        <div className="rounded-md border border-[#333] p-4 w-full mx-auto">
          <div className="text-lg font-bold text-white mb-4">
            Mutagen Calculator
          </div>
          <div className="flex flex-col gap-4">
            {/* Trade Size */}
            <div>
              <label className="text-xs text-[#bbb]">
                Trade Entry Size (USD):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="4500000"
                  step="10"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <input
                  type="number"
                  min="10"
                  max="4500000"
                  step="10"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(Number(e.target.value))}
                  className="w-24 ml-2 bg-inputcolor border border-[#333] rounded px-2 py-1 text-white"
                />
              </div>
            </div>
            {/* Projected PnL */}
            <div>
              <label className="text-xs text-[#bbb]">
                PnL after Fees (USD):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={1000000}
                  step="1"
                  value={projectedPnL}
                  onChange={(e) => setProjectedPnL(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <input
                  type="number"
                  min="0"
                  max={tradeSize}
                  step="1"
                  value={projectedPnL}
                  onChange={(e) => setProjectedPnL(Number(e.target.value))}
                  className="w-24 ml-2 bg-inputcolor border border-[#333] rounded px-2 py-1 text-white"
                />
              </div>
            </div>
            {/* Trade Performance (read-only) */}
            <div>
              <Tippy content={tradePerformanceTooltip}>
                <label className="text-xs text-[#bbb] underline-dashed">
                  Trade Performance: ${projectedPnL} / $
                  {tradeSize + tradeSize + projectedPnL} * 100:
                </label>
              </Tippy>
              <div className="flex items-center gap-2">
                <span className="text-white text-base font-mono">
                  {formatNumber(tradePerformance * 100, 2)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.075"
                step="0.001"
                value={tradePerformance}
                disabled
                className="w-full mt-1 opacity-60 cursor-not-allowed"
              />
            </div>
            {/* Trade Duration */}
            <div>
              <label className="text-xs text-[#bbb]">
                Trade Duration (hours):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={72}
                  step="1"
                  value={Math.round(tradeDuration / 3600)}
                  onChange={(e) =>
                    setTradeDuration(Number(e.target.value) * 3600)
                  }
                  className="w-full mt-1"
                />
                <input
                  type="number"
                  min="10"
                  max={72}
                  step="1"
                  value={Math.round(tradeDuration / 3600)}
                  onChange={(e) =>
                    setTradeDuration(Number(e.target.value) * 3600)
                  }
                  className="w-24 ml-2 bg-inputcolor border border-[#333] rounded px-2 py-1 text-white"
                />
              </div>
            </div>
            <Button
              className="self-end text-sm"
              onClick={() => {
                setTradeSize(100000);
                setProjectedPnL(0);
                setTradeDuration(3600);
              }}
              variant="lightbg"
              title="Reset"
            />
          </div>
          <div className="text-center mt-2">
            <div className="text-2xl font-extrabold">
              Position mutagen:{' '}
              <span className="text-[#e47dbb] text-lg">
                {formatNumber(mutagen, 6)}
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-[#bbb] text-left">
            <div className="flex">
              <span>
                Performance mutagen:{' '}
                <span className="text-[#e47dbb]">
                  {formatNumber(performanceMutagen, 4)}{' '}
                  {isPerformanceCapEnforced && (
                    <span>
                      <Tippy content={minMutagenTooltip}>
                        <span className="underline-dashed cursor-help text-xs">
                          (
                          <span className="text-yellow-400 text-xs">
                            Minimum mutagen value
                          </span>{' '}
                          applied).
                        </span>
                      </Tippy>
                    </span>
                  )}
                </span>
              </span>
            </div>
            <div>
              Duration mutagen:{' '}
              <span className="text-[#e47dbb]">
                {formatNumber(durationMutagen, 6)}
              </span>
            </div>
            <div>
              Size multiplier:{' '}
              <span className="text-white">{sizeMultiplier}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
