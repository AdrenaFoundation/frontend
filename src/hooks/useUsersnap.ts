import { loadSpace } from '@usersnap/browser';
import { useEffect } from 'react';

import { USERSNAP_GLOBAL_API_KEY } from '../constant';

const useUsersnap = () => {
  useEffect(() => {
    loadSpace(USERSNAP_GLOBAL_API_KEY).then((api) => {
      api.init();
    });
  }, []);
};

export default useUsersnap;
