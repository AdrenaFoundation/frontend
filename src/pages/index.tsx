import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Home() {
  const router = useRouter();

  // Unused page
  // Redirect on trade
  useEffect(() => {
    router.push('/trade');
  }, [router]);

  return <main className='w-full h-full flex' />;
}
