/* Project icon tints (ChatGPT's palette, the user's reference 27.09). Stored as an id; the CSS value is a
   token (`--project-<id>` in index.css), so the palette follows the theme. No id = no tint (currentColor). */
export const PROJECT_COLOR_IDS = ["red", "orange", "yellow", "green", "blue", "purple", "pink"] as const
export type ProjectColor = (typeof PROJECT_COLOR_IDS)[number]

export const PROJECT_COLOR_NAMES: Record<ProjectColor, string> = {
  red: "Красный",
  orange: "Оранжевый",
  yellow: "Жёлтый",
  green: "Зелёный",
  blue: "Синий",
  purple: "Фиолетовый",
  pink: "Розовый",
}

/* Values stored before the tokens (27.09): hex and the primary. */
const LEGACY: Record<string, ProjectColor> = {
  "var(--primary)": "purple",
  "#ff5a5f": "red",
  "#ff9f1a": "orange",
  "#1fb35c": "green",
  "#2f80ff": "blue",
  "#e14fd0": "pink",
}

export function migrateColor(value: unknown): ProjectColor | undefined {
  if (typeof value !== "string") return undefined
  if ((PROJECT_COLOR_IDS as readonly string[]).includes(value)) return value as ProjectColor
  return LEGACY[value.toLowerCase()]
}

export const projectColor = (id?: ProjectColor) => (id ? `var(--project-${id})` : "currentColor")
