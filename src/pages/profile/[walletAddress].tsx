import { useRouter } from 'next/router';

import Loader from '@/components/Loader/Loader';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { WALLPAPERS } from '@/constant';
import useUserProfile from '@/hooks/auth-profile/useUserProfile';

export default function ViewOnlyProfile() {
  const router = useRouter();
  const { walletAddress } = router.query;

  const { userProfile, isUserProfileLoading } = useUserProfile(
    (walletAddress as string) ?? null,
  );

  if (userProfile === null || userProfile === false) {
    return (
      <div className="flex flex-col max-w-[65em] gap-4 p-4 w-full h-full self-center">
        <p>No user profile found</p>
      </div>
    );
  }

  if (isUserProfileLoading) {
    return (
      <div className="flex flex-col max-w-[65em] gap-4 p-4 w-full h-full self-center">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: userProfile
          ? `url(${WALLPAPERS[userProfile.wallpaper]})`
          : `url(${WALLPAPERS[0]})`,
      }}
    >
      <ViewProfileModal profile={userProfile} close={() => {}} />
    </div>
  );
}
