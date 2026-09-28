import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  DiceIcon,
  Folder01Icon,
  FolderAddIcon,
  FolderRemoveIcon,
  InformationCircleIcon,
  MagicWand01Icon,
  MusicNote01Icon,
  Refresh01Icon,
  ShuffleIcon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { MoleculeIcon } from "@/components/chat-composer/icons"
import { ModelLogo } from "@/components/model-logo"
import { ProjectDialog } from "@/components/project-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AppMenu, AppMenuContent, AppMenuItem, AppMenuSeparator, AppMenuTrigger } from "@/components/ui/app-menu"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Segmented, SegmentedItem } from "@/components/ui/segmented"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { audioStyleLimit, defaultSettings, formatCost } from "@/data/composer-settings"
import { MODEL_FAMILIES } from "@/data/models"
import {
  RANDOM_DESCRIPTIONS,
  SONG_IDEAS,
  STYLE_BOOST,
  STYLE_TAGS,
  STYLES_PLACEHOLDER,
  NO_PROJECT,
  lyricsDraft,
} from "@/data/music"
import { useHub } from "@/hooks/use-hub"
import { useMusic } from "@/hooks/use-music"
import { ICON_STROKE, projectIcon } from "@/lib/icons"
import { projectColor } from "@/lib/project-colors"
import { cn } from "@/lib/utils"

/* Suno studio with the same model options and controls as moleculai.ru/dashboard.
   Description and expanded modes share the instrumental switch; detailed inputs stay in
   collapsible shadcn sections. No unsupported voices, duration, sounds or reference uploads. */

const SUNO_FAMILY = MODEL_FAMILIES.audio.find((family) => family.id === "suno")!
const SUNO = SUNO_FAMILY.versions

const CARD = "rounded-[20px] bg-muted"
/* A segmented track on a grey card: a step darker than the card, so the white pill still lifts. */
const ON_CARD = "bg-foreground/6 dark:bg-foreground/10"
/* Text areas sit bare on the card: no box of their own, the card is the field. */
const BARE_FIELD =
  "min-h-24 resize-none rounded-none border-0 bg-transparent p-0 text-base leading-relaxed shadow-none focus-visible:ring-0 disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent md:text-[15px]"
const PRESS = "active:not-aria-[haspopup]:translate-y-0 active:scale-[0.97] motion-reduce:active:scale-100"

const pickSome = <T,>(list: T[], count: number, skip: T[] = []) =>
  [...list.filter((item) => !skip.includes(item))].sort(() => Math.random() - 0.5).slice(0, count)

