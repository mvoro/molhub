import { migrateColor, type ProjectColor } from "./project-colors.ts"

/* A project as it may sit in localStorage: older builds kept hex colours and no dates. */
export type StoredProject = {
  id: string
  name: string
  description?: string
  color?: unknown
  icon?: string
  instructions?: string
  files?: unknown[]
  archived?: boolean
  createdAt?: number
  updatedAt?: number
}
export type NormalizedProject = Omit<StoredProject, "color" | "createdAt" | "updatedAt"> & {
  color?: ProjectColor
  createdAt: number
  updatedAt: number
}

export const needsNormalize = (raw: StoredProject) =>
  typeof raw.createdAt !== "number" || typeof raw.updatedAt !== "number" || (raw.color !== undefined && migrateColor(raw.color) !== raw.color)

/* Dateless projects get 0: they sort last and show no date. */
export function normalizeProject(raw: StoredProject): NormalizedProject {
  const { color, createdAt, updatedAt, ...rest } = raw
  const next: NormalizedProject = { ...rest, createdAt: createdAt ?? 0, updatedAt: updatedAt ?? 0 }
  const id = migrateColor(color)
  if (id) next.color = id
  return next
}
