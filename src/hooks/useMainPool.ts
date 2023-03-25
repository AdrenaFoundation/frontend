import { useCallback, useEffect, useState } from "react";
import { Pool } from "@/types";
import useAdrenaClient from "./useAdrenaClient";

// TODO: Reload periodically?
const useMainPool = (): Pool | null => {
  const client = useAdrenaClient();

  const [mainPool, setMainPool] = useState<Pool | null>(null);

  const fetchMainPool = useCallback(async () => {
    if (!client) return;

    setMainPool(client.mainPool);
  }, [client]);

  useEffect(() => {
    fetchMainPool();
  }, [fetchMainPool]);

  return mainPool;
};

export default useMainPool;
