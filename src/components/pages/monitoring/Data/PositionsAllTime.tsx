import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { PoolExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function PositionsAllTime({
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
      className="w-auto grow"
      title="ALL TIME POSITIONS"
      titleClassName={titleClassName}
    >
      <StyledSubContainer>
        <div className="flex items-center">
          <div className={titleClassName}>Open Interest</div>
          <div className="font-boldy text-sm ml-2 text-txtfade">
            Long / Short
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center pt-2 pb-2 sm:pt-0 sm:pb-0">
          <div className={bodyClassName}>
            {formatPriceInfo(mainPool.oiLongUsd)}
          </div>

          <>
            <div className="ml-2 mr-2 text-5xl text-txtfade opacity-20 sm:block hidden">
              /
            </div>

            <div className="bg-bcolor w-full h-[1px] sm:hidden" />
          </>

          <div className={bodyClassName}>
            {formatPriceInfo(mainPool.oiShortUsd)}
          </div>
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className="flex items-center">
          <div className={titleClassName}>Profits and Losses</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center pt-2 pb-2 sm:pt-0 sm:pb-0">
          <div className={bodyClassName}>
            {formatPriceInfo(mainPool.profitsUsd)}
          </div>

          <>
            <div className="ml-2 mr-2 text-5xl text-txtfade opacity-20 sm:block hidden">
              /
            </div>

            <div className="bg-bcolor w-full h-[1px] sm:hidden" />
          </>

          <div className={bodyClassName}>
            {formatPriceInfo(mainPool.lossUsd * -1)}
          </div>
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
