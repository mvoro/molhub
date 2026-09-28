export const MAX_PROJECT_FILES = 20
export const MAX_PROJECT_FILE_SIZE = 25 * 1024 * 1024

type Candidate = { name: string; size: number }
export type FileAddPlan<T extends Candidate> = { accepted: T[]; tooBig: T[]; overflow: T[] }

/* Which of the picked files go in: size first, then the room left in the project, in the order picked. */
export function planFileAdds<T extends Candidate>(existing: number, incoming: T[]): FileAddPlan<T> {
  const tooBig = incoming.filter((file) => file.size > MAX_PROJECT_FILE_SIZE)
  const fits = incoming.filter((file) => file.size <= MAX_PROJECT_FILE_SIZE)
  const room = Math.max(0, MAX_PROJECT_FILES - existing)
  return { accepted: fits.slice(0, room), tooBig, overflow: fits.slice(room) }
}

/* «1 файл», «3 файла», «11 файлов», «21 файл». */
export function filesWord(count: number) {
  const tens = count % 100
  const ones = count % 10
  if (tens >= 11 && tens <= 14) return "файлов"
  if (ones === 1) return "файл"
  if (ones >= 2 && ones <= 4) return "файла"
  return "файлов"
}

/* Toast texts for what didn't go in (§8): what happened + what to do. Nothing to say — empty list. */
export function fileAddMessages(plan: FileAddPlan<Candidate>): string[] {
  const messages = plan.tooBig.map((file) => `Не удалось добавить «${file.name}»: файл больше 25 МБ. Сожмите его или разделите на части.`)
  if (plan.overflow.length > 0) {
    const added = plan.accepted.length
    const total = added + plan.overflow.length
    messages.push(
      added === 0
        ? `В проекте уже ${MAX_PROJECT_FILES} файлов. Удалите ненужные, чтобы добавить новые.`
        : `${filesWord(added) === "файл" ? "Добавлен" : "Добавлено"} ${added} ${filesWord(added)} из ${total}: в проекте может быть до ${MAX_PROJECT_FILES} файлов. Удалите ненужные, чтобы добавить остальные.`
    )
  }
  return messages
}

/* «900 Б», «84 КБ», «1,2 МБ». */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",").replace(/,0$/, "")} МБ`
}
