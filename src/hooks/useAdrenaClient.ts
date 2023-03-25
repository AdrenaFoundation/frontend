import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { AdrenaClient } from "@/AdrenaClient";

const useAdrenaClient = () => {
  const { readOnly, readWrite } = useAdrenaProgram();
  const [client, setClient] = useState<AdrenaClient | null>(null);

  const createClient = useCallback(async () => {
    if (!readOnly) return;

    setClient(await AdrenaClient.initialize(readWrite, readOnly));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!readOnly, !!readWrite]);

  useEffect(() => {
    createClient();
  }, [createClient]);

  return client;
};

export default useAdrenaClient;
