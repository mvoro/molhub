export const MAX_CAROUSEL_REFERENCES = 5
export const MAX_CAROUSEL_REFERENCE_BYTES = 15 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const REFERENCE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
const DATABASE = 'ai-hub-carousel-references-v1'
const STORE = 'photos'

export interface CarouselReference {
  id: string
  name: string
  type: string
  size: number
  width: number
  height: number
}

export function isCarouselReferenceId(id: unknown): id is string {
  return typeof id === 'string' && REFERENCE_ID.test(id)
}

/** A reference stores only trusted metadata, never a URL or filesystem path. */
export function normalizeCarouselReference(input: unknown): CarouselReference | null {
  const value = input as Partial<CarouselReference> | null
  // Control characters and separators are intentionally rejected in filenames.
  // eslint-disable-next-line no-control-regex
  if (!value || !isCarouselReferenceId(value.id) || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 240 || /[\\/\u0000-\u001f\u007f]/u.test(value.name)) return null
  if (typeof value.type !== 'string' || typeof value.size !== 'number' || !IMAGE_TYPES.has(value.type) || !Number.isInteger(value.size) || value.size < 1 || value.size > MAX_CAROUSEL_REFERENCE_BYTES) return null
  if (typeof value.width !== 'number' || typeof value.height !== 'number' || !Number.isInteger(value.width) || !Number.isInteger(value.height) || value.width < 128 || value.height < 128 || value.width * value.height > 48_000_000) return null
  return { id: value.id, name: value.name, type: value.type, size: value.size, width: value.width, height: value.height }
}

function imageType(file: { type?: string; name?: string }): string {
  if (file?.type) return file.type.toLowerCase()
  const extension = file?.name?.split('.').pop()?.toLowerCase()
  return extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : ''
}

export function validateCarouselReferenceFiles(files: ArrayLike<{ type?: string; name?: string; size: number }> | Iterable<{ type?: string; name?: string; size: number }>, existingCount = 0): string {
  const batch = Array.from(files || [])
  if (!Number.isInteger(existingCount) || existingCount < 0 || batch.length + existingCount > MAX_CAROUSEL_REFERENCES) return 'Можно прикрепить до 5 фото-референсов.'
  if (batch.some(file => !IMAGE_TYPES.has(imageType(file)))) return 'Выберите фотографии в формате JPG, PNG или WebP.'
  if (batch.some(file => !Number.isFinite(file?.size) || file.size <= 0 || file.size > MAX_CAROUSEL_REFERENCE_BYTES)) return 'Каждое фото должно весить не больше 15 МБ.'
  return ''
}

async function dimensions(file: Blob): Promise<{ width: number; height: number }> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  const actualType = jpeg ? 'image/jpeg' : png ? 'image/png' : webp ? 'image/webp' : ''
  if (!actualType || file.type !== actualType) throw new Error('Не удалось прочитать фото. Выберите JPG, PNG или WebP.')
  if (typeof createImageBitmap === 'function') {
    const picture = await createImageBitmap(file)
    try { return { width: picture.width, height: picture.height } } finally { picture.close() }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const picture = new Image()
      picture.onload = () => resolve({ width: picture.naturalWidth, height: picture.naturalHeight })
      picture.onerror = () => reject(new Error('Не удалось прочитать фото. Выберите другой файл.'))
      picture.src = url
    })
  } finally { URL.revokeObjectURL(url) }
}

function openReferenceStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('Браузер не поддерживает сохранение фото-референсов.')); return }
    let blocked = false
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE) }
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return }
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(new Error('Не удалось открыть хранилище фото. Проверьте настройки браузера.'))
    request.onblocked = () => { blocked = true; reject(new Error('Закройте другие вкладки приложения и попробуйте загрузить фото снова.')) }
  })
}

async function referenceTransaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openReferenceStore()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode)
      const request = operation(transaction.objectStore(STORE))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = transaction.onabort = () => reject(new Error('Не удалось сохранить или прочитать фото в браузере. Проверьте свободное место и попробуйте снова.'))
    })
  } finally { database.close() }
}

function referenceId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  // UUID identifiers also work on a phone opening the development host over HTTP.
  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes)
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export async function saveCarouselReference(file: File): Promise<CarouselReference> {
  const error = validateCarouselReferenceFiles([file])
  if (error) throw new Error(error)
  const type = imageType(file)
  const blob = file.type === type ? file : file.slice(0, file.size, type)
  let size: { width: number; height: number }
  try { size = await dimensions(blob) } catch { throw new Error('Не удалось прочитать фото. Выберите другой файл в формате JPG, PNG или WebP.') }
  if (size.width < 128 || size.height < 128) throw new Error('Выберите фото размером от 128 × 128 пикселей.')
  if (size.width * size.height > 48_000_000) throw new Error('Фото слишком большое. Выберите изображение до 48 мегапикселей.')
  // eslint-disable-next-line no-control-regex -- Sanitize filenames before storing display metadata.
  const metadata = { id: referenceId(), name: String(file.name || 'Фото-референс').replace(/[\\/\u0000-\u001f\u007f]/gu, '-').slice(0, 240) || 'Фото-референс', type, size: file.size, ...size }
  await referenceTransaction('readwrite', store => store.put(blob, metadata.id))
  return metadata
}

export async function readCarouselReference(id: string): Promise<Blob | null> {
  if (!isCarouselReferenceId(id)) return null
  const value = await referenceTransaction('readonly', store => store.get(id))
  return value instanceof Blob ? value : null
}

/** Call only when no draft, saved result, or pending editor refers to this identifier. */
export async function deleteCarouselReference(id: string): Promise<void> {
  if (!isCarouselReferenceId(id)) return
  await referenceTransaction('readwrite', store => store.delete(id))
}

/** Roll back successful writes if a later file in the selected batch is invalid. */
export async function saveCarouselReferences(files: ArrayLike<File> | Iterable<File>, existingCount = 0): Promise<CarouselReference[]> {
  const batch = Array.from(files)
  const error = validateCarouselReferenceFiles(batch, existingCount)
  if (error) throw new Error(error)
  const saved: CarouselReference[] = []
  try {
    for (const file of batch) saved.push(await saveCarouselReference(file))
    return saved
  } catch (reason) {
    await Promise.allSettled(saved.map(reference => deleteCarouselReference(reference.id)))
    throw reason
  }
}
