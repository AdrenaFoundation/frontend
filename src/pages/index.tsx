import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Home() {
  const router = useRouter();

  // Unused page
  // Redirect on dashboard
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return <main className={twMerge('w-full', 'h-full', 'flex', '')}></main>;
}
