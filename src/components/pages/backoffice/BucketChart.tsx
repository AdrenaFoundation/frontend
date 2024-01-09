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

export default function BucketChart({
  allocated,
  vested,
  minted,
}: {
  allocated: number;
  vested: number;
  minted: number;
}) {
  return (
    <div>
      <Bar
        height={80}
        options={{
          indexAxis: 'y',
          scales: {
            x: {
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
              label: 'Allocation',
              minBarLength: 5,
              barThickness: 10,
              data: [allocated],
              backgroundColor: ['#C3026A'],
            },
            {
              label: 'Vested',
              minBarLength: 5,
              barThickness: 10,
              data: [vested],
              backgroundColor: ['#2F1EFA'],
            },
            {
              label: 'Minted',
              minBarLength: 5,
              barThickness: 10,
              data: [minted],
              backgroundColor: ['#BBCDFE'],
            },
          ],
        }}
      />
    </div>
  );
}
