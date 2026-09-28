import { clientId } from "@/lib/client-id"
import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

import { COVERS, SEED_SONGS, type Song } from "@/data/music"
import { useHub } from "@/hooks/use-hub"
import { isProjectFeedVisible } from "@/hooks/use-media-feed"
import { useStoredState } from "@/hooks/use-stored-state"
import { migrateMusicProjects, type LegacyMusicProject } from "@/lib/music-migration"

/* The music studio's songs, mirrored to localStorage until the API lands. Projects are the hub's (27.09,
   spec D4): a song names one by `projectId`, or none («Без проекта»). Lives above the workspace, so a song
   keeps «generating» while the user is elsewhere; when it lands off-screen, a toast offers to open it.
   Playback is a mock: one song is «playing» (its cover shows the equalizer), there is no audio yet. */

type NewSongs = Pick<Song, "model" | "prompt" | "settings"> & {
  /* A hub project, or null for «Без проекта». */
  projectId: string | null
  title: string
  tags: string
}

type Music = {
  songs: Song[]
  playingId: string | null
  /* Suno answers with two takes of every request: both appear at once and land a few seconds apart. */
  createSongs: (request: NewSongs) => void
  renameSong: (id: string, title: string) => void
  deleteSong: (id: string) => void
  /* «Добавить в проект» / «Убрать из проекта» on one song (D9). */
  setSongProject: (id: string, projectId: string | undefined) => void
  togglePlay: (id: string) => void
  /* The studio says when it is on screen, so finished songs toast only when it isn't. */
  setStudioVisible: (visible: boolean) => void
}

/* The studio's own projects before 27.09; merged into the hub's once, then removed. Storage can be missing or
   blocked (private windows, site data off): then there's nothing to migrate. */
const LEGACY_KEY = "ai-hub:music-projects"
const readLegacy = () => {
  try {
    return window.localStorage.getItem(LEGACY_KEY)
  } catch {
    return null
  }
}
const dropLegacy = () => {
  try {
    window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* blocked — nothing was read either */
  }
}

const MusicContext = React.createContext<Music | null>(null)

const newId = (prefix: string) =>
  `${prefix}${clientId()}`

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

export function MusicProvider({
  onOpenStudio,
  onOpenProject,
  children,
}: {
  onOpenStudio: () => void
  onOpenProject: (projectId: string) => void
  children: React.ReactNode
}) {
  const hub = useHub()
  const { authenticated } = useAuth()
  // Timers don't survive a reload: anything still «generating» from last time has finished by now.
  const [songs, setSongs] = useStoredState<Song[]>("ai-hub:music-songs", SEED_SONGS)
  const [settled, setSettled] = React.useState(false)
  if (!settled) {
    setSettled(true)
    if (songs.some((song) => song.status === "generating")) {
      setSongs((prev) => prev.map((song) => (song.status === "generating" ? { ...song, status: "ready", duration: 180 } : song)))
    }
  }
  const [playingId, setPlayingId] = React.useState<string | null>(null)
  const studioVisible = React.useRef(false)
  const timers = React.useRef<number[]>([])
  React.useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  // Timers and toasts outlive the render that started them: they read the latest through refs.
  const latest = React.useRef({ hub, songs, onOpenStudio, onOpenProject })
  React.useEffect(() => {
    latest.current = { hub, songs, onOpenStudio, onOpenProject }
  })

  // 27.09: the studio's own projects merge into the hub's (lib/music-migration.ts). Runs once — the old key
  // is gone after, so StrictMode's second run finds nothing. `migrated` holds back the check below until
  // the imported projects and the relinked songs land together.
  const [migrated, setMigrated] = React.useState(() => readLegacy() === null)
  React.useEffect(() => {
    if (!authenticated) return
    const raw = readLegacy()
    if (raw === null) return
    const { hub: current, songs: stored } = latest.current
    try {
      const legacy = JSON.parse(raw) as LegacyMusicProject[]
      const { keep, songs: next } = migrateMusicProjects(legacy, stored, current.projects.map((project) => project.id))
      current.importProjects(keep.map(({ id, name, createdAt, updatedAt }) => ({ id, name, createdAt, updatedAt })))
      setSongs(next)
    } catch {
      /* unreadable — the check below unlinks songs whose project isn't in the hub */
    } finally {
      dropLegacy()
      setMigrated(true)
    }
  }, [setSongs, authenticated])

  // A song whose project is gone (deleted from the sidebar, the project page or the archive) loses the link;
  // it stays in the studio under «Без проекта» (D10).
  const known = React.useMemo(() => new Set(hub.projects.map((project) => project.id)), [hub.projects])
  React.useEffect(() => {
    if (!authenticated || !migrated || !songs.some((song) => song.projectId && !known.has(song.projectId))) return
    setSongs((prev) => prev.map((song) => (song.projectId && !known.has(song.projectId) ? { ...song, projectId: undefined } : song)))
  }, [authenticated, migrated, known, songs, setSongs])

  const value = React.useMemo<Music>(
    () => ({
      songs: authenticated ? songs : [],
      playingId: authenticated ? playingId : null,
      createSongs: ({ projectId, title, tags, model, prompt, settings }) => {
        const now = Date.now()
        const takes: Song[] = [0, 1].map((take) => ({
          id: newId("s"),
          projectId: projectId ?? undefined,
          title,
          tags,
          model,
          prompt,
          settings,
          cover: pick(COVERS),
          duration: 0,
          status: "generating",
          createdAt: now + take,
        }))
        setSongs((prev) => [...takes, ...prev])
        // A new song is activity in its project: «изменён» moves up.
        if (projectId) hub.updateProject(projectId, {})
        takes.forEach((song, take) => {
          const timer = window.setTimeout(() => {
            setSongs((prev) =>
              prev.map((item) => (item.id === song.id ? { ...item, status: "ready", duration: 140 + Math.round(Math.random() * 100) } : item))
            )
            if (take !== 1 || studioVisible.current || (projectId && isProjectFeedVisible(projectId))) return
            const { hub: current, onOpenStudio: openStudio, onOpenProject: openProject } = latest.current
            const project = projectId ? current.projects.find((item) => item.id === projectId) : undefined
            if (project) {
              toast(`Песня для «${project.name}» готова`, { action: { label: "Открыть", onClick: () => openProject(project.id) } })
            } else {
              toast(`Песня «${title}» готова`, { action: { label: "Открыть", onClick: openStudio } })
            }
          }, 6000 + take * 2500 + Math.random() * 1500)
          timers.current.push(timer)
        })
      },
      renameSong: (id, title) => setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, title: title.trim() || song.title } : song))),
      deleteSong: (id) => {
        setSongs((prev) => prev.filter((song) => song.id !== id))
        setPlayingId((current) => (current === id ? null : current))
      },
      setSongProject: (id, projectId) => setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, projectId } : song))),
      togglePlay: (id) => setPlayingId((current) => (current === id ? null : id)),
      setStudioVisible: (visible) => {
        studioVisible.current = visible
      },
    }),
    [songs, playingId, setSongs, hub, authenticated]
  )

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const music = React.useContext(MusicContext)
  if (!music) throw new Error("useMusic must be used within <MusicProvider>")
  return music
}
