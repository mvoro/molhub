import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { FileViewer } from "@/components/file-viewer/file-viewer"
import {
  AppSheet,
  AppSheetBody,
  AppSheetContent,
  AppSheetDescription,
  AppSheetHeader,
  AppSheetTitle,
} from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { downloadCarousel, renderCarousel } from "@/lib/carousel/export"
import {
  CAROUSEL_FORMATS,
  carouselFileName,
  carouselSlideCount,
  resolveCarouselStyle,
  type CarouselResult,
} from "@/lib/carousel/model"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

type PreparedCarousel = {
  result: CarouselResult
  blobs: Blob[]
  urls: string[]
}

export type CarouselResultViewerProps = {
  result: CarouselResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReuse: (result: CarouselResult) => void
  /** The just-created PNGs can be reused without rendering the same carousel twice. */
  prepared?: Blob[]
}

export function CarouselResultViewer({ result, open, onOpenChange, onReuse, prepared }: CarouselResultViewerProps) {
  const mobile = useIsMobile()
  const [media, setMedia] = React.useState<PreparedCarousel | null>(null)
  const [selected, setSelected] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)
  const [downloading, setDownloading] = React.useState(false)
  const [preparation, setPreparation] = React.useState({ result, prepared, open, attempt })
  const galleryRef = React.useRef<HTMLDivElement>(null)
  const downloadVersion = React.useRef(0)

  // Reset synchronously for a new opening so revoked URLs never flash on a later visit.
  if (preparation.result !== result || preparation.prepared !== prepared || preparation.open !== open || preparation.attempt !== attempt) {
    setPreparation({ result, prepared, open, attempt })
    setDownloading(false)
    if (open) {
      setMedia(null)
      setSelected(0)
      setError(null)
    }
  }

  React.useEffect(() => {
    downloadVersion.current += 1
    if (!open || !result) return

    const controller = new AbortController()
    const urls: string[] = []

    const prepare = async () => {
      try {
        const blobs = await (prepared?.length === result.slides.length
          ? Promise.resolve(prepared)
          : renderCarousel(result, { signal: controller.signal }))
        if (controller.signal.aborted) return
        if (!blobs.length || blobs.length !== result.slides.length) {
          throw new Error("Не удалось подготовить все слайды.")
        }
        for (const blob of blobs) urls.push(URL.createObjectURL(blob))
        setMedia({ result, blobs, urls })
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Не удалось подготовить слайды.")
        }
      }
    }

    void prepare()
    return () => {
      controller.abort()
      urls.forEach(url => URL.revokeObjectURL(url))
      downloadVersion.current += 1
    }
  }, [open, result, prepared, attempt])

  React.useEffect(() => {
    galleryRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [selected, mobile])

  if (!result) return null

  const ready = media?.result === result ? media : null
  const title = result.slides[0]?.title || result.request.topic
  const index = Math.min(selected, Math.max(0, result.slides.length - 1))
  const slide = result.slides[index]
  const format = CAROUSEL_FORMATS.find(item => item.value === result.request.format)
  const style = resolveCarouselStyle(result.request)
  const position = `Слайд ${index + 1} из ${result.slides.length}`
  const fullText = result.slides.map((item, itemIndex) => `Слайд ${itemIndex + 1}. ${item.title}${item.body ? `\n\n${item.body}` : ""}`).join("\n\n———\n\n")

  const reuse = () => {
    onOpenChange(false)
    onReuse(result)
  }

  const download = async () => {
    if (!ready || downloading) return
    const version = downloadVersion.current
    setDownloading(true)
    try {
      await downloadCarousel(result, ready.blobs)
    } catch {
      if (version === downloadVersion.current) toast.error("Не удалось скачать карусель. Попробуйте ещё раз.")
    } finally {
      if (version === downloadVersion.current) setDownloading(false)
    }
  }

  if (!ready || !slide) {
    return (
      <AppSheet open={open} onOpenChange={onOpenChange}>
        <AppSheetContent className="md:max-w-[480px]">
          <AppSheetHeader>
            <AppSheetTitle>{error ? "Не удалось открыть карусель" : "Открываем карусель"}</AppSheetTitle>
            <AppSheetDescription>
              {error ? "Попробуйте подготовить слайды ещё раз." : "Подготавливаем слайды в полном разрешении."}
            </AppSheetDescription>
          </AppSheetHeader>
          <AppSheetBody className="flex min-h-36 flex-col items-center justify-center gap-4 px-6 pb-6">
            {error ? (
              <>
                <p role="alert" className="text-center text-sm text-muted-foreground">{error}</p>
                <Button className="h-10 rounded-full px-4" onClick={() => setAttempt(value => value + 1)}>Попробовать снова</Button>
                <Button variant="secondary" className="h-10 rounded-full px-4" onClick={reuse}>Использовать настройки</Button>
              </>
            ) : <Spinner className="size-6" aria-label="Подготавливаем слайды" />}
          </AppSheetBody>
        </AppSheetContent>
      </AppSheet>
    )
  }

  const file = {
    name: carouselFileName(result, index),
    type: "image/png",
    size: ready.blobs[index].size,
    url: ready.urls[index],
  }

  const gallery = (
    <div ref={galleryRef} aria-label="Слайды карусели" className={cn("flex gap-3", mobile ? "overflow-x-auto overscroll-contain p-1" : "flex-col")}>
      {result.slides.map((item, itemIndex) => (
        <Button
          key={item.id}
          variant="ghost"
          aria-label={`Слайд ${itemIndex + 1}: ${item.title}`}
          aria-current={index === itemIndex ? "true" : undefined}
          onClick={() => setSelected(itemIndex)}
          className={cn("group/slide h-auto shrink-0 flex-col gap-1.5 rounded-full border-0 bg-transparent p-0 hover:bg-transparent", mobile ? "w-10" : "w-full")}
        >
          <img
            src={ready.urls[itemIndex]}
            alt=""
            draggable={false}
            className={cn("w-full rounded-lg object-cover", index === itemIndex ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 group-hover/slide:opacity-100 group-focus-visible/slide:opacity-100")}
            style={{ aspectRatio: result.request.format.replace(":", "/") }}
          />
          {!mobile && <span aria-hidden="true" className="text-xs text-muted-foreground">{itemIndex + 1}</span>}
        </Button>
      ))}
    </div>
  )

  const downloadButton = (
    <Button className="h-11 min-w-0 flex-1 rounded-full px-5" disabled={downloading} onClick={() => void download()}>
      {downloading ? <Spinner aria-label="Подготавливаем архив" /> : <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} />}
      {downloading ? "Скачиваем…" : "Скачать ZIP"}
    </Button>
  )

  return (
    <FileViewer
      file={file}
      open={open}
      onOpenChange={onOpenChange}
      details={{
        position,
        onPrevious: index > 0 ? () => setSelected(index - 1) : undefined,
        onNext: index < result.slides.length - 1 ? () => setSelected(index + 1) : undefined,
        gallery,
        info: (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Карусель · {carouselSlideCount(result.slides.length)}</p>
              <h2 className="text-2xl leading-tight font-medium tracking-tight wrap-anywhere">{title}</h2>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
              <div className="col-span-2"><dt className="mb-1.5 text-xs text-muted-foreground">Стиль</dt><dd>{style?.name || "Свой стиль"}</dd></div>
              <div><dt className="mb-1.5 text-xs text-muted-foreground">Формат</dt><dd>{result.request.format}</dd></div>
              <div><dt className="mb-1.5 text-xs text-muted-foreground">Размер</dt><dd>{format?.description}</dd></div>
              <div className="col-span-2"><dt className="mb-1.5 text-xs text-muted-foreground">Для кого</dt><dd className="wrap-anywhere">{result.request.audience}</dd></div>
            </dl>
            <section className="space-y-3 border-t pt-5" aria-label="Текст карусели">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{position}</h3>
                <CopyButton value={fullText} label="Копировать текст всей карусели" copiedLabel="Текст карусели скопирован" className="size-10 rounded-full" />
              </div>
              <p className="text-sm font-medium wrap-anywhere">{slide.title}</p>
              {slide.body && <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground wrap-anywhere">{slide.body}</p>}
            </section>
            <Button variant="secondary" className="h-10 w-full rounded-full px-4" onClick={reuse}>Использовать настройки</Button>
          </div>
        ),
        primaryAction: mobile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground" role="status">{position} · {result.request.format}</p>
              <Button variant="ghost" className="h-8 rounded-full px-3 text-xs" onClick={reuse}>Использовать настройки</Button>
            </div>
            {gallery}
            <div className="flex items-center gap-2">
              {downloadButton}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="secondary" size="icon-lg" className="size-11 rounded-full" aria-label={`Скачать слайд ${index + 1} в PNG`}>
                    <a href={file.url} download={file.name}>
                      <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} aria-hidden="true" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Скачать слайд в PNG</TooltipContent>
              </Tooltip>
              <CopyButton value={fullText} label="Копировать текст всей карусели" copiedLabel="Текст карусели скопирован" className="size-11 rounded-full" />
            </div>
          </div>
        ) : downloadButton,
      }}
    />
  )
}