/* «Эмоциональная рок-баллада о любви…» → «Эмоциональная рок-баллада о любви» (a title from the first words). */
function titleFrom(text: string) {
  const words = text.replace(/[«»"“”]/g, "").split(/[\s,.;:!?—]+/).filter(Boolean).slice(0, 4)
  if (!words.length) return "Без названия"
  const line = words.join(" ")
  return line[0].toUpperCase() + line.slice(1)
}

type Mode = "auto" | "detailed"

export function SongForm({
  initialIdea,
  libraryProject,
  onCreated,
}: {
  initialIdea?: string
  /* The project open in the library next to the form: opening or creating one there picks it here too. */
  libraryProject?: string | null
  onCreated: (projectId: string) => void
}) {
  const music = useMusic()
  const hub = useHub()
  const [mode, setMode] = React.useState<Mode>("auto")
  const [version, setVersion] = React.useState(SUNO[0].name)
  const [description, setDescription] = React.useState(initialIdea ?? "")
  const [vocals, setVocals] = React.useState("vocal")
  const [title, setTitle] = React.useState("")
  // «Без проекта» by default (27.09): a project per song would crowd the sidebar now that they're the hub's.
  const [target, setTarget] = React.useState<string>(NO_PROJECT)
  const [seenLibrary, setSeenLibrary] = React.useState(libraryProject)
  if (libraryProject !== seenLibrary) {
    setSeenLibrary(libraryProject)
    if (libraryProject && libraryProject !== NO_PROJECT) setTarget(libraryProject)
  }
  const [ideas, setIdeas] = React.useState(() => SONG_IDEAS.slice(0, 4))
  // Детальный
  const [lyrics, setLyrics] = React.useState("")
  const [styles, setStyles] = React.useState("")
  const [chips, setChips] = React.useState(() => pickSome(STYLE_TAGS, 8))
  const [gender, setGender] = React.useState("any")
  const [creativity, setCreativity] = React.useState(50)
  const [styleWeight, setStyleWeight] = React.useState(50)
  const [audioWeight, setAudioWeight] = React.useState(50)
  const styleLimit = audioStyleLimit(version)
  const [negative, setNegative] = React.useState("")
  const [openCards, setOpenCards] = React.useState(["lyrics", "styles"])

  const instrumental = vocals === "instrumental"
  const price = SUNO.find((item) => item.name === version)?.price ?? SUNO[0].price
  // The project picked earlier may have been deleted or archived meanwhile: then it's «Без проекта».
  const project = hub.projects.find((item) => item.id === target && !item.archived)
  const ready = mode === "auto" ? description.trim() !== "" : lyrics.trim() !== "" || styles.trim() !== ""

  const create = () => {
    if (!ready) return
    if (mode === "detailed" && styles.length > styleLimit) return toast.error(`Сократите стиль до ${styleLimit} символов для ${version}`)
    const source = mode === "auto" ? description : styles || lyrics
    const name = title.trim() || titleFrom(mode === "auto" ? description : lyrics.split("\n").find((line) => line && !line.startsWith("[")) ?? styles)
    const tags = [mode === "auto" ? description.trim() : styles.trim() || "без стиля", instrumental && "инструментал"].filter(Boolean).join(", ")
    music.createSongs({
      projectId: project?.id ?? null, title: name, tags: tags || source, model: version,
      prompt: mode === "auto" ? description.trim() : instrumental ? "" : lyrics.trim(),
      settings: { ...defaultSettings("audio", version), custom: mode === "detailed", instrumental,
        ...(mode === "detailed" && { styles: styles.trim(), title: title.trim(), negative: negative.trim(),
          gender: gender === "male" ? "Мужской" : gender === "female" ? "Женский" : "Любой",
          creativity: `${creativity}%`, styleWeight: `${styleWeight}%`, audioWeight: `${audioWeight}%` }),
      },
    })
    setDescription("")
    setTitle("")
    setLyrics("")
    setStyles("")
    setNegative("")
    // Next takes land in the same place, as in Suno; the library opens it.
    onCreated(project?.id ?? NO_PROJECT)
  }

  // Never drop typed text silently: say so and offer it back (as the composer does for ideas).
  const replace = (current: string, next: string, set: (value: string) => void, what: string) => {
    set(next)
    if (current.trim() && current !== next) toast(`${what} заменён`, { action: { label: "Вернуть", onClick: () => set(current) } })
  }

  const addTag = (tag: string) => {
    setStyles((prev) => (prev.trim() ? `${prev.trim().replace(/,$/, "")}, ${tag}` : tag))
    setChips((prev) => prev.filter((item) => item !== tag))
  }

  const boostStyles = () => {
    const current = styles.split(",").map((tag) => tag.trim()).filter(Boolean)
    const extra = pickSome(STYLE_BOOST, current.length ? 2 : 1, current)
    const base = current.length ? current : pickSome(STYLE_TAGS, 2)
    setStyles([...base, ...extra].join(", "))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pt-1 pb-4 md:px-5 md:pt-5">
        <div className="flex items-center gap-2">
          <Segmented value={mode} onValueChange={(value) => setMode(value as Mode)} aria-label="Режим" className="flex-1 [&>*]:h-9">
            <SegmentedItem value="auto">Авто</SegmentedItem>
            <SegmentedItem value="detailed">Детальный</SegmentedItem>
          </Segmented>
          <VersionMenu value={version} onChange={setVersion} />
        </div>

        {mode === "auto" ? (
          <>
            <section aria-label="Описание песни" className={cn(CARD, "flex flex-col gap-3 p-4")}>
              <div className="flex h-8 items-center justify-between">
                <h3 className="text-[15px] font-medium">Описание песни</h3>
                <IconAction
                  icon={DiceIcon}
                  label="Случайная идея"
                  onClick={() => replace(description, pickSome(RANDOM_DESCRIPTIONS, 1, [description])[0], setDescription, "Текст описания")}
                />
              </div>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Опишите песню: о чём она, настроение и жанр"
                aria-label="Описание песни"
                maxLength={500}
                className={BARE_FIELD}
              />
              <VocalsSwitch value={vocals} onChange={setVocals} />
            </section>
          </>
        ) : (
          <>
            <Accordion type="multiple" value={openCards} onValueChange={setOpenCards} className="gap-3">
              <Card value="lyrics" title="Текст" action={
                <IconAction
                  icon={MagicWand01Icon}
                  label="Написать черновик текста"
                  disabled={instrumental}
                  onClick={() => {
                    replace(lyrics, lyricsDraft(title || description), setLyrics, "Текст")
                    setOpenCards((prev) => (prev.includes("lyrics") ? prev : [...prev, "lyrics"]))
                  }}
                />
              }>
                <Textarea
                  value={instrumental ? "" : lyrics}
                  onChange={(event) => setLyrics(event.target.value)}
                  disabled={instrumental}
                  placeholder={
                    instrumental ? "В инструментальном треке слов нет" : "Напишите текст песни или о чём она — или оставьте пустым для инструментала"
                  }
                  aria-label="Текст песни"
                  className={cn(BARE_FIELD, "min-h-32 max-h-80")}
                />
                <VocalsSwitch value={vocals} onChange={setVocals} />
              </Card>

              <Card value="styles" title="Жанр / стиль">
                <Textarea
                  value={styles}
                  onChange={(event) => setStyles(event.target.value)}
                  placeholder={STYLES_PLACEHOLDER}
                  aria-label="Жанр / стиль"
                  maxLength={styleLimit}
                  className={cn(BARE_FIELD, "min-h-20")}
                />
                <p aria-live="polite" className={cn("text-xs", styles.length > styleLimit ? "text-destructive" : "text-muted-foreground")}>{styles.length} / {styleLimit}</p>
                <Button variant="secondary" size="sm" onClick={boostStyles} className={cn("h-9 w-fit gap-1.5 rounded-full bg-background px-3.5 text-[13px] hover:bg-background/70 dark:bg-background/40", PRESS)}>
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={ICON_STROKE} className="size-4!" />
                  Улучшить стиль
                </Button>
                <div className="-mx-4 flex items-center gap-1.5 pr-4 pl-2">
                  <IconAction icon={ShuffleIcon} label="Другие стили" onClick={() => setChips(pickSome(STYLE_TAGS, 8, styles.split(",").map((tag) => tag.trim())))} />
                  <div role="group" aria-label="Подсказки стилей" className="flex min-w-0 flex-1 gap-1.5 scroll-fade-x overflow-x-auto overscroll-x-contain scrollbar-none py-1">
                    {chips.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        aria-label={`Добавить стиль ${tag}`}
                        className={cn("h-8 shrink-0 gap-1 rounded-full bg-transparent px-3 text-[13px] font-normal", PRESS)}
                      >
                        <HugeiconsIcon icon={Add01Icon} strokeWidth={ICON_STROKE} className="size-3.5!" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card value="advanced" title="Продвинутые настройки">
                <div className="flex flex-col gap-4 pb-1">
                  <SettingRow label="Пол вокала" hint="Кто поёт. Если ничего не выбрано, решит модель.">
                    <Segmented value={gender} onValueChange={setGender} size="sm" aria-label="Голос" className={ON_CARD}>
                      <SegmentedItem value="any">Любой</SegmentedItem>
                      <SegmentedItem value="male">Муж</SegmentedItem>
                      <SegmentedItem value="female">Жен</SegmentedItem>
                    </Segmented>
                  </SettingRow>
                  <PercentSetting label="Сила стиля" hint="Насколько строго следовать выбранному жанру и стилю." value={styleWeight} onChange={setStyleWeight} />
                  <PercentSetting label="Креативность" hint="Больше — свободнее интерпретация описания." value={creativity} onChange={setCreativity} />
                  <PercentSetting label="Аудио-референс" hint="Сила влияния аудио-референса." value={audioWeight} onChange={setAudioWeight} />
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Избегать стилей</span>
                    <Textarea
                      value={negative}
                      onChange={(event) => setNegative(event.target.value)}
                      placeholder="Что исключить: heavy metal, screamo…"
                      aria-label="Избегать стилей"
                      className="min-h-20 resize-none rounded-xl border-0 bg-background px-3 py-2.5 text-base md:text-[15px] dark:bg-background/40"
                    />
                  </div>
                </div>
              </Card>
            </Accordion>
          </>
        )}

        <TitleAndProject title={title} onTitle={setTitle} target={project ? project.id : NO_PROJECT} onTarget={setTarget} />

        {mode === "auto" && (
          <section aria-label="Предложения" className="flex flex-col gap-2 pt-2">
            <div className="flex h-8 items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Предложения</h3>
              <IconAction
                icon={Refresh01Icon}
                label="Другие предложения"
                onClick={() => setIdeas(pickSome(SONG_IDEAS, 4, ideas))}
              />
            </div>
            <div key={ideas.map((idea) => idea.id).join()} className="grid grid-cols-2 gap-2 animate-in fade-in-0 duration-200 motion-reduce:animate-none">
              {ideas.map((idea) => (
                <Button
                  key={idea.id}
                  variant="secondary"
                  onClick={() => replace(description, idea.prompt, setDescription, "Текст описания")}
                  className={cn(
                    "h-auto flex-col items-start justify-start gap-0.5 rounded-2xl p-3.5 text-left whitespace-normal",
                    "transition-[scale,background-color] duration-150 ease-(--ease-out)",
                    PRESS
                  )}
                >
                  <span className="text-sm font-medium">{idea.title}</span>
                  <span className="text-[13px] leading-snug font-normal text-foreground/70">{idea.description}</span>
                </Button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Always in view under the form; a fade lets the form scroll away under it. */}
      <div className="relative shrink-0 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-linear-to-t before:from-background before:to-transparent md:px-5 md:pb-5">
        <Button
          size="lg"
          onClick={create}
          disabled={!ready}
          className={cn("h-12 w-full gap-2 rounded-full text-[15px]", PRESS, "transition-[scale,background-color,opacity] duration-150 ease-(--ease-out)")}
        >
          <HugeiconsIcon icon={MusicNote01Icon} strokeWidth={ICON_STROKE} className="size-5!" />
          Создать
          <span className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[13px] tabular-nums">
            {formatCost(price)}
            <MoleculeIcon className="size-3" />
          </span>
        </Button>
      </div>

    </div>
  )
}

/* ── pieces ── */

function IconAction({ icon, label, className, ...props }: React.ComponentProps<typeof Button> & { icon: IconSvgElement; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={cn("size-8 shrink-0 rounded-full text-foreground/70 hover:bg-background hover:text-foreground dark:hover:bg-background/40 pointer-coarse:size-10", PRESS, className)}
          {...props}
        >
          <HugeiconsIcon icon={icon} strokeWidth={ICON_STROKE} className="size-[18px]!" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function VocalsSwitch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Segmented value={value} onValueChange={onChange} aria-label="Вокал в треке" className={cn(ON_CARD, "[&>*]:h-9")}>
      <SegmentedItem value="vocal">С вокалом</SegmentedItem>
      <SegmentedItem value="instrumental">Без вокала</SegmentedItem>
    </Segmented>
  )
}

function VersionMenu({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <AppMenu>
      <AppMenuTrigger asChild>
        <Button variant="outline" aria-label={`Версия модели: ${value}`} className={cn("h-11 shrink-0 gap-1.5 rounded-full pr-3 pl-3.5 text-sm", PRESS)}>
          <ModelLogo logo={SUNO_FAMILY.logo} mode="audio" color />
          {value.replace("Suno ", "")}
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-4! opacity-60" />
        </Button>
      </AppMenuTrigger>
      {/* The marks as in the composer's picker (components/model-logo.tsx): the current one in colour, the rest grey;
          the menu is 2rem wider for them, so the descriptions wrap as before. */}
      <AppMenuContent align="end" className="w-80 max-w-[calc(100vw-1rem)]">
        {SUNO.map((item) => (
          <AppMenuItem key={item.name} onSelect={() => onChange(item.name)} className="h-auto items-start gap-3 py-2.5">
            <ModelLogo
              logo={SUNO_FAMILY.logo}
              mode="audio"
              color={item.name === value}
              className={cn("mt-px size-[18px]", item.name !== value && "text-muted-foreground")}
            />
            <span className="grid flex-1 gap-0.5">
              <span className="font-medium">{item.name}</span>
              <span className="text-[13px] text-muted-foreground!">{item.description}</span>
            </span>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className={cn("mt-0.5", item.name !== value && "invisible")} />
          </AppMenuItem>
        ))}
      </AppMenuContent>
    </AppMenu>
  )
}

/* A collapsible card: chevron and title on the left (Suno), an optional action on the right. */
function Card({ value, title, action, children }: { value: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <AccordionItem value={value} className={cn(CARD, "relative border-0 px-4")}>
      <AccordionTrigger className="h-12 items-center justify-start gap-2 py-0 text-[15px] hover:no-underline focus-visible:ring-inset [&>[data-slot=accordion-trigger-icon]]:hidden">
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={ICON_STROKE}
          className="size-[18px] text-foreground/60 transition-transform duration-200 ease-(--ease-out) group-aria-expanded/accordion-trigger:rotate-90 motion-reduce:transition-none"
        />
        {title}
      </AccordionTrigger>
      {action && <div className="absolute top-2 right-2">{action}</div>}
      <AccordionContent className="flex flex-col gap-3 pb-4">{children}</AccordionContent>
    </AccordionItem>
  )
}

function SettingRow({ label, hint, wide, children }: { label: string; hint: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-3", wide && "max-sm:flex-col max-sm:items-stretch max-sm:gap-2")}>
      {/* Level rows share one label column, so their scales start at the same x. */}
      <span className={cn("flex shrink-0 items-center gap-1 text-sm font-medium", wide && "sm:w-36")}>
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Что такое «${label}»`} className="size-6 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground">
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} className="size-4!" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{hint}</TooltipContent>
        </Tooltip>
      </span>
      <div className={cn("flex min-w-0 flex-1 justify-end", wide && "justify-stretch")}>{children}</div>
    </div>
  )
}

function TitleAndProject({
  title,
  onTitle,
  target,
  onTarget,
}: {
  title: string
  onTitle: (value: string) => void
  target: string
  onTarget: (value: string) => void
}) {
  const hub = useHub()
  const projects = hub.projects.filter((project) => !project.archived)
  const current = projects.find((project) => project.id === target)
  // «Новый проект» creates one with the app's dialog and picks it, staying in the studio (spec §6).
  const [creating, setCreating] = React.useState(false)
  return (
    <section aria-label="Название и проект" className={cn(CARD, "flex flex-col gap-1 p-2")}>
      <InputGroup className="h-11 rounded-xl border-0 bg-transparent shadow-none has-[[data-slot=input-group-control]:focus-visible]:bg-background has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:bg-transparent">
        <InputGroupAddon className="pl-2.5">
          <HugeiconsIcon icon={MusicNote01Icon} strokeWidth={ICON_STROKE} className="size-[18px] text-foreground/60" />
        </InputGroupAddon>
        <InputGroupInput
          value={title}
          onChange={(event) => onTitle(event.target.value)}
          placeholder="Название песни (необязательно)"
          aria-label="Название песни"
          maxLength={80}
          className="text-base md:text-[15px]"
        />
      </InputGroup>
      <div className="flex h-11 items-center gap-2.5 pr-1 pl-2.5">
        <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} className="size-[18px] shrink-0 text-foreground/60" />
        <span className="flex-1 text-[15px]">Сохранить в</span>
        <AppMenu>
          <AppMenuTrigger asChild>
            <Button variant="secondary" size="sm" className={cn("h-9 max-w-44 gap-1 rounded-full bg-background px-3.5 text-[13px] hover:bg-background/70 dark:bg-background/40", PRESS)}>
              <span className="truncate">{current?.name ?? "Без проекта"}</span>
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-3.5! shrink-0 opacity-60" />
            </Button>
          </AppMenuTrigger>
          <AppMenuContent align="end" className="max-h-80 w-60 overflow-y-auto">
            <AppMenuItem icon={FolderRemoveIcon} onSelect={() => onTarget(NO_PROJECT)}>
              <span className="flex-1">Без проекта</span>
              {!current && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} />}
            </AppMenuItem>
            {projects.length > 0 && <AppMenuSeparator />}
            {projects.map((project) => (
              <AppMenuItem key={project.id} onSelect={() => onTarget(project.id)}>
                <HugeiconsIcon icon={projectIcon(project.icon)} strokeWidth={ICON_STROKE} color={projectColor(project.color)} />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                {project.id === target && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} />}
              </AppMenuItem>
            ))}
            <AppMenuSeparator />
            <AppMenuItem icon={FolderAddIcon} onSelect={() => setCreating(true)}>
              Новый проект
            </AppMenuItem>
          </AppMenuContent>
        </AppMenu>
      </div>
      <ProjectDialog open={creating} onOpenChange={setCreating} onSubmit={(value) => onTarget(hub.createProject(value).id)} />
    </section>
  )
}

function PercentSetting({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  return (
    <SettingRow label={label} hint={hint} wide>
      <div className="flex w-full items-center gap-3">
        <Slider min={0} max={100} step={5} value={[value]} onValueChange={([next]) => onChange(next)} aria-label={label} />
        <span className="w-10 shrink-0 text-right text-sm tabular-nums">{value}%</span>
      </div>
    </SettingRow>
  )
}
