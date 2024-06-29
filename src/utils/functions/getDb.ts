import { openDB } from "idb";
import { CacheProviderProps } from "../../CacheProvider";

export interface getDBProps extends CacheProviderProps {}
export default async function getDB({ dbName, storeName }: getDBProps) {
  return openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    },
  });
}
