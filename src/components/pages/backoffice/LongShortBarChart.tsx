import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function LongShortBarChart({
  oiLongUsd,
  oiShortUsd,
  className,
}: {
  oiLongUsd: number;
  oiShortUsd: number;
  className?: string;
}) {
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
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        labels: [''],
        datasets: [
          {
            label: 'Long',
            minBarLength: 5,
            barThickness: 10,
            borderWidth: 0,
            data: [oiLongUsd],
            backgroundColor: ['#45a34e'],
            stack: 'positions',
          },
          {
            label: 'Short',
            minBarLength: 5,
            barThickness: 10,
            borderWidth: 0,
            data: [oiShortUsd],
            backgroundColor: ['#c13232'],
            stack: 'positions',
          },
        ],
      }}
    />
  );
}
