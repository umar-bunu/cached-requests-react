'use client';
import React, { useEffect, useState } from 'react';
import queryClient from '../queryClient';
import { CacheContext } from '../useCachedRequest';
import getDB from '../utils/functions/getDb';

export interface CacheProviderProps {
  dbName: string;
  storeName: string;
  children?: React.ReactNode;
  client?: queryClient;
}
export default function CacheProvider({
  dbName,
  storeName,
  children,
  client,
}: CacheProviderProps) {
  if (client) {
    client.invalidateQuery = async ({ requestKey }) => {
      const database = db || (await getDB({ dbName, storeName }));
      await database.delete(storeName, requestKey);
    };
    client.invalidateQueryies = async () => {
      const database = db || (await getDB({ dbName, storeName }));
      await database.clear(storeName);
    };
  }
  const [db, setdb] = useState<Awaited<ReturnType<typeof getDB>>>();

  useEffect(() => {
    (async () => {
      const dBase = await getDB({ dbName, storeName });
      setdb(dBase);
    })();
  }, [storeName, dbName]);

  return (
    <CacheContext.Provider value={{ storeName, dbName, db }}>
      {children}
    </CacheContext.Provider>
  );
}
