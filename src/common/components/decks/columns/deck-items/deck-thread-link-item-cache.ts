import setupIndexedDB, { useIndexedDBStore } from "use-indexeddb";

setupIndexedDB({
  databaseName: "ecency_d",
  version: 1,
  stores: [
    {
      name: "d_tpi",
      id: { keyPath: "id", autoIncrement: true },
      indices: [
        { name: "link", keyPath: "link" },
        { name: "title", keyPath: "title" },
        { name: "description", keyPath: "description" },
        { name: "image", keyPath: "image" }
      ]
    }
  ]
})
  .then(() => console.debug("Thread link items caches started!"))
  .catch(() => console.error("Failed to start thread link items caches."));

export function useDeckThreadLinkItemCache() {
  const { add, getOneByKey } = useIndexedDBStore<Record<string, string>>("d_tpi");

  const getFromCache = (link: string) => getOneByKey("link", link);

  const addToCache = (link: string, extraData: any) =>
    add({
      link,
      ...extraData
    });

  return { getFromCache, addToCache };
}
