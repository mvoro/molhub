import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon, Film01Icon, GridViewIcon, PaintBoardIcon } from "@hugeicons/core-free-icons"

import { saveChatConfig } from "@/components/chat-composer/chat-config"
import {
  ChatComposer,
  emptyDraft,
  type ComposerDraft,
  type ComposerHandle,
  type ComposerMessage,
} from "@/components/chat-composer/chat-composer"
import { ComposerTongue } from "@/components/composer-tongue"
import { HomeGlow } from "@/components/home-glow"
import { IdeaFan } from "@/components/idea-fan"
import { IdeaGrid, MediaFeed } from "@/components/media-feed"
import { MusicStudio } from "@/components/music/music-studio"
import { QuickActions } from "@/components/quick-actions"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChatType } from "@/data/chats"
import { COMPOSER_MODES, findModel, MOLLY_NAME, type ComposerMode } from "@/data/models"
import { defaultSettings } from "@/data/composer-settings"
import type { Role } from "@/data/roles"
import { PROMPT_PRESETS, type PromptPreset } from "@/data/prompt-presets"
import { NEW_CHAT, TOOLS } from "@/data/tools"
import { sendChatMessage } from "@/hooks/use-chat-messages"
import { useHub } from "@/hooks/use-hub"
import { DEFAULT_FEED_SIZE, FEED_SIZES, generate, setFeedVisible, useMediaFeed, type FeedKind } from "@/hooks/use-media-feed"
import { useStoredState } from "@/hooks/use-stored-state"
import { useRoles } from "@/hooks/use-roles"
import { resolveRole } from "@/lib/roles"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

const COPY: Record<ChatType, { greeting: string; placeholder: string }> = {
  text: { greeting: "Что сделаем сегодня?", placeholder: "Спросите что-нибудь…" },
  image: { greeting: "Что нарисуем?", placeholder: "Опишите картинку" },
  video: { greeting: "Какое видео снимем?", placeholder: "Опишите сцену" },
  audio: { greeting: "Что озвучим?", placeholder: "Вставьте текст для озвучки" },
}

/* `active` of the workspace ↔ tool: "new:image" is the photo tool, and so on. Plain "new" (the old
   home) and anything unknown open the text tool, the default screen. */
const typeFromActive = (active: string): ChatType => {
  const type = active.startsWith("new:") ? active.slice(4) : ""
  return type in COPY ? (type as ChatType) : "text"
}
/* Text opens the default workspace; Molly stays a model within text or photo. */
const activeFromMode = (mode: ComposerMode) => (mode === "text" ? NEW_CHAT : `new:${mode}`)

/* A chat is titled by its first words, cut on a word boundary. */
function titleFrom(text: string) {
  const line = text.replace(/\s+/g, " ").trim()
  if (line.length <= 40) return line
  const cut = line.slice(0, 40)
  const space = cut.lastIndexOf(" ")
  return `${(space > 24 ? cut.slice(0, space) : cut).replace(/[\s,.;:!?—-]+$/, "")}…`
}

/* Empty new chat: the composer and what surrounds it for the current tool. The tool comes from the
   sidebar, from the chips under the greeting or from a model of another kind in the picker — all
   drive the same `active` as the sidebar.
   - Текст = the default screen (there is no separate home since 26.09): the greeting, the
     composer and the quick actions over it (27.09, QuickActions) over the glow (HomeGlow, 27.09): «Горизонт», a
     glowing band along the bottom edge in the tool colours, on the phone too (`?look=corner` shows the previous
     «Из угла» under a dome, with «Акварель» in the Молли colours on the phone; `?look=warm` «Тёплый центр»). No screen has the drifting dots any more (the user's ask, 27.09;
     StarsBackground is kept, unused). The tools open from the sidebar: the chips under the greeting
     went on 26.09. (The 26.09 text-composer.tsx was rolled back at the
     user's request and is kept unused.)
   - Фото and Видео = one studio (27.09). A toolbar on top (MashaGPT, the user's reference):
     «История | Стили» for photo, «История | Шаблоны» for video, on the left; the preview size on the
     right. Under it the results: the user's own (Higgsfield's justified rows, newest first; clips play
     on hover) or the ideas as an even grid of named cards (ChatGPT's image styles). The composer floats
     over them, the results dissolving into eased scrims at the top and bottom. A request stays here
     and adds its placeholders at the top of «История» instead of opening a chat (Krea: a tool has a
     feed, not chats). With nothing made yet «История» is Krea's tool page: the tool's tile and name,
     styled as the text screen's greeting, and a freshly dealt fan of four ideas, three on the phone
     (the user's ask, 27.09; the phone's tabs ride the burger's row). Pointing at an idea, in the fan or
     the grid, previews its prompt in the empty field. The model picker stays in the composer.
   - Аудио = the music studio (Suno, components/music): its own form instead of the composer.
   A photo idea only fills the prompt; one about the user's own photo leaves attaching it to «+». A video
   idea is a template: a picture with a cross in the composer and Krea's upload tile for the photo.
   The composer has no backing of its own; on the phone it is pinned to the bottom, except on the
   text screen, where it sits in the middle under the greeting (27.09). */
