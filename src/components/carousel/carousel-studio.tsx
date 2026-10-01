import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowDown01Icon, ArrowRight01Icon, Cancel01Icon, Delete02Icon, MagicWand01Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { CarouselCover } from "@/components/carousel/carousel-cover"
import { CarouselReferences } from "@/components/carousel/carousel-references"
import { CarouselResultViewer } from "@/components/carousel/carousel-result-viewer"
import { CarouselEditor } from "@/components/carousel/carousel-editor"
import { AppMenu, AppMenuContent, AppMenuRadioGroup, AppMenuRadioItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetDescription, AppSheetFooter, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { CAROUSEL_FORMATS, CAROUSEL_STORAGE_KEY, CAROUSEL_TEMPLATES, carouselDraftFromResult, carouselSlideCount, createCarouselResult, readCarouselState, resolveCarouselStyle, snapshotCarouselRequest, upsertCarouselResult, validateCarouselDraft, type CarouselDraft, type CarouselDraftErrors, type CarouselResult } from "@/lib/carousel/model"
import { renderCarousel, renderCarouselSlide } from "@/lib/carousel/export"
import { clientId } from "@/lib/client-id"
import { ICON_STROKE } from "@/lib/icons"
import { lastInput } from "@/lib/input-modality"
import { cn } from "@/lib/utils"
import "@/components/roles/roles-search.css"
import "./carousel-studio.css"

const CATEGORIES = [
  { id: "all", name: "Все стили", templates: [] },
  { id: "minimal", name: "Минимализм", templates: ["editorial", "zen", "linen", "noir", "marble"] },
  { id: "natural", name: "Природа", templates: ["botanical", "terracotta", "watercolor", "ceramic"] },
  { id: "bold", name: "Графика", templates: ["collage", "risograph", "blueprint", "origami", "memphis", "cutout"] },
  { id: "digital", name: "Объём и свет", templates: ["chrome", "aurora", "glass", "holographic", "neon"] },
]

function initialState() {
  try { return readCarouselState(window.localStorage) }
  catch { return readCarouselState({ getItem: () => null }) }
}

export function CarouselStudio() {
  const [initial] = React.useState(initialState)
  const [draft, setDraft] = React.useState<CarouselDraft>(initial.draft)
  const [results, setResults] = React.useState<CarouselResult[]>(initial.results)
  const [editor, setEditor] = React.useState<CarouselResult | null>(initial.result)
  const [editing, setEditing] = React.useState(Boolean(initial.result))
  const [tab, setTab] = React.useState("templates")
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("all")
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [errors, setErrors] = React.useState<CarouselDraftErrors>({})
  const [uploading, setUploading] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [renderError, setRenderError] = React.useState("")
  const [viewer, setViewer] = React.useState<CarouselResult | null>(null)
  const [prepared, setPrepared] = React.useState<Blob[] | undefined>()
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [toDelete, setToDelete] = React.useState<CarouselResult | null>(null)
  const [replace, setReplace] = React.useState<"structure" | CarouselResult | null>(null)
  const scroller = React.useRef<HTMLElement>(null)
  const operation = React.useRef<AbortController | null>(null)
  const storageNotice = React.useRef(false)

  React.useEffect(() => () => operation.current?.abort(), [])
  React.useEffect(() => {
    try {
      window.localStorage.setItem(CAROUSEL_STORAGE_KEY, JSON.stringify({ draft, results, result: editor, stage: editor ? "result" : "setup" }))
    } catch {
      if (!storageNotice.current) {
        storageNotice.current = true
        toast.error("Не удалось сохранить черновик на устройстве. Не закрывайте страницу до скачивания.")
      }
    }
  }, [draft, results, editor])

  const patchDraft = (patch: Partial<CarouselDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !(key in patch))))
  }
  const style = resolveCarouselStyle(draft)!
  const startEditor = () => {
    const next = createCarouselResult(snapshotCarouselRequest(draft), { id: `carousel-${clientId()}` })
    // Writing prompts are helpful in an outline, but never ship as finished copy.
    next.slides = next.slides.map((slide) => slide.kind === "prompt" ? { ...slide, body: "" } : slide)
    setEditor(next)
    setEditing(true)
    setSettingsOpen(false)
    setRenderError("")
    scroller.current?.scrollTo({ top: 0 })
  }
  const prepare = () => {
    const invalid = validateCarouselDraft(draft)
    setErrors(invalid)
    if (Object.keys(invalid).length) {
      // Works in both the sidebar form and the mobile sheet; focus the actual invalid control.
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`${settingsOpen ? '[role="dialog"] ' : ''}[data-carousel-form] [aria-invalid="true"]`)?.focus())
      return
    }
    if (editor) {
      if (JSON.stringify(snapshotCarouselRequest(draft)) === JSON.stringify(editor.request)) {
        setEditing(true)
        setSettingsOpen(false)
        return
      }
      setReplace("structure")
      return
    }
    startEditor()
  }
  const generate = async () => {
    if (!editor || operation.current) return
    const controller = new AbortController()
    operation.current = controller
    setGenerating(true)
    setRenderError("")
    const result = { ...editor, createdAt: new Date().toISOString() }
    try {
      const blobs = await renderCarousel(result, { signal: controller.signal })
      if (controller.signal.aborted) return
      setResults((current) => upsertCarouselResult(current, result))
      setViewer(result)
      setPrepared(blobs)
      setViewerOpen(true)
      setEditor(null)
      setEditing(false)
      setTab("history")
      setQuery("")
      toast.success("Карусель готова")
    } catch (error) {
      if (!controller.signal.aborted) setRenderError(error instanceof Error ? error.message : "Не удалось создать карусель. Попробуйте ещё раз.")
    } finally {
      if (operation.current === controller) { operation.current = null; setGenerating(false) }
    }
  }
  const reuse = (result: CarouselResult) => {
    setViewerOpen(false)
    if (draft.topic.trim() || editor) { setReplace(result); return }
    applyReuse(result)
  }
  const applyReuse = (result: CarouselResult) => {
    setDraft(carouselDraftFromResult(result))
    // Reuse the edited copy as well as settings; the saved original remains immutable.
    const id = `carousel-${clientId()}`
    setEditor({ ...result, id, slides: result.slides.map((slide, i) => ({ ...slide, id: `${id}-${i}` })) })
    setEditing(true)
    setErrors({})
    setRenderError("")
    setTab("templates")
  }
  const selectedCategory = CATEGORIES.find((item) => item.id === category)!
  const normalizedQuery = query.trim().toLocaleLowerCase("ru")
  const templates = CAROUSEL_TEMPLATES.filter((item) =>
    (category === "all" || selectedCategory.templates.includes(item.id)) &&
    `${item.name} ${item.description}`.toLocaleLowerCase("ru").includes(normalizedQuery))
  const history = results.filter((item) => `${item.slides[0]?.title} ${item.request.topic} ${resolveCarouselStyle(item.request)?.name}`.toLocaleLowerCase("ru").includes(normalizedQuery))
  const customShown = category === "all" && (!normalizedQuery || "свой стиль описание фотографии референсы".includes(normalizedQuery))

  const form = <CarouselForm draft={draft} onChange={patchDraft} errors={errors} onBusyChange={setUploading} />
  const prepareButton = <Button disabled={uploading} className="h-11 w-full rounded-full" onClick={prepare}>
    {uploading ? <Spinner /> : null}{editor ? "Перейти к слайдам" : "Подготовить слайды"}<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} />
  </Button>

  return (
    <>
      <section ref={scroller} aria-label="Карусель" className="carousel-studio @container min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-20 pb-6 md:px-6 md:pt-7">
        <header className="mb-6 md:pr-40">
          <h1 className="text-[26px] leading-tight font-[450] tracking-[-0.02em] md:text-[32px]">Карусель</h1>
        </header>

        {editing && editor ? (
          <CarouselEditor scrollerRef={scroller} result={editor} onChange={setEditor} onBack={() => { setEditing(false); setTab("templates") }} onGenerate={generate} generating={generating} error={renderError} onCancel={() => { operation.current?.abort(); operation.current = null; setGenerating(false) }} />
        ) : (
          <Tabs value={tab} onValueChange={(next) => { setTab(next); setQuery("") }} className="gap-6">
            <TabsList aria-label="Раздел каруселей">
              <TabsTrigger value="templates">Шаблоны</TabsTrigger>
              <TabsTrigger value="history">Мои карусели{results.length > 0 && <span className="ml-1 text-muted-foreground tabular-nums">{results.length}</span>}</TabsTrigger>
            </TabsList>
            <TabsContent value="templates">
              <div className="carousel-layout">
                <aside className="carousel-desktop-form self-start">
                  <Card className="min-h-80 max-h-[calc(100dvh-14rem)] gap-0 overflow-hidden py-0 shadow-none">
                    <CardContent className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
                      <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-medium">Ваша карусель</h2><span className="text-xs text-muted-foreground">Черновик</span></div>
                      <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-2">
                        <div className="w-12 shrink-0 overflow-hidden rounded-lg"><CarouselCover template={style} /></div>
                        <div className="min-w-0"><p className="text-xs text-muted-foreground">Выбранный стиль</p><p className="mt-1 truncate text-sm font-medium">{style.name}</p></div>
                      </div>
                      {form}
                    </CardContent>
                    <div className="shrink-0 space-y-2 border-t border-border px-5 pt-3 pb-4">
                      {prepareButton}
                    </div>
                  </Card>
                </aside>
                <div className="min-w-0">
                  <div className="mb-5 flex flex-col gap-3 @min-[1000px]:flex-row @min-[1000px]:items-center">
                    <h2 className="mr-auto text-base font-medium">Выберите стиль</h2>
                    <CarouselFilters query={query} onQueryChange={setQuery} category={category} onCategoryChange={setCategory} />
                  </div>
                  <div className="carousel-template-grid" role="group" aria-label="Стили карусели">
                    {customShown && <Button variant="ghost" aria-pressed={draft.template === "custom"} onClick={() => patchDraft({ template: "custom" })} className="carousel-template h-auto flex-col items-stretch justify-start gap-0 rounded-xl border-0 p-0 text-left whitespace-normal hover:bg-transparent">
                      <span className={cn("relative flex aspect-4/5 w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/45 p-4", draft.template === "custom" && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
                        <HugeiconsIcon icon={Add01Icon} strokeWidth={ICON_STROKE} className="size-8! text-muted-foreground" />
                        <span className="text-center text-lg font-medium">В вашем стиле</span><span className="text-center text-xs font-normal text-muted-foreground">Описание и ваши<br />фотографии</span>
                        {draft.template === "custom" && <SelectionMark />}
                      </span>
                      <span className="pt-3 text-sm font-medium">Свой стиль</span><span className="mt-1 text-xs font-normal leading-relaxed text-muted-foreground">С чистого листа</span>
                    </Button>}
                    {templates.map((template) => <Button key={template.id} variant="ghost" aria-label={`Выбрать стиль «${template.name}»`} aria-pressed={draft.template === template.id} onClick={() => patchDraft({ template: template.id })} className="carousel-template h-auto flex-col items-stretch justify-start gap-0 rounded-xl border-0 p-0 text-left whitespace-normal hover:bg-transparent">
                      <span className={cn("relative block w-full rounded-xl", draft.template === template.id && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
                        <CarouselCover template={template} className="overflow-hidden rounded-xl" />
                        {draft.template === template.id && <SelectionMark />}
                      </span>
                      <span className="pt-3 text-sm font-medium">{template.name}</span><span className="mt-1 text-xs font-normal leading-relaxed text-muted-foreground">{template.description}</span>
                    </Button>)}
                  </div>
                  {!templates.length && !customShown && <NoMatches onReset={() => { setQuery(""); setCategory("all") }} />}
                </div>
              </div>
              <div className="carousel-mobile-action-space" aria-hidden="true" />
              <div className="carousel-mobile-action absolute inset-x-0 bottom-0 z-[7] border-t border-border bg-background px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="mb-2 truncate text-center text-xs text-muted-foreground">{style.name}</div>
                <Button className="h-11 w-full rounded-full" onClick={() => setSettingsOpen(true)}>Далее<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} /></Button>
              </div>
            </TabsContent>
            <TabsContent value="history">
              {results.length > 0 ? <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <InputGroup className="h-9 w-full rounded-full sm:w-64"><InputGroupAddon><HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} /></InputGroupAddon><InputGroupInput aria-label="Поиск каруселей" placeholder="Найти карусель" value={query} onChange={(event) => setQuery(event.target.value)} /></InputGroup>
                  <p className="text-xs text-muted-foreground">Последние 12 работ на этом устройстве</p>
                </div>
                <div className="carousel-history-grid">{history.map((result) => <SavedCarousel key={result.id} result={result} onOpen={() => { setViewer(result); setPrepared(undefined); setViewerOpen(true) }} onDelete={() => setToDelete(result)} />)}</div>
                {!history.length && <NoMatches onReset={() => setQuery("")} />}
              </> : <Empty className="min-h-80">
                <EmptyHeader><EmptyTitle>Здесь будут ваши карусели</EmptyTitle><EmptyDescription>Выберите стиль, добавьте текст и создайте первую историю.</EmptyDescription></EmptyHeader>
                <EmptyContent><Button className="h-10 rounded-full px-4" onClick={() => setTab("templates")}>Выбрать шаблон</Button></EmptyContent>
              </Empty>}
            </TabsContent>
          </Tabs>
        )}
      </section>

      <AppSheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <AppSheetContent>
          <AppSheetHeader><AppSheetTitle>Ваша карусель</AppSheetTitle><AppSheetDescription>{style.name}</AppSheetDescription></AppSheetHeader>
          <AppSheetBody className="pb-1">{settingsOpen && form}</AppSheetBody>
          <AppSheetFooter>{prepareButton}</AppSheetFooter>
        </AppSheetContent>
      </AppSheet>
      <CarouselResultViewer result={viewer} prepared={prepared} open={viewerOpen} onOpenChange={setViewerOpen} onReuse={reuse} />
      <ConfirmDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)} title="Удалить карусель?" description="Она исчезнет из истории на этом устройстве. Скачанные файлы сохранятся." actionLabel="Удалить" onConfirm={() => { setResults((current) => current.filter((item) => item.id !== toDelete?.id)); setToDelete(null) }} />
      <ConfirmDialog open={!!replace} onOpenChange={(open) => !open && setReplace(null)} title={replace === "structure" ? "Подготовить слайды заново?" : "Заменить текущий черновик?"} description={replace === "structure" ? "Изменения текста отдельных слайдов будут заменены новой структурой. Сохранённые карусели останутся в истории." : "Текущий черновик заменится копией выбранной карусели. Оригинал останется в истории."} actionLabel="Заменить" onConfirm={() => { if (replace === "structure") startEditor(); else if (replace) applyReuse(replace); setReplace(null) }} />
    </>
  )
}

