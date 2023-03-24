import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { AdrenaClient } from "@/AdrenaClient";

const useAdrenaClient = () => {
  const adrenaProgram = useAdrenaProgram();
  const [client, setClient] = useState<AdrenaClient | null>(null);

  const createClient = useCallback(async () => {
    if (!adrenaProgram) return;

    setClient(new AdrenaClient(adrenaProgram));
  }, [adrenaProgram]);

  useEffect(() => {
    createClient();
  }, [createClient]);

  return client;
};

export default useAdrenaClient;
