import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowRight01Icon, PlayIcon, RepeatIcon } from "@hugeicons/core-free-icons"

import { AutoClip } from "@/components/auto-clip"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { ModelLogo } from "@/components/model-logo"
import { TrendCategories } from "@/components/trends/trend-categories"
import { TrendPrompt } from "@/components/trends/trend-prompt"
import { AppMenu, AppMenuContent, AppMenuRadioGroup, AppMenuRadioItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { findModel } from "@/data/models"
import { TRENDS, TREND_CATEGORIES, type Trend, type TrendCategoryId } from "@/data/trends"
import { CHAT_TYPE_ICON, ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"
import "./trends.css"

type MediaType = "all" | Trend["type"]
const FORMATS: { id: MediaType; label: string }[] = [
  { id: "all", label: "Все форматы" },
  { id: "image", label: "Фото" },
  { id: "video", label: "Видео" },
]

export function TrendsView({ onRepeat }: { onRepeat: (trend: Trend) => void }) {
  const [category, setCategory] = React.useState<TrendCategoryId>("all")
  const [format, setFormat] = React.useState<MediaType>("all")
  const [selected, setSelected] = React.useState<Trend | null>(null)
  const [open, setOpen] = React.useState(false)
  const scroller = React.useRef<HTMLElement>(null)
  const gallery = React.useRef<HTMLDivElement>(null)
  const items = React.useMemo(() => TRENDS.filter((trend) =>
    (category === "all" || trend.categories.includes(category)) &&
    (format === "all" || trend.type === format)
  ), [category, format])
  const index = items.findIndex((trend) => trend.id === selected?.id)

  React.useEffect(() => {
    if (!open) return
    gallery.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" })
  }, [open, selected?.id])

  const changeCategory = (next: string) => {
    setCategory(next as TrendCategoryId)
    scroller.current?.scrollTo({ top: 0 })
  }

  return (
    <>
      <section ref={scroller} aria-label="Тренды" className="@container min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-20 pb-6 md:px-6 md:pt-7">
        <header className="mb-6 px-1 md:mb-7 md:pr-40">
          <h1 className="text-[26px] leading-tight font-[450] tracking-[-0.02em] md:text-[32px]">Тренды</h1>
        </header>

        <Tabs value={category} onValueChange={changeCategory} className="gap-4 md:gap-5">
          <div className="-mx-1 flex min-w-0 flex-col gap-2 px-1 pt-2 pb-3 md:flex-row md:items-center md:justify-between md:gap-3">
            <TrendCategories />
            <div className="flex shrink-0 items-center justify-between gap-3">
              <AppMenu>
                <AppMenuTrigger asChild>
                  <Button variant="outline" aria-label={`Формат: ${FORMATS.find((item) => item.id === format)?.label}`} className="h-9 gap-2 rounded-full px-3">
                    {FORMATS.find((item) => item.id === format)?.label}
                    <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="text-muted-foreground" />
                  </Button>
                </AppMenuTrigger>
                <AppMenuContent align="end" className="w-44">
                  <AppMenuRadioGroup value={format} onValueChange={(next) => { setFormat(next as MediaType); scroller.current?.scrollTo({ top: 0 }) }}>
                    {FORMATS.map((item) => <AppMenuRadioItem key={item.id} value={item.id}>{item.label}</AppMenuRadioItem>)}
                  </AppMenuRadioGroup>
                </AppMenuContent>
              </AppMenu>
              <span role="status" className="pr-2 text-xs text-muted-foreground tabular-nums md:sr-only">{items.length} из {TRENDS.length}</span>
            </div>
          </div>

          <TabsContent key={category} value={category}>
            {items.length ? (
              <div role="list" aria-label="Галерея трендов" className="trends-grid">
                {items.map((trend, i) => (
                  <div role="listitem" key={trend.id} className="trends-grid-item">
                    <TrendCard trend={trend} index={i} play={!open} onOpen={() => {
                      setSelected(trend)
                      setOpen(true)
                    }} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty className="py-20">
                <EmptyHeader>
                  <EmptyTitle>Таких трендов пока нет</EmptyTitle>
                  <EmptyDescription>Выберите другой формат или посмотрите все категории.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="secondary" className="h-10 rounded-full px-4" onClick={() => { setCategory("all"); setFormat("all") }}>Показать все тренды</Button>
                </EmptyContent>
              </Empty>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <FileViewer
        file={selected && { name: selected.preset.title, url: selected.preset.video ?? selected.preset.image, type: selected.type === "video" ? "video/mp4" : "image/jpeg", size: 0 }}
        open={open}
        onOpenChange={setOpen}
        details={selected ? {
          position: `${index + 1} / ${items.length}`,
          onPrevious: index > 0 ? () => setSelected(items[index - 1]) : undefined,
          onNext: index >= 0 && index < items.length - 1 ? () => setSelected(items[index + 1]) : undefined,
          gallery: (
            <div ref={gallery} className="flex flex-col gap-3">
              {items.map((trend) => (
                <Button key={trend.id} variant="ghost" aria-label={`Открыть тренд «${trend.preset.title}»`} aria-current={selected.id === trend.id ? "true" : undefined}
                  onClick={() => setSelected(trend)} className="group/thumb relative h-auto w-full rounded-full border-0 bg-transparent p-0 hover:bg-transparent">
                  <img src={trend.preset.image} alt="" loading="lazy" className={cn("aspect-square w-full rounded-xl object-cover", selected.id === trend.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-65 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100")} />
                  {trend.type === "video" && <Badge className="dark absolute right-1.5 bottom-1.5 size-5 bg-background/70 p-0 text-foreground"><HugeiconsIcon icon={PlayIcon} strokeWidth={ICON_STROKE} /></Badge>}
                </Button>
              ))}
            </div>
          ),
          info: <TrendInfo key={selected.id} trend={selected} />,
          primaryAction: <Button className="h-11 flex-1 rounded-full px-5" onClick={() => { setOpen(false); onRepeat(selected) }}><HugeiconsIcon icon={RepeatIcon} strokeWidth={ICON_STROKE} />Повторить</Button>,
        } : undefined}
      />
    </>
  )
}

function TrendCard({ trend, index, play, onOpen }: { trend: Trend; index: number; play: boolean; onOpen: React.MouseEventHandler<HTMLButtonElement> }) {
  const model = findModel(trend.model, trend.type)
  return (
    <Button variant="ghost" onClick={onOpen} aria-label={`${trend.preset.title}: подробнее`} className={cn("dark trends-card group/trend relative isolate h-auto w-full items-end justify-start overflow-hidden rounded-xl border-0 bg-background p-0 text-left whitespace-normal text-foreground hover:bg-background hover:text-foreground", trend.type === "video" ? "aspect-9/16" : "aspect-4/5")}>
      <img src={trend.preset.image} alt="" loading={index < 8 ? "eager" : "lazy"} decoding="async" draggable={false} className="absolute inset-0 -z-10 size-full object-cover" />
      {trend.preset.video && play && <AutoClip src={trend.preset.video} delay={(index % 8) * 120} className="-z-10" />}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
      <span className="trends-card-meta absolute inset-x-0 top-0 flex flex-wrap gap-1.5 bg-linear-to-b from-background/65 to-transparent p-3 pb-8">
        <Badge variant="secondary" className="h-6 gap-1.5 bg-background/65 px-2 text-foreground"><ModelLogo logo={model?.family.logo} mode={trend.type} className="size-3" />{trend.model}</Badge>
        <Badge variant="secondary" className="h-6 gap-1 bg-background/65 px-2 text-foreground"><HugeiconsIcon icon={CHAT_TYPE_ICON[trend.type]} strokeWidth={ICON_STROKE} />{trend.type === "video" ? "Видео" : "Фото"}</Badge>
      </span>
      {trend.type === "video" && <Badge variant="secondary" className="trends-card-play absolute top-3 right-3 size-7 bg-background/60 p-0 text-foreground"><HugeiconsIcon icon={PlayIcon} strokeWidth={ICON_STROKE} /></Badge>}
      <span className="trends-card-caption flex w-full flex-col items-start gap-3 p-3.5 md:p-4">
        <span className="text-[15px] leading-snug font-medium md:text-base">{trend.preset.title}</span>
        <span aria-hidden="true" className={cn(buttonVariants({ variant: "secondary", size: "default" }), "trends-card-more h-9 w-full rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background")}>
          Подробнее <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} />
        </span>
      </span>
    </Button>
  )
}

function TrendInfo({ trend }: { trend: Trend }) {
  const model = findModel(trend.model, trend.type)
  const categories = TREND_CATEGORIES.filter((item) => item.id !== "all" && trend.categories.includes(item.id) && !["new", "popular"].includes(item.id))
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {categories.map((category) => <Badge key={category.id} variant="secondary">{category.label}</Badge>)}
        </div>
        <h2 className="text-2xl leading-tight font-medium tracking-tight">{trend.preset.title}</h2>
      </div>
      <TrendPrompt prompt={trend.preset.prompt} />
      <section aria-label="Параметры генерации">
        <h3 className="mb-4 text-sm font-medium">Параметры генерации</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
          <div className="col-span-2"><dt className="mb-1.5 text-xs text-muted-foreground">Модель</dt><dd className="flex items-center gap-2 font-medium"><ModelLogo logo={model?.family.logo} mode={trend.type} color />{trend.model}</dd></div>
          <div><dt className="mb-1.5 text-xs text-muted-foreground">Формат</dt><dd>{trend.type === "video" ? "Видео" : "Фото"}</dd></div>
          <div><dt className="mb-1.5 text-xs text-muted-foreground">Пропорции</dt><dd>{trend.settings.ratio}</dd></div>
          <div><dt className="mb-1.5 text-xs text-muted-foreground">Качество</dt><dd>{trend.settings.resolution}</dd></div>
          {trend.type === "video" && <div><dt className="mb-1.5 text-xs text-muted-foreground">Длительность</dt><dd>{trend.settings.duration}</dd></div>}
        </dl>
      </section>
    </div>
  )
}
