import { InitOptions, loadSpace, SpaceApi } from '@usersnap/browser';
import React, { useContext, useEffect, useState } from 'react';

import { USERSNAP_GLOBAL_API_KEY } from './constant';

export const UsersnapContext = React.createContext<SpaceApi | null>(null);

export const UsersnapProvider = ({
  initParams,
  children,
}: UsersnapProviderProps) => {
  const [usersnapApi, setUsersnapApi] = useState<SpaceApi | null>(null);

  useEffect(() => {
    loadSpace(USERSNAP_GLOBAL_API_KEY).then((api: SpaceApi) => {
      api.init(initParams);
      setUsersnapApi(api);
    });
  }, [initParams]);

  return (
    <UsersnapContext.Provider value={usersnapApi}>
      {children}
    </UsersnapContext.Provider>
  );
};

interface UsersnapProviderProps {
  initParams?: InitOptions;
  children: React.ReactNode;
}

export function useUsersnapApi() {
  return useContext(UsersnapContext);
}