function SelectionMark() {
  return <Badge className="absolute top-2 right-2 size-6 rounded-full border-0 p-0"><HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="size-3.5!" /><span className="sr-only">Выбран</span></Badge>
}

function NoMatches({ onReset }: { onReset: () => void }) {
  return <Empty className="py-16"><EmptyHeader><EmptyTitle>Ничего не нашлось</EmptyTitle><EmptyDescription>Попробуйте другое название или сбросьте фильтры.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="secondary" className="rounded-full" onClick={onReset}>Сбросить фильтры</Button></EmptyContent></Empty>
}

function CarouselFilters({ query, onQueryChange, category, onCategoryChange }: { query: string; onQueryChange: (value: string) => void; category: string; onCategoryChange: (value: string) => void }) {
  const mobile = useIsMobile()
  const [searchOpen, setSearchOpen] = React.useState(Boolean(query))
  const [instantSearch, setInstantSearch] = React.useState(true)
  const [categoryOpen, setCategoryOpen] = React.useState(false)
  const searchInput = React.useRef<HTMLInputElement>(null)
  const searchToggle = React.useRef<HTMLButtonElement>(null)
  const focusSearch = React.useRef(false)
  const searchId = React.useId()
  const visible = !mobile || searchOpen || Boolean(query)
  const selectedCategory = CATEGORIES.find((item) => item.id === category)!

  React.useLayoutEffect(() => {
    if (searchOpen && focusSearch.current) {
      focusSearch.current = false
      searchInput.current?.focus({ preventScroll: true })
    }
  }, [searchOpen])

  const changeSearchOpen = (next: boolean) => {
    setInstantSearch(lastInput() === "keyboard")
    focusSearch.current = next
    setSearchOpen(next)
    if (next) setCategoryOpen(false)
    else {
      onQueryChange("")
      searchToggle.current?.focus({ preventScroll: true })
    }
  }

  return <div className="roles-filters carousel-filters" data-search-open={visible} data-instant={instantSearch} onKeyDown={(event) => {
    if (event.key === "Escape" && mobile && visible && !categoryOpen) {
      event.preventDefault()
      event.stopPropagation()
      changeSearchOpen(false)
    }
  }}>
    <div className="roles-search-field" id={searchId} inert={!visible} aria-hidden={!visible}>
      <InputGroup className="h-9 rounded-full bg-muted/60">
        <InputGroupAddon className="pl-3"><HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} /></InputGroupAddon>
        <InputGroupInput ref={searchInput} aria-label="Поиск шаблонов" placeholder="Найти стиль" value={query} onChange={(event) => onQueryChange(event.target.value)} className="min-w-0 pr-4 text-base md:text-sm" />
      </InputGroup>
    </div>
    <Button ref={searchToggle} variant="secondary" size="icon-lg" className="roles-search-toggle relative rounded-full active:scale-[0.97] md:hidden" aria-label={visible ? "Закрыть поиск и очистить запрос" : "Найти стиль"} aria-expanded={visible} aria-controls={searchId} onClick={() => changeSearchOpen(!visible)}>
      <span className="roles-search-icon" aria-hidden="true"><HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} /></span>
      <span className="roles-search-close-icon" aria-hidden="true"><HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} /></span>
    </Button>
    <div className="roles-filters-category" inert={mobile && visible} aria-hidden={mobile && visible}>
      <AppMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
        <AppMenuTrigger asChild>
          <Button variant="outline" aria-label={`Стиль: ${selectedCategory.name}`} className="h-9 gap-2 rounded-full px-3">
            {selectedCategory.name}<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="text-muted-foreground" />
          </Button>
        </AppMenuTrigger>
        <AppMenuContent align={mobile ? "start" : "end"} className="w-44" aria-label="Стили карусели">
          <AppMenuRadioGroup value={category} onValueChange={onCategoryChange}>
            {CATEGORIES.map((item) => <AppMenuRadioItem key={item.id} value={item.id}>{item.name}</AppMenuRadioItem>)}
          </AppMenuRadioGroup>
        </AppMenuContent>
      </AppMenu>
    </div>
  </div>
}

