/* A chat's title from its first message (the same rule as the new chat's, new-chat.tsx). */
export function titleFrom(text: string): string {
  const line = text.replace(/\s+/g, " ").trim()
  if (line.length <= 40) return line
  const cut = line.slice(0, 40)
  const space = cut.lastIndexOf(" ")
  return `${(space > 24 ? cut.slice(0, space) : cut).replace(/[\s,.;:!?—-]+$/, "")}…`
}
