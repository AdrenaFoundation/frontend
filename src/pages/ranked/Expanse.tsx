import { useEffect, useMemo, useState } from 'react';

import Leaderboards from '../../components/pages/ranked/expanse/ExpanseLeaderboards';
import Quests from '../../components/pages/ranked/Quests';

export default function Expanse() {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'mechanics'>(
    'leaderboard',
  );

  // Page loading
  useEffect(() => {
    let searchParamsView = searchParams.get('view') ?? 'leaderboard';

    if (!['leaderboard', 'mechanics'].includes(searchParamsView)) {
      searchParamsView = 'leaderboard';
    }

    setActiveTab(searchParamsView as 'leaderboard' | 'mechanics');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save in URL
  useEffect(() => {
    searchParams.set('view', activeTab);

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${searchParams.toString()}`,
    );
  }, [activeTab, searchParams]);

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 relative flex flex-col pb-4">
      {activeTab === 'leaderboard' ? <Leaderboards /> : <Quests />}
    </div>
  );
}
