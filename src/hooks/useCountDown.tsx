import { useEffect, useState } from 'react';

export default function useCountDown(from: Date, to: Date) {
  const [diffMs, setDiffMs] = useState<number>(to.getTime() - from.getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setDiffMs(to.getTime() - new Date().getTime());
    }, 500);

    return () => clearInterval(interval);
  }, [from, to]);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const hours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  ).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  const minutes = Math.round(
    (diffMs % (1000 * 60 * 60)) / (1000 * 60),
  ).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  const seconds = Math.round((diffMs % (1000 * 60)) / 1000).toLocaleString(
    undefined,
    {
      minimumIntegerDigits: 2,
      useGrouping: false,
    },
  );

  return {
    diffMs,
    days,
    hours,
    minutes,
    seconds,
  };
}
