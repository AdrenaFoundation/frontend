import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { PoolExtended } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function PositionsNow({
  mainPool,
  titleClassName,
  bodyClassName,
}: {
  mainPool: PoolExtended;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="POSITIONS NOW"
      className="w-auto grow"
      titleClassName={titleClassName}
    >
      <StyledSubContainer>
        <div className="flex items-center">
          <div className={titleClassName}>Position count</div>
          <div className="font-boldy text-sm ml-2 text-txtfade">
            Long / Short
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center pt-2 pb-2 sm:pt-0 sm:pb-0">
          <div className={bodyClassName}>
            {formatNumber(mainPool.nbOpenLongPositions, 0)}
          </div>

          <>
            <div className="ml-2 mr-2 text-5xl text-txtfade opacity-20 sm:block hidden">
              /
            </div>

            <div className="bg-bcolor w-full h-[1px] sm:hidden" />
          </>

          <div className={bodyClassName}>
            {formatNumber(mainPool.nbOpenShortPositions, 0)}
          </div>
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className="flex items-center">
          <div className={titleClassName}>Open Interest</div>
          <div className="font-boldy text-sm ml-2 text-txtfade">
            Long / Short
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center pt-2 pb-2 sm:pt-0 sm:pb-0">
          <div className={bodyClassName}>
            {formatPriceInfo(mainPool.longPositions)}
          </div>

          <>
            <div className="ml-2 mr-2 text-5xl text-txtfade opacity-20 sm:block hidden">
              /
            </div>

            <div className="bg-bcolor w-full h-[1px] sm:hidden" />
          </>

          <div className={bodyClassName}>
            {formatPriceInfo(mainPool.shortPositions)}
          </div>
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
