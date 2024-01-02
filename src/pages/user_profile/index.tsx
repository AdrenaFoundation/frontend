import OwnerBloc from '@/components/pages/user_profile/OwnerBloc';
import PositionsStatsBloc from '@/components/pages/user_profile/PositionsStatsBloc';
import SwapStatsBloc from '@/components/pages/user_profile/SwapStatsBloc';
import { PageProps } from '@/types';

export default function UserProfile({ userProfile }: PageProps) {
  if (userProfile === null) {
    return <>Loading ...</>;
  }

  if (userProfile === false) {
    return <>User profile not created</>;
  }

  return (
    <div className="flex flex-wrap">
      <div className="flex m-2 w-[26em] min-w-[26em] grow border border-gray-400 shadow-lg shadow-[#ffffff50] p-8 justify-center">
        <OwnerBloc
          userProfile={userProfile}
          className="min-w-[24em] w-[24em] max-w-[24em] items-start"
        />
      </div>

      <div className="flex flex-col w-[40em] min-w-[26em] grow m-2 border border-gray-400 shadow-lg shadow-[#ffffff50]">
        <SwapStatsBloc userProfile={userProfile} className="grow p-4" />

        <PositionsStatsBloc userProfile={userProfile} className="grow p-4" />
      </div>
    </div>
  );
}