function CarouselForm({ draft, onChange, errors, onBusyChange }: { draft: CarouselDraft; onChange: (patch: Partial<CarouselDraft>) => void; errors: CarouselDraftErrors; onBusyChange: (busy: boolean) => void }) {
  const id = React.useId()
  const topicInput = React.useRef<HTMLTextAreaElement>(null)
  const improveTopic = () => {
    if (!draft.topic.trim()) {
      toast.error("Сначала заполните поле «Тема или готовый текст»")
      topicInput.current?.focus()
      return
    }
    // This local editor preserves the author's words; prompt instructions would end up on slides.
    const previous = draft.topic
    const improved = previous.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trim().replace(/[\t ]+/g, " ")).join("\n").replace(/\n{3,}/g, "\n\n").trim()
    if (improved === previous) {
      toast("Текст уже оформлен", { description: "Добавьте цель, аудиторию и ключевые мысли, чтобы уточнить запрос." })
    } else {
      onChange({ topic: improved })
      toast.success("Оформление текста улучшено", { action: { label: "Вернуть", onClick: () => onChange({ topic: previous }) } })
    }
    topicInput.current?.focus()
  }
  return <div data-carousel-form className="space-y-5">
    {draft.template === "custom" && <>
      <Field data-invalid={!!errors.styleDescription}><FieldLabel htmlFor={`${id}-style`}>Опишите свой стиль</FieldLabel><Textarea id={`${id}-style`} placeholder="Например, тёплая бумага, крупные заголовки, зелёный акцент" value={draft.styleDescription} maxLength={1200} aria-invalid={!!errors.styleDescription} aria-describedby={errors.styleDescription ? `${id}-style-error` : undefined} onChange={(event) => onChange({ styleDescription: event.target.value })} className="min-h-24 resize-y rounded-xl" />{errors.styleDescription && <FieldError id={`${id}-style-error`}>{errors.styleDescription}</FieldError>}</Field>
      <CarouselReferences references={draft.references} onChange={(references) => onChange({ references })} onBusyChange={onBusyChange} />
    </>}
    <Field data-invalid={!!errors.topic}>
      <div className="flex items-center justify-between gap-2"><FieldLabel htmlFor={`${id}-topic`}>Тема или готовый текст</FieldLabel><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground" aria-label="Улучшить запрос" onClick={improveTopic}><HugeiconsIcon icon={MagicWand01Icon} strokeWidth={ICON_STROKE} /></Button></TooltipTrigger><TooltipContent>Улучшить запрос</TooltipContent></Tooltip></div>
      <Textarea ref={topicInput} id={`${id}-topic`} value={draft.topic} placeholder="Опишите идею или вставьте текст. Каждый абзац — новая мысль." maxLength={2400} aria-invalid={!!errors.topic} aria-describedby={errors.topic ? `${id}-topic-error` : `${id}-topic-help`} onChange={(event) => onChange({ topic: event.target.value })} className="h-36 min-h-24 max-h-52 resize-y rounded-xl text-sm [field-sizing:fixed]" />
      <div id={`${id}-topic-help`} className="flex justify-between gap-2 text-xs text-muted-foreground"><span>Разложим текст по слайдам</span><span className="tabular-nums">{draft.topic.length}/2400</span></div>
      {errors.topic && <FieldError id={`${id}-topic-error`}>{errors.topic}</FieldError>}
    </Field>
    <Field data-invalid={!!errors.audience}><FieldLabel htmlFor={`${id}-audience`}>Для кого эта карусель</FieldLabel><Input id={`${id}-audience`} value={draft.audience} placeholder="Например, начинающие авторы" maxLength={160} aria-invalid={!!errors.audience} aria-describedby={errors.audience ? `${id}-audience-error` : undefined} onChange={(event) => onChange({ audience: event.target.value })} className="h-10 rounded-xl" />{errors.audience && <FieldError id={`${id}-audience-error`}>{errors.audience}</FieldError>}</Field>
    <div className="grid grid-cols-2 gap-3">
      <Field><FieldLabel htmlFor={`${id}-count`}>Слайды</FieldLabel><AppMenu><AppMenuTrigger asChild><Button id={`${id}-count`} variant="outline" className="h-10 w-full justify-between gap-1 rounded-full px-3">{carouselSlideCount(draft.count)}<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="shrink-0 text-muted-foreground" /></Button></AppMenuTrigger><AppMenuContent align="start" aria-label="Количество слайдов"><AppMenuRadioGroup value={String(draft.count)} onValueChange={(value) => onChange({ count: Number(value) })}>{Array.from({ length: 8 }, (_, i) => i + 3).map((value) => <AppMenuRadioItem key={value} value={String(value)}>{carouselSlideCount(value)}</AppMenuRadioItem>)}</AppMenuRadioGroup></AppMenuContent></AppMenu></Field>
      <Field><FieldLabel htmlFor={`${id}-format`}>Формат</FieldLabel><AppMenu><AppMenuTrigger asChild><Button id={`${id}-format`} variant="outline" className="h-10 w-full justify-between rounded-full px-3">{draft.format}<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="text-muted-foreground" /></Button></AppMenuTrigger><AppMenuContent align="end" aria-label="Формат слайдов"><AppMenuRadioGroup value={draft.format} onValueChange={(value) => onChange({ format: value as CarouselDraft["format"] })}>{CAROUSEL_FORMATS.map((item) => <AppMenuRadioItem key={item.value} value={item.value}>{item.value}</AppMenuRadioItem>)}</AppMenuRadioGroup></AppMenuContent></AppMenu></Field>
    </div>
    <FieldDescription>{CAROUSEL_FORMATS.find((item) => item.value === draft.format)?.description} px · PNG и ZIP</FieldDescription>
  </div>
}

