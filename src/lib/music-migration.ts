/* 27.09: the music studio's own projects merge into the hub's (spec §3, D4). A legacy project moves over only
   if it holds songs of different requests; «one song, one project» (the old default of the song form) doesn't,
   or the sidebar would fill with them. The seed «Демо» never moves: «Кофе у моря» goes to the demo project
   «Лендинг кофейни» (`coffee`) when there is one. A song whose project is gone loses the link. */
export type LegacyMusicProject = { id: string; name: string; createdAt: number; updatedAt: number }
type MigratableSong = { id: string; projectId?: string; title: string }

const DEMO_ID = "demo"
const DEMO_HOME: Record<string, string> = { "Кофе у моря": "coffee" }

export function migrateMusicProjects<S extends MigratableSong>(
  legacy: LegacyMusicProject[],
  songs: S[],
  existingIds: string[]
): { keep: LegacyMusicProject[]; songs: S[] } {
  const titlesOf = (id: string) => new Set(songs.filter((song) => song.projectId === id).map((song) => song.title))
  const keep = legacy.filter((project) => project.id !== DEMO_ID && !existingIds.includes(project.id) && titlesOf(project.id).size >= 2)
  const known = new Set([...existingIds, ...keep.map((project) => project.id)])
  const next = songs.map((song) => {
    if (song.projectId === DEMO_ID) {
      const home = DEMO_HOME[song.title]
      return { ...song, projectId: home && existingIds.includes(home) ? home : undefined }
    }
    return song.projectId && known.has(song.projectId) ? song : { ...song, projectId: undefined }
  })
  return { keep, songs: next }
}
