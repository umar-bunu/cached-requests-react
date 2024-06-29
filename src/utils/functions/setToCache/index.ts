import { ContextType } from "../../../useCachedRequest";
import getDB from "../getDb";
import { getFromCacheProps } from "../getFromCache";

export interface setToCacheProps<T = any>
  extends getFromCacheProps,
    Pick<ContextType, "db"> {
  dataValue: T;
}
export default async function setToCache<T = unknown>({
  requestKey: dataKey,
  storeName,
  db,
  dbName,
  dataValue,
}: setToCacheProps<T>) {
  let database = db || (await getDB({ dbName, storeName }));
  const data2Put = {
    data: dataValue,
    lastUpdated: new Date().toISOString(),
  } as const;

  await database.put(storeName, data2Put, dataKey);
  return data2Put;
}
