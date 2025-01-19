import { useEffect,useState } from 'react';

const useTimer = (targetDate: Date) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    let timeLeft = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365)),
        months: Math.floor(
          (difference % (1000 * 60 * 60 * 24 * 365)) /
            (1000 * 60 * 60 * 24 * 30),
        ),
        days: Math.floor(
          (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24),
        ),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export default useTimer;
