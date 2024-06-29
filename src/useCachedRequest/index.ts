import React, { useContext, useEffect, useState } from "react";
import { CacheProviderProps } from "../CacheProvider";
import getFromCache from "../utils/functions/getFromCache";
import setToCache from "../utils/functions/setToCache";
import getDB from "../utils/functions/getDb";

export interface useCachedRequestProps<T = unknown> {
  /** the request to make to get the data if not found in indexdb */
  requestFn: () => Promise<T>;
  /** the key to store the data in indexdb */
  requestKey: string;
  /** whether to fetch data or not */
  enabled?: boolean;
}

export type ContextType = CacheProviderProps & {
  db: Awaited<ReturnType<typeof getDB>> | undefined;
};
export const CacheContext = React.createContext<ContextType | null>(null);

export default function useCachedRequest<T = unknown>({
  requestFn,
  requestKey,
  enabled = true,
}: useCachedRequestProps<T>) {
  const cacheContext = useContext(CacheContext);
  if (!cacheContext)
    throw new Error("Function must be called within CacheProvider");
  const { dbName, storeName, db } = cacheContext;
  const [data, setData] =
    useState<Awaited<ReturnType<typeof getFromCache<T>>>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      let cachedData = await getFromCache<T>({
        requestKey: requestKey,
        dbName,
        storeName,
        db,
      });
      if (cachedData) {
        setData(cachedData);
      } else {
        const dataValue = await requestFn();
        const data = await setToCache({
          requestKey,
          dataValue,
          dbName,
          storeName,
          db,
        });
        setData(data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  const invalidate = async () => {
    setLoading(true);
    try {
      const dataValue = await requestFn();
      const data = await setToCache({
        requestKey,
        dataValue,
        dbName,
        storeName,
        db,
      });
      setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    enabled && fetchData();
  }, [requestKey, requestFn, enabled]);

  return { data, loading, error, fetchData, invalidate };
}
