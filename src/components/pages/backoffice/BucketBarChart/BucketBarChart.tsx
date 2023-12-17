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

export default function BucketBarChart({
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
        options={{
          indexAxis: 'y',
          plugins: {
            legend: null,
            // Need to force typing as legend is not interpreted correctly
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        }}
        data={{
          labels: ['Allocation', 'Vested', 'Minted'],
          datasets: [
            {
              label: '',
              minBarLength: 1,
              barThickness: 5,
              data: [allocated, vested, minted],
              backgroundColor: ['#C3026A', '#2F1EFA', '#BBCDFE'],
              borderColor: ['white'],
              borderWidth: 0,
            },
          ],
        }}
      />
    </div>
  );
}