export type RoleLaunch = { role: Role; prompt?: string }

export function NewChat({ active, onSelect, roleLaunch, visible = true }: { active: string; onSelect: (id: string) => void; roleLaunch?: RoleLaunch; visible?: boolean }) {
  const { createChat, projects } = useHub()
  const { recordUse } = useRoles()
  const type = typeFromActive(active)
  const copy = COPY[type]
  const text = type === "text"
  // The photo and video tools share one studio; `kind` says whose feed and ideas it shows.
  const studio = type === "image" || type === "video"
  const kind: FeedKind = type === "video" ? "video" : "image"
  const feed = useMediaFeed(kind)
  const hasFeed = feed.length > 0
  const [tab, setTab] = React.useState<StudioTab>("history")
  const [feedSize, setFeedSize] = useStoredState("ai-hub:feed-size", DEFAULT_FEED_SIZE)
  const stage = studio && tab === "history" && !hasFeed
  // Results under the toolbar: the user's own or the ideas.
  const results = studio && !stage
  const composer = React.useRef<ComposerHandle>(null)
  const [composerModel, setComposerModel] = React.useState(MOLLY_NAME)
  const rememberModel = React.useCallback(({ model }: { model: string }) => setComposerModel(model), [])
  const scroller = React.useRef<HTMLElement>(null)
  // The idea under the pointer: its prompt is previewed in the empty field.
  const [preview, setPreview] = React.useState<string | null>(null)

  // The composer's text and files outlive it: the audio studio replaces the composer, and the
  // request must still be there on the way back (27.09). One box for the screen's lifetime, filled
  // in place by the composer's reports; the previews go with this screen.
  const [draft] = React.useState(() => ({
    ...emptyDraft(),
    text: roleLaunch?.prompt ?? "",
    ...(roleLaunch && { settings: Object.fromEntries(COMPOSER_MODES.map((mode) => [mode, {
      ...defaultSettings(mode),
      ...(mode === "text" && { role: roleLaunch.role.name }),
    }])) as ComposerDraft["settings"] }),
  }))
  // The project a new text chat goes into (the tongue under the composer); none = the main history.
  const [projectId, setProjectId] = React.useState<string | undefined>()
  const keepDraft = React.useCallback((next: ComposerDraft) => void Object.assign(draft, next), [draft])
  React.useEffect(
    () => () => {
      ;[...draft.files, ...draft.frames].forEach((item) => item && URL.revokeObjectURL(item.url))
    },
    [draft]
  )

  // A new kind starts back on the ideas.
  const [shownType, setShownType] = React.useState(type)
  if (shownType !== type) {
    setShownType(type)
    setPreview(null)
    setTab("history")
  }

  // Finished results toast only while their tool is away.
  React.useEffect(() => {
    if (!studio || !visible) return
    setFeedVisible(kind)
    return () => setFeedVisible(null)
  }, [studio, kind, visible])

  // Every kind opens from the top.
  React.useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [type])

  // A photo idea fills the prompt and its settings; one that talks about the user's photo (a style)
  // leaves attaching it to «+» (the «Прикрепите фото» row went on 27.09, the user's ask). A video idea
  // is a template (27.09): it goes into the composer as a picture with a cross and asks for the photo
  // it animates; its prompt is sent unseen.
  const pickPreset = (preset: PromptPreset) => {
    setPreview(null)
    if (kind === "video") composer.current?.applyTemplate(preset)
    else composer.current?.fill(preset.prompt, { patch: preset.ratio ? { ratio: preset.ratio } : undefined })
  }

  const changeTab = (next: string) => {
    setTab(next as StudioTab)
    setPreview(null)
    scroller.current?.scrollTo({ top: 0 })
  }

  const send = ({ text: body, files, template, model, settings }: ComposerMessage) => {
    // The studio keeps its results in its feed: the request lands on top of it, in view. A template's
    // prompt leads, the user's additions follow.
    if (studio) {
      const prompt = template ? [template.prompt, body].filter(Boolean).join(" ") : body
      generate(kind, { prompt, idea: template?.id, model, settings, ratio: settings.ratio, count: settings.count, duration: settings.duration })
      setTab("history")
      scroller.current?.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const title = body || files.map((file) => file.name).join(", ")
    // A project deleted or archived since it was picked no longer takes the chat.
    const project = text ? projects.find((item) => item.id === projectId && !item.archived) : undefined
    const chat = createChat({ title: titleFrom(title), type, projectId: project?.id })
    saveChatConfig(chat.id, { model, settings })
    const selectedRole = resolveRole(settings.role)
    if (selectedRole) recordUse(selectedRole.id, chat.id)
    sendChatMessage(chat.id, body, model, files)
    onSelect(chat.id)
  }

  const tool = TOOLS.find((item) => item.id === `new:${type}`)

  // The studio takes the whole screen.
  if (type === "audio") return <MusicStudio />

  // The text screen centres the greeting and the composer on the phone too (the user's ask, 27.09).
  // In the studio it is pinned to the bottom on the phone and, on desktop, to the bottom of the stage
  // or over the results. Over results a scrim sits behind it (.scrim-bottom, the full width of the
  // screen, z -1 inside the wrapper's stacking context: over the page, under the card). The wrapper
  // lets clicks through to the pictures under its fade; the composer takes them.
  const composerPlace = cn(
    "pointer-events-none z-20 shrink-0",
    studio && "max-md:sticky max-md:bottom-0 max-md:mt-auto max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
    stage && "max-md:pt-3 md:sticky md:bottom-0 md:pt-3 md:pb-6",
    results && "max-md:pt-14 md:sticky md:bottom-0 md:pt-20 md:pb-6"
  )

  return (
    <>
      {/* Under the whole workspace card on the text screen, phones included; the section is
          positioned, so it paints over it. */}
      {text && <HomeGlow look="horizon" palette="molly" />}
      <section
        ref={scroller}
        aria-label={text ? "Новый чат" : (tool?.label ?? "Новый чат")}
        className={cn(
          // On the phone the whole screen scrolls under the pinned header (pt-16) and the composer
          // pinned to the bottom. The studio's toolbar rides the header's own row: its padding is the
          // burger's top (14px), so the sticky tabs line up with it.
          "relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 md:px-6",
          studio ? "max-md:pt-3.5" : "max-md:pt-16",
          !studio && "md:pb-10",
          // The centred text screen mirrors the header below, so the pair sits in the screen's middle.
          text && "max-md:pb-16"
        )}
      >
        {studio ? (
          // The tabs' root adds no box: the toolbar sticks to the section's top, the panels flow.
          <Tabs value={tab} onValueChange={changeTab} className="contents">
            {/* The toolbar. Over results a scrim lies behind it — the bottom one's curve, mirrored (the
                user's ask, 27.09), from behind the toolbar a little past it; the tabs and the size pill
                keep their own fill. On the stage it stays clear (the video screen's dots show through).
                Desktop: 64px, tabs on the left (the project's round M tabs from ui/tabs, as in the Archive),
                the size slider on the right while there are results. Phone (the user's asks, 27.09): the
                tabs from the start, on the burger's row — 36px as the burger, 8px after it (12 + 36 + 8 =
                56px in) — compact: the inactive tab is its icon alone. No slider, and no «Новый чат» on
                that row (App.tsx). The row lets taps through to the burger under its scrim; the tabs take
                theirs. Sticky top 0 on both: sticky counts the section's top padding. The desktop row keeps
                120px on the right for the balance pinned over it (App.tsx), so the slider stops short of it. */}
            <div className="sticky top-0 z-20 -mx-4 flex shrink-0 items-center gap-3 pr-3 pb-3 pl-14 max-md:pointer-events-none md:-mx-6 md:h-16 md:pr-30 md:pb-0 md:pl-6">
              <TabsList compact className="pointer-events-auto">
                <TabsTrigger value="history">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
                  <span>История</span>
                </TabsTrigger>
                <TabsTrigger value="ideas">
                  <HugeiconsIcon icon={IDEAS[kind].icon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
                  <span>{IDEAS[kind].label}</span>
                </TabsTrigger>
              </TabsList>
              {/* The size slider is the history's: the styles and templates keep one size (the user's ask, 27.09). */}
              {results && tab === "history" && (
                <div className="ml-auto flex h-9 w-44 items-center gap-3 rounded-full bg-muted px-3.5 max-md:hidden">
                  <HugeiconsIcon icon={GridViewIcon} strokeWidth={ICON_STROKE} aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  <Slider
                    min={0}
                    max={FEED_SIZES.length - 1}
                    step={1}
                    value={[feedSize]}
                    onValueChange={([next]) => setFeedSize(next)}
                    aria-label="Размер превью"
                  />
                </div>
              )}
              {results && <div aria-hidden="true" className="scrim-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+3rem)] md:h-[calc(100%+4rem)]" />}
            </div>

            <TabsContent value="history" className="flex flex-col">
              {stage ? (
                // The stage fills the space over the composer and centres the name and the fan in it,
                // a little above the middle (Krea). A size container: the fan scales with its width.
                // Keyed by the tool: each one deals its own hand and titles itself in.
                <div key={kind} className="@container flex flex-1 flex-col items-center justify-center gap-6 py-8 md:gap-7 md:pb-[6svh]">
                  {/* The text screen's greeting type (the user's ask, 27.09) with the tool's tile at the
                      cap height; it rises into place as Krea's title does (10px, 400ms). */}
                  <h1 className="flex items-center gap-[0.3em] text-[26px] leading-tight font-[450] tracking-[-0.02em] animate-in fade-in-0 slide-in-from-bottom-2.5 duration-400 ease-(--ease-out) motion-reduce:animate-none md:text-[32px]">
                    {tool && (
                      <img src={tool.icon} alt="" width={36} height={36} draggable={false} className="size-[1.125em] select-none" />
                    )}
                    {tool?.label ?? copy.greeting}
                  </h1>
                  <IdeaFan
                    presets={PROMPT_PRESETS[kind]}
                    onPick={pickPreset}
                    onPreview={(preset) => setPreview(preset ? (preset.description ?? preset.prompt) : null)}
                  />
                </div>
              ) : (
                <MediaFeed key={kind} items={feed} size={feedSize} onReuse={(item) => composer.current?.fill(item.prompt)} className="flex-1" />
              )}
            </TabsContent>
            <TabsContent value="ideas" className="flex flex-col">
              <IdeaGrid
                key={kind}
                presets={PROMPT_PRESETS[kind]}
                label={IDEAS[kind].label}
                action={kind === "video" ? "выбрать шаблон" : undefined}
                onPick={pickPreset}
                onPreview={(preset) => setPreview(preset ? (preset.description ?? preset.prompt) : null)}
                className="flex-1 pb-4"
              />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* The text screen: two flexible spacers centre the greeting and the composer, phones
                included. */}
            <div aria-hidden="true" className="min-h-6 flex-1 shrink-0" />
            <div className="flex flex-col items-center pb-6 md:flex-none md:pb-8">
              <h1 className="text-center text-[26px] leading-tight font-[450] tracking-[-0.02em] text-balance md:text-[32px]">
                {copy.greeting}
              </h1>
            </div>
            {/* Over the composer (the user's ask, 27.09; first they hung under it), nearer the field
                they fill than the greeting. */}
            <QuickActions onPick={(prompt) => composer.current?.fill(prompt)} className="mx-auto w-full max-w-3xl pb-4" />
          </>
        )}

        <div className={composerPlace}>
          {results && <div aria-hidden="true" className="scrim-bottom pointer-events-none absolute -inset-x-4 inset-y-0 -z-10 md:-inset-x-6" />}
          <ChatComposer
            ref={composer}
            mode={type}
            onModeChange={(next) => onSelect(activeFromMode(next))}
            onSend={send}
            placeholder={copy.placeholder}
            autoFocus
            draft={draft}
            onDraftChange={keepDraft}
            onConfigChange={rememberModel}
            hint={studio ? (preview ?? undefined) : undefined}
            footer={
              text && (
                <ComposerTongue projectId={projectId} onProjectChange={setProjectId} onAttach={() => composer.current?.attach("file")} attachmentsDisabled={findModel(composerModel, "text")?.version.attachments === false} />
              )
            }
            className="pointer-events-auto mx-auto max-w-3xl"
          />
        </div>

        {text && <div aria-hidden="true" className="min-h-6 flex-1" />}

      </section>
    </>
  )
}

type StudioTab = "history" | "ideas"
/* The studio's second tab: the ideas as ChatGPT's image styles for photo, as templates for video (the
   community tab went on 27.09 — there is no community). */
const IDEAS: Record<FeedKind, { label: string; icon: typeof Clock01Icon }> = {
  image: { label: "Стили", icon: PaintBoardIcon },
  video: { label: "Шаблоны", icon: Film01Icon },
}
