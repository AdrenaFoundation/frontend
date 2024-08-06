import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import ChartPluginAnnotation from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  ChartPluginAnnotation,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Tokenomics({
  titleClassName,
}: {
  titleClassName?: string;
}) {
  const bucketsLabels = ['Core Contrib.', 'DAO Treasury', 'POL', 'Ecosystem'];
  const bucketColors = ['#9f8cae', '#edb40e', '#eb6672', '#7fd7c1'];

  return (
    <StyledContainer
      title="TOKENOMIC"
      headerClassName="ml-auto mr-auto"
      className="grow max-w-[40em] w-[30em]"
      titleClassName={titleClassName}
    >
      <div className="flex gap-6 justify-evenly mb-4">
        {bucketsLabels.map((name, i) => (
          <h3 key={name} className="flex flex-col">
            <div
              className="h-[3px] w-full"
              style={{
                backgroundColor: bucketColors[i],
              }}
            ></div>
            <span className="text-sm">{name}</span>
          </h3>
        ))}
      </div>

      <div className="w-[20em] h-full flex items-center justify-center m-auto">
        <Pie
          color="#ffffff"
          options={{
            cutout: '80%',
            responsive: true,
            plugins: {
              legend: {
                display: false,
                labels: {
                  color: '#ffffff',
                  padding: 14,
                },
                position: 'bottom',
              },
              datalabels: {
                display: false,
              },
            },
          }}
          data={{
            labels: [
              // Core contributors
              'Launch Team',
              'Investors',

              // DAO Treasury Reserves
              'DAO Treasury Reserves',

              // POL
              'Liquidity Provision',

              // Ecosystem
              'Community Grants',
              'Partnerships/Marketing/Airdrop',
              'LM - Staked ADX',
              'LM - ALP',
              'LM - Genesis',
              'Development Fund',
            ],
            datasets: [
              {
                label: '%',
                data: [21.33, 14.67, 10, 8, 10, 10, 15, 5, 2, 4],
                borderWidth: 2,
                backgroundColor: [
                  // Core contributors
                  bucketColors[0],
                  bucketColors[0],

                  // DAO Treasury Reserves
                  bucketColors[1],

                  // POL
                  bucketColors[2],

                  // Ecosystem
                  bucketColors[3],
                  bucketColors[3],
                  bucketColors[3],
                  bucketColors[3],
                  bucketColors[3],
                  bucketColors[3],
                ],
              },
            ],
          }}
        />
      </div>
    </StyledContainer>
  );
}
