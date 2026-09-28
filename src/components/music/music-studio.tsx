import * as React from "react"

import { MusicLibrary } from "@/components/music/music-library"
import { SongForm } from "@/components/music/song-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMusic } from "@/hooks/use-music"
import { WorkspaceVisibilityContext } from "@/hooks/workspace-visibility"
import { cn } from "@/lib/utils"

/* Аудио = a music studio after mashagpt.ru/chat/suno: the song form on the left (fixed width,
   «Создать» pinned under it), the library of projects and songs on the right. Creating opens the
   project the takes went to. On the phone the two halves are tabs — «Создать» and «Проекты»; after
   «Создать» the library tab opens with the new takes on top. The switch is underline tabs, not
   another pill segment: the form right under it already starts with one (Авто | Детальный).
   `initialIdea` comes from the home page's audio reel and lands in the description. */
export function MusicStudio({ initialIdea }: { initialIdea?: string }) {
  const visible = React.useContext(WorkspaceVisibilityContext)
  const { setStudioVisible } = useMusic()
  const [tab, setTab] = React.useState<"create" | "library">("create")
  const [openProject, setOpenProject] = React.useState<string | null>(null)

  React.useEffect(() => {
    setStudioVisible(visible)
    return () => setStudioVisible(false)
  }, [setStudioVisible, visible])

  return (
    <section aria-label="Аудио" className="relative flex min-h-0 flex-1 flex-col max-md:pt-16 md:flex-row">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="mx-4 mb-3 shrink-0 md:hidden">
        <TabsList variant="line" aria-label="Раздел студии" className="h-10 w-full justify-start gap-5 p-0">
          <TabsTrigger value="create" className="flex-none px-0 text-[15px]">
            Создать
          </TabsTrigger>
          <TabsTrigger value="library" className="flex-none px-0 text-[15px]">
            Проекты
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={cn("flex min-h-0 flex-1 flex-col md:w-[400px] md:flex-none md:border-r lg:w-[440px]", tab !== "create" && "max-md:hidden")}>
        <SongForm
          initialIdea={initialIdea}
          libraryProject={openProject}
          onCreated={(projectId) => {
            setOpenProject(projectId)
            setTab("library")
          }}
        />
      </div>

      <div className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain", tab !== "library" && "max-md:hidden")}>
        <MusicLibrary openProjectId={openProject} onOpenProject={setOpenProject} />
      </div>
    </section>
  )
}