function SavedCarousel({ result, onOpen, onDelete }: { result: CarouselResult; onOpen: () => void; onDelete: () => void }) {
  const [cover, setCover] = React.useState("")
  const style = resolveCarouselStyle(result.request)!
  React.useEffect(() => {
    const controller = new AbortController()
    let url = ""
    renderCarouselSlide(result, 0, { signal: controller.signal }).then((blob) => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(blob)
      setCover(url)
    }).catch(() => {})
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [result])
  return <article className="min-w-0">
    <Button variant="ghost" onClick={onOpen} aria-label={`Открыть карусель «${result.slides[0].title}»`} className="h-auto w-full flex-col items-stretch gap-0 rounded-xl border-0 p-0 text-left whitespace-normal hover:bg-transparent">
      <span className="block aspect-4/5 overflow-hidden rounded-xl bg-muted">{cover ? <img src={cover} alt="" className="size-full object-contain" /> : <CarouselCover template={style} title={result.slides[0].title} />}</span>
      <span className="mt-3 line-clamp-2 text-sm font-medium">{result.slides[0].title}</span>
    </Button>
    <div className="mt-1 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{carouselSlideCount(result.slides.length)} · {result.request.format}</span><Button variant="ghost" size="icon-sm" className="shrink-0 rounded-full text-muted-foreground" aria-label={`Удалить карусель «${result.slides[0].title}»`} onClick={onDelete}><HugeiconsIcon icon={Delete02Icon} strokeWidth={ICON_STROKE} /></Button></div>
  </article>
}
