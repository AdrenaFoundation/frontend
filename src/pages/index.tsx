import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Unused page, redirect to /genesis for now

  useEffect(() => {
    const isGenesis = process.env.NEXT_PUBLIC_IS_GENESIS === 'true';

    if (window.location.pathname !== '/genesis' && isGenesis) {
      router.push('/genesis');
    } else {
      router.push('/trade');
    }
  }, [window.location.pathname]);

  return <main className="w-full h-full flex" />;
}
