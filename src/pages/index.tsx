import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Unused page
  // Redirect on trade
  useEffect(() => {
    router.push('/trade');
  }, [router]);

  return <main className="w-full h-full flex mb-10" />;
}
