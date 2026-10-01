import * as React from "react"
import { createPortal } from "react-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/ui/copy-button"
import { renderCarouselSlide } from "@/lib/carousel/export"
import { carouselSlideCount, resolveCarouselStyle, updateCarouselSlide, validateCarouselSlides, type CarouselResult } from "@/lib/carousel/model"
import { ICON_STROKE } from "@/lib/icons"
import { lastInput } from "@/lib/input-modality"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type Props = {
  result: CarouselResult
  onChange: (result: CarouselResult) => void
  onBack: () => void
  onGenerate: () => void
  generating: boolean
  error: string
  onCancel: () => void
  scrollerRef?: React.RefObject<HTMLElement | null>
}

export function CarouselEditor({ result, onChange, onBack, onGenerate, generating, error, onCancel, scrollerRef }: Props) {
  const [selected, setSelected] = React.useState(0)
  const [preview, setPreview] = React.useState<{ key: string; url: string; error: string }>({ key: "", url: "", error: "" })
  const mobile = useIsMobile()
  const [showScrollHint, setShowScrollHint] = React.useState(false)
  const [overlayHost, setOverlayHost] = React.useState<HTMLElement | null>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const footer = React.useRef<HTMLDivElement>(null)
  const createButton = React.useRef<HTMLButtonElement>(null)
  const strip = React.useRef<HTMLDivElement>(null)
  const previewUrl = React.useRef("")
  const id = React.useId()
  const slide = result.slides[selected]
  const style = resolveCarouselStyle(result.request)!
  const invalid = validateCarouselSlides(result.slides)
  const slideErrors = invalid[slide.id]
  const unfinished = result.slides.filter((item) => item.kind !== "cover" && !item.body.trim()).length
  const key = JSON.stringify({ request: result.request, slide, selected })

  React.useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current) }, [])

  // Only the changed slide is rasterized. Cancel obsolete work before replacing its object URL.
  React.useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        // An unfinished outline still has a useful cover preview; empty content isn't exportable.
        const previewResult = { ...result, slides: result.slides.map((item) => ({ ...item, title: item.title || "Заголовок слайда", body: item.body || (item.kind === "cover" ? "" : "Здесь появится ваш текст. Добавьте его справа или ниже."), kind: item.kind === "prompt" ? "content" as const : item.kind })) }
        const blob = await renderCarouselSlide(previewResult, selected, { signal: controller.signal })
        if (controller.signal.aborted) return
        const url = URL.createObjectURL(blob)
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
        previewUrl.current = url
        setPreview({ key, url, error: "" })
      } catch (reason) {
        if (!controller.signal.aborted) setPreview({ key, url: "", error: reason instanceof Error ? reason.message : "Не удалось подготовить превью. Измените текст или вернитесь к настройкам." })
      }
    }, 180)
    return () => { window.clearTimeout(timer); controller.abort() }
    // `key` is the exact request and visible slide; unrelated edits never rasterize this slide.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  React.useEffect(() => {
    strip.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [selected])

  React.useEffect(() => {
    const root = scrollerRef?.current
    const target = createButton.current
    if (!mobile || !root || !target) {
      setShowScrollHint(false)
      return
    }
    // The scroll container is also a CSS container. Portal the mask into the workspace
    // so it remains at the visible bottom instead of moving with the editor content.
    setOverlayHost(root.closest<HTMLElement>('[data-slot="sidebar-inset"]') ?? root.parentElement)
    const updateVisibility = () => {
      const rootBottom = root.getBoundingClientRect().bottom
      const viewport = window.visualViewport
      const visibleBottom = Math.min(rootBottom, viewport ? viewport.offsetTop + viewport.height : window.innerHeight)
      setShowScrollHint(target.getBoundingClientRect().top >= visibleBottom)
    }
    const observer = new IntersectionObserver(updateVisibility, { root, threshold: [0, 1] })
    observer.observe(target)
    const resizeObserver = new ResizeObserver(updateVisibility)
    resizeObserver.observe(root)
    if (content.current) resizeObserver.observe(content.current)
    if (footer.current) resizeObserver.observe(footer.current)
    root.addEventListener("scroll", updateVisibility, { passive: true })
    window.visualViewport?.addEventListener("resize", updateVisibility)
    window.visualViewport?.addEventListener("scroll", updateVisibility)
    updateVisibility()
    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      root.removeEventListener("scroll", updateVisibility)
      window.visualViewport?.removeEventListener("resize", updateVisibility)
      window.visualViewport?.removeEventListener("scroll", updateVisibility)
    }
  }, [mobile, scrollerRef])

  const scrollToCreate = () => {
    const instant = lastInput() === "keyboard" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    footer.current?.scrollIntoView({ block: "end", inline: "nearest", behavior: instant ? "instant" : "smooth" })
    if (lastInput() === "keyboard") footer.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true })
  }

  const update = (field: "title" | "body", value: string) => {
    const next = updateCarouselSlide(result, selected, field, value)
    if (field === "body" && value.trim() && next.slides[selected].kind === "prompt") next.slides[selected] = { ...next.slides[selected], kind: "content" }
    onChange(next)
  }
  const move = (direction: -1 | 1) => {
    const destination = selected + direction
    if (destination < 1 || destination >= result.slides.length || selected === 0) return
    const slides = [...result.slides]
    ;[slides[selected], slides[destination]] = [slides[destination], slides[selected]]
    onChange({ ...result, slides })
    setSelected(destination)
  }
  const create = () => {
    const first = result.slides.findIndex((item) => invalid[item.id])
    if (first !== -1) {
      setSelected(first)
      requestAnimationFrame(() => document.getElementById(`${id}-${invalid[result.slides[first].id]?.title ? "title" : "body"}`)?.focus())
      return
    }
    onGenerate()
  }
  const live = preview.key === key
  return <div ref={content}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <Button variant="ghost" size="lg" className="-ml-3 rounded-full" onClick={onBack} disabled={generating}><HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={ICON_STROKE} />К настройкам</Button>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{style.name}</span><span aria-hidden="true">·</span><span>{result.request.format}</span><span aria-hidden="true">·</span><span>{carouselSlideCount(result.slides.length)}</span></div>
    </div>
    <div className="carousel-editor-layout">
      <div className="min-w-0">
        <div className="relative flex min-h-56 items-center justify-center rounded-2xl bg-muted/60 p-4 md:p-6" aria-label={`Предпросмотр слайда ${selected + 1}`} aria-busy={!live}>
          {live && preview.error ? <p role="alert" className="p-4 text-sm text-destructive">{preview.error}</p> : preview.url ? <img src={preview.url} alt={live ? `Слайд ${selected + 1}: ${slide.title}` : "Предыдущая версия слайда. Обновляем превью."} className="max-h-[420px] w-full rounded-lg object-contain max-md:max-h-64" /> : <Skeleton style={{ aspectRatio: result.request.format.replace(":", "/") }} className="max-h-[420px] w-full max-md:max-h-64" />}
          {!live && preview.url && <span className="absolute right-6 bottom-6 rounded-full bg-background p-2"><Spinner aria-label="Обновляем превью" /></span>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Предыдущий слайд" disabled={selected === 0 || generating} onClick={() => setSelected(selected - 1)}><HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={ICON_STROKE} /></Button>
          <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">{selected + 1} из {result.slides.length}</span>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Следующий слайд" disabled={selected === result.slides.length - 1 || generating} onClick={() => setSelected(selected + 1)}><HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} /></Button>
        </div>
        <div ref={strip} className="mt-2 flex flex-wrap gap-2 p-1" role="group" aria-label="Слайды карусели">
          {result.slides.map((item, index) => {
            const errors = invalid[item.id]
            const needsText = !item.title.trim() || (item.kind !== "cover" && !item.body.trim())
            const issue = [errors?.title, errors?.body].filter(Boolean).join(" ")
            const label = `${index === 0 ? "Обложка" : `Слайд ${index + 1}`}: ${item.title.trim() || "Без заголовка"}.${issue ? ` ${issue}` : " Заполнен."}`
            return <Button key={item.id} variant={index === selected ? "secondary" : "ghost"} size="icon" disabled={generating} aria-label={label} aria-current={selected === index ? "step" : undefined} onClick={() => setSelected(index)} className={cn("size-9 shrink-0 scroll-mb-32 rounded-full border text-xs tabular-nums md:scroll-mb-0", index === selected && "ring-2 ring-primary ring-offset-2 ring-offset-background", errors ? "border-destructive bg-destructive/5 text-destructive" : "border-border text-foreground", needsText && "border-dashed")}>
              {String(index + 1).padStart(2, "0")}
            </Button>
          })}
        </div>
        {Object.keys(invalid).length > 0 && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Красные номера — слайды, которые нужно заполнить или проверить.</p>}
      </div>
      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-2"><h2 className="text-base font-medium">{selected === 0 ? "Обложка" : `Слайд ${selected + 1}`}</h2><Badge variant="secondary">Черновик</Badge></div>
          <Field data-invalid={!!slideErrors?.title}>
            <FieldLabel htmlFor={`${id}-title`}>Заголовок</FieldLabel><Input id={`${id}-title`} disabled={generating} value={slide.title} onChange={(event) => update("title", event.target.value)} aria-invalid={!!slideErrors?.title} aria-describedby={slideErrors?.title ? `${id}-title-error` : undefined} className="h-10 rounded-xl" />
            <FieldDescription>{slide.title.length}/160 символов</FieldDescription>
            {slideErrors?.title && <FieldError id={`${id}-title-error`}>{slideErrors.title}</FieldError>}
          </Field>
          <Field data-invalid={!!slideErrors?.body}>
            <FieldLabel htmlFor={`${id}-body`}>{selected === 0 ? "Подзаголовок" : "Текст слайда"}{selected === 0 && <span className="text-xs font-normal text-muted-foreground">Необязательно</span>}</FieldLabel>
            <Textarea id={`${id}-body`} disabled={generating} value={slide.body} placeholder={selected === 0 ? "Короткая мысль, которая дополнит заголовок" : "Добавьте одну мысль, пример или полезный совет для читателя"} onChange={(event) => update("body", event.target.value)} aria-invalid={!!slideErrors?.body} aria-describedby={slideErrors?.body ? `${id}-body-error` : undefined} className="h-44 min-h-32 max-h-72 resize-y rounded-xl [field-sizing:fixed]" />
            <FieldDescription>{slide.body.length}/2400 символов · Размер текста подстроится под слайд</FieldDescription>
            {slideErrors?.body && <FieldError id={`${id}-body-error`}>{slideErrors.body}</FieldError>}
          </Field>
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={`${slide.title}\n\n${slide.body}`} label="Копировать текст слайда" className="rounded-full" />
            <div className="ml-auto flex gap-1"><Button variant="ghost" size="icon" className="rounded-full" aria-label="Переместить слайд раньше" disabled={selected < 2 || generating} onClick={() => move(-1)}><HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={ICON_STROKE} /></Button><Button variant="ghost" size="icon" className="rounded-full" aria-label="Переместить слайд позже" disabled={selected === 0 || selected === result.slides.length - 1 || generating} onClick={() => move(1)}><HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} /></Button></div>
          </div>
          {unfinished > 0 && <p className="rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">Структура готова. Заполните текст остальных слайдов перед созданием карусели.</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div ref={footer} id={`${id}-create`} className="flex scroll-mb-6 gap-2">
            {generating && <Button variant="secondary" className="h-11 rounded-full" onClick={onCancel}>Отмена</Button>}
            <Button ref={createButton} className="h-11 flex-1 rounded-full" disabled={generating} onClick={create}>{generating && <Spinner />}{generating ? "Подготовка изображений…" : "Создать карусель"}</Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Черновик сохраняется на этом устройстве</p>
        </CardContent>
      </Card>
    </div>
    {mobile && showScrollHint && overlayHost && createPortal(
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] flex h-32 items-end justify-center bg-linear-to-t from-background via-background/90 to-background/0 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <Button variant="outline" size="icon" className="pointer-events-auto size-10 rounded-full bg-background shadow-sm" aria-label={generating ? "Перейти к управлению созданием карусели" : "Перейти к созданию карусели"} aria-controls={`${id}-create`} onClick={scrollToCreate}>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </div>, overlayHost,
    )}
  </div>
}
