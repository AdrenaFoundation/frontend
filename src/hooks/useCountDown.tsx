//Create a useCountDown hook that takes a from and a to date and returns the remaining time in seconds.

import { useEffect,useState } from 'react';

export default function useCountDown(from: Date, to: Date) {
  const [diffMs, setDiffMs] = useState<number>(to.getTime() - from.getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setDiffMs(to.getTime() - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [from, to]);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.round((diffMs % (1000 * 60)) / 1000);

  return {
    diffMs,
    days,
    hours,
    minutes,
    seconds,
  };
}
