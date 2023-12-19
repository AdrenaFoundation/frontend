import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { ALPIndexComposition } from '@/hooks/useALPIndexComposition';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function PoolRatioChart({
  alpComposition,
  className,
}: {
  alpComposition: ALPIndexComposition;
  className?: string;
}) {
  const bgColors = ['#C3026A', '#2F1EFA', '#BBCDFE', '#FF12C5', '#DEA445'];

  return (
    <Bar
      className={className}
      options={{
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            stacked: true,
            display: false,
          },
          y: {
            display: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            onClick: () => {
              // do nothing
            },
          },
          tooltip: {
            enabled: true,
            mode: 'dataset',
            callbacks: {
              label: function (tooltipItem: TooltipItem<'bar'>) {
                return `${tooltipItem.dataset.data[0]}%`;
              },
            },
          },
        },
      }}
      data={{
        labels: ['Target Ratio', 'Current Ratio'],
        datasets: alpComposition.map((comp, i) => ({
          label: comp.token.name,
          minBarLength: 5,
          barThickness: 10,
          borderWidth: 0,
          data: [comp.targetRatio, comp.currentRatio],
          backgroundColor: bgColors[i % bgColors.length],
          stack: 'ratio',
        })),
      }}
    />
  );
}
