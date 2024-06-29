import { ContextType } from "../../../useCachedRequest";
import getDB, { getDBProps } from "../getDb";

export interface getFromCacheProps extends getDBProps, Pick<ContextType, "db"> {
  requestKey: string;
}
export default async function getFromCache<T = unknown>({
  requestKey,
  dbName,
  storeName,
  db,
}: getFromCacheProps) {
  const database = db || (await getDB({ dbName, storeName }));
  const data = await database.get(storeName, requestKey);
  return data as { data: T; lastUpdated: string } | undefined;
}
