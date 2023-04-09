import { Connection } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';

import useAdrenaProgram from './useAdrenaProgram';

const useAdrenaClient = (
  connection: Connection | null,
): AdrenaClient | null => {
  const { program, readOnlyProgram } = useAdrenaProgram(connection);
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
