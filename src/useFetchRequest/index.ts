import { useContext } from 'react';
import { CacheContext, useCachedRequestProps } from '../useCachedRequest';
import getFromCache from '../utils/functions/getFromCache';
import setToCache from '../utils/functions/setToCache';

export interface useFetchRequestProps<T = unknown>
  extends Omit<useCachedRequestProps<T>, 'enabled'> {
  /** In seconds
   * @default 60
   */
  cacheTime?: number;
}

export default function useFetchRequest<T>({
  requestFn,
  requestKey,
  cacheTime = 60,
}: useFetchRequestProps<T>) {
  const context = useContext(CacheContext);
  if (!context) throw new Error('Function must be called within CacheProvider');
  const { dbName, storeName, db } = context;

  async function fetchData() {
    const cachedData = await getFromCache<T>({
      requestKey: requestKey,
      dbName,
      storeName,
      db,
    });
    const haxExpired = !cachedData?.lastUpdated
      ? true
      : Date.now() - new Date(cachedData.lastUpdated).getTime() >
        cacheTime * 1000;

    if (cachedData && !haxExpired) return cachedData;
    const dataValue = await requestFn();
    const newData = await setToCache({
      requestKey,
      dataValue,
      dbName,
      storeName,
      db,
    });
    return newData;
  }
  return { fetchData };
}
