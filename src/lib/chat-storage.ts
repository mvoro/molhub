import type { ChatMessage } from "../hooks/use-chat-messages"

const DB = "ai-hub-chat"
const THREADS = "threads"
const FILES = "files"
const blobs = new Map<string, Blob>()

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(THREADS)
      request.result.createObjectStore(FILES)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(store: string, mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode)
    const request = work(transaction.objectStore(store))
    transaction.oncomplete = () => { db.close(); resolve(request.result) }
    transaction.onerror = transaction.onabort = () => { db.close(); reject(transaction.error) }
  })
}

// The in-memory copy is acquired synchronously before the composer revokes its own preview URL.
export function keepChatFile(id: string, blob: Blob) {
  blobs.set(id, blob)
  return run(FILES, "readwrite", (store) => store.put(blob, id))
}

export async function readChatFile(id: string): Promise<Blob | null> {
  if (blobs.has(id)) return blobs.get(id)!
  const blob = await run<Blob | undefined>(FILES, "readonly", (store) => store.get(id))
  if (blob) blobs.set(id, blob)
  return blob ?? null
}

export const readChatThread = (id: string) => run<ChatMessage[] | undefined>(THREADS, "readonly", (store) => store.get(id))
export const saveChatThread = (id: string, messages: ChatMessage[]) => run(THREADS, "readwrite", (store) => store.put(messages, id))

export async function removeChatThread(id: string, messages: ChatMessage[]) {
  const saved = await readChatThread(id)
  const fileIds = new Set([...messages, ...(saved ?? [])].flatMap((message) => message.role === "user" ? message.attachments?.map((file) => file.id) ?? [] : []))
  const db = await open()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([THREADS, FILES], "readwrite")
    transaction.objectStore(THREADS).delete(id)
    for (const fileId of fileIds) { blobs.delete(fileId); transaction.objectStore(FILES).delete(fileId) }
    transaction.oncomplete = () => { db.close(); resolve() }
    transaction.onerror = transaction.onabort = () => { db.close(); reject(transaction.error) }
  })
}
