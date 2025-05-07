import { useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';

export default function useAPR(): {
  aprs: {
    lp: number;
    lm: number;
  } | null;
} {
  const [aprs, setAprs] = useState<{
    lp: number;
    lm: number;
  } | null>(null);

  useEffect(() => {
    DataApiClient.getRolling7DGlobalApr()
      .then(({ lp_apr_rolling_seven_day, lm_apr_rolling_seven_day }) => {
        setAprs({
          lp: lp_apr_rolling_seven_day,
          lm: lm_apr_rolling_seven_day,
        });
      })
      .catch(() => {
        // Ignore
      });

    const interval = setInterval(() => {
      DataApiClient.getRolling7DGlobalApr()
        .then(({ lp_apr_rolling_seven_day, lm_apr_rolling_seven_day }) => {
          setAprs({
            lp: lp_apr_rolling_seven_day,
            lm: lm_apr_rolling_seven_day,
          });
        })
        .catch(() => {
          // Ignore
        });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { aprs };
}
