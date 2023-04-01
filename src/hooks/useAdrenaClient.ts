import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { AdrenaClient } from "@/AdrenaClient";

const useAdrenaClient = (): AdrenaClient | null => {
  const { program, readOnlyProgram } = useAdrenaProgram();
  const [client, setClient] = useState<AdrenaClient | null>(null);

  const createClient = useCallback(async () => {
    if (!readOnlyProgram) return;

    setClient(await AdrenaClient.initialize(readOnlyProgram));
  }, [readOnlyProgram]);

  useEffect(() => {
    createClient();
  }, [createClient]);

  useEffect(() => {
    if (!client) return;

    client.setAdrenaProgram(program);
  }, [client, program]);

  return client;
};

export default useAdrenaClient;
