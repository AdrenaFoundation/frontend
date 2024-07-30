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
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';

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
  const bucketColors = ['#ff4069f0', '#f9df65f0', '#3b82f6f0', '#07956bf0'];

  return (
    <StyledContainer
      title="TOKENOMIC"
      headerClassName="ml-auto mr-auto"
      className="w-auto grow"
      titleClassName={titleClassName}
    >
      <StyledSubSubContainer className="flex-col items-center">
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

        <div className="w-full max-w-[25em] h-[25em]">
          <Pie
            color="#ffffff"
            options={{
              cutout: '50%',
              responsive: true,
              plugins: {
                legend: {
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
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
