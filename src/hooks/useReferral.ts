import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { UserProfileExtended } from '@/types';

const REFERRAL_STORAGE_KEY = 'adrena_referral_code';

export function useReferral(): {
  referrer: UserProfileExtended | null;
  clearReferral: () => void;
} {
  const router = useRouter();
  const [referrer, setReferrer] = useState<UserProfileExtended | null>(null);

  useEffect(() => {
    const loadReferrer = async () => {
      // Priority 1: Check URL parameter
      const urlReferral = router.query.referral;

      let referralCode: string | null = null;

      if (typeof urlReferral === 'string' && urlReferral.trim() !== '') {
        // Found in URL - save to session storage
        referralCode = urlReferral;
        sessionStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
        console.log('💾 Saved referral to session:', referralCode);
      } else {
        // Priority 2: Check session storage
        referralCode = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
        console.log('📦 Retrieved referral from session:', referralCode);
      }

      // If no referral code found, clear and return
      if (!referralCode) {
        setReferrer(null);
        return;
      }

      // Load referrer profile
      try {
        const profile =
          await window.adrena.client.loadUserProfileByNickname(referralCode);

        if (profile) {
          console.log('✅ Referrer profile loaded:', profile.nickname);
          setReferrer(profile);
        } else {
          console.log('⚠️ Referrer profile not found:', referralCode);
          // Clear invalid referral from storage
          sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
          setReferrer(null);
        }
      } catch (error) {
        console.log('❌ Error loading referrer profile:', error);
        sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
        setReferrer(null);
      }
    };

    loadReferrer();
  }, [router.query.referral]);

  const clearReferral = () => {
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    setReferrer(null);
    console.log('🗑️ Cleared referral from session');
  };

  return { referrer, clearReferral };
}
