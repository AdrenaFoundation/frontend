import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import OrcaLink from '@/components/pages/buy_alp_adx/OrcaLink/OrcaLink';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { PageProps, Token } from '@/types';

export type FeesAndAmountsType = {
  [tokenSymbol: string]: {
    token: Token;
    fees: number | null;
    amount: number | null;
    equivalentAmount: number | null;
  };
};

export default function BuyAdx({}: PageProps) {
  return (
    <div className="flex flex-col md:flex-row items-evenly justify-center gap-x-4 p-4">
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-50">
        <RiveAnimation
          animation="fred-bg"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          className="absolute top-0 left-0 h-[150vh] w-[220vh] scale-x-[-1]"
        />

        <RiveAnimation
          animation="fred-bg"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          className="absolute top-0 right-[-8em] h-[190vh] w-[180vh] scale-y-[-1]"
        />
      </div>

      <StyledContainer
        className="p-0 max-w-[35em]"
        titleClassName="p-0"
        bodyClassName="h-full"
        title={
          <div className="flex items-center absolute z-20 top-4 left-4">
            <Image
              src={window.adrena.client.adxToken.image}
              width={32}
              height={32}
              alt="ADX icon"
            />

            <div className="flex flex-col justify-start ml-2">
              <h1>ADX</h1>
              <span className="opacity-50">The Governance Token</span>
            </div>
          </div>
        }
      >
        <OrcaLink />
      </StyledContainer>
    </div>
  );
}
