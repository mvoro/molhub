import { format, isSameDay, isSameYear, subDays } from "date-fns"
import { ru } from "date-fns/locale"

/* Dates in project lists (ChatGPT): today — the time, then «вчера», then the day and month, then the year. */
export function formatListDate(ts: number | undefined, now: number = Date.now()): string {
  if (!ts) return ""
  const date = new Date(ts)
  const today = new Date(now)
  if (isSameDay(date, today)) return format(date, "HH:mm")
  if (isSameDay(date, subDays(today, 1))) return "вчера"
  if (isSameYear(date, today)) return format(date, "d MMM", { locale: ru })
  return format(date, "d MMM yyyy", { locale: ru })
}
