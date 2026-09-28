/* Project files' contents live in IndexedDB (localStorage can't hold them); the hub keeps the list. Native API,
   one store, keyed by the file's id. Every call opens the database afresh — calls are rare. */
const DB = "ai-hub"
const STORE = "project-files"

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const request = work(tx.objectStore(STORE))
        tx.oncomplete = () => {
          db.close()
          resolve(request ? request.result : undefined)
        }
        tx.onerror = tx.onabort = () => {
          db.close()
          reject(tx.error)
        }
      })
  )
}

export const putFile = (id: string, blob: Blob) => run("readwrite", (store) => store.put(blob, id)).then(() => undefined)
export const getFile = (id: string) => run<Blob>("readonly", (store) => store.get(id)).then((blob) => blob ?? null).catch(() => null)
export const hasFile = (id: string) => run<number>("readonly", (store) => store.count(id)).then((n) => (n ?? 0) > 0).catch(() => false)
export const deleteFiles = (ids: string[]) =>
  ids.length === 0 ? Promise.resolve() : run("readwrite", (store) => void ids.forEach((id) => store.delete(id))).then(() => undefined).catch(() => undefined)
