import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Attachment01Icon, Cancel01Icon, Image01Icon } from "@hugeicons/core-free-icons"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  deleteCarouselReference,
  MAX_CAROUSEL_REFERENCES,
  readCarouselReference,
  saveCarouselReference,
  validateCarouselReferenceFiles,
  type CarouselReference,
} from "@/lib/carousel/references"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

type CarouselReferencesProps = {
  references: readonly CarouselReference[]
  onChange: (references: CarouselReference[]) => void
  onBusyChange?: (busy: boolean) => void
  disabled?: boolean
}

function ReferenceThumbnail({ reference, onRemove, disabled }: {
  reference: CarouselReference
  onRemove: () => void
  disabled: boolean
}) {
  const [preview, setPreview] = React.useState("")
  const [unavailable, setUnavailable] = React.useState(false)

  React.useEffect(() => {
    let active = true
    let url = ""
    readCarouselReference(reference.id).then((blob) => {
      if (!active) return
      if (!blob) {
        setUnavailable(true)
        return
      }
      url = URL.createObjectURL(blob)
      setPreview(url)
    }).catch(() => {
      if (active) setUnavailable(true)
    })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [reference.id])

  return (
    <Attachment role="listitem" orientation="vertical" size="sm" state={unavailable ? "error" : "done"} className="w-24 has-data-[slot=attachment-content]:w-24">
      <AttachmentMedia variant={preview && !unavailable ? "image" : "icon"}>
        {preview && !unavailable ? (
          <img src={preview} alt={reference.name} onError={() => setUnavailable(true)} />
        ) : (
          <HugeiconsIcon icon={Image01Icon} strokeWidth={ICON_STROKE} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle title={reference.name}>{reference.name}</AttachmentTitle>
        {unavailable && <AttachmentDescription title="Фото недоступно. Удалите его и загрузите снова.">Загрузите снова</AttachmentDescription>}
      </AttachmentContent>
      <AttachmentActions className="group-data-[orientation=vertical]/attachment:top-2 group-data-[orientation=vertical]/attachment:right-2">
        <AttachmentAction
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-background"
          disabled={disabled}
          aria-label={`Убрать фото ${reference.name}`}
          onClick={onRemove}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}

export function CarouselReferences({ references, onChange, onBusyChange, disabled = false }: CarouselReferencesProps) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const busyRef = React.useRef(false)
  const mounted = React.useRef(true)
  const current = React.useRef({ references, onChange, onBusyChange, disabled })
  const [busy, setBusy] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState("")
  const full = references.length >= MAX_CAROUSEL_REFERENCES
  const blocked = disabled || busy || full

  React.useEffect(() => {
    current.current = { references, onChange, onBusyChange, disabled }
  }, [references, onChange, onBusyChange, disabled])
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (busyRef.current) current.current.onBusyChange?.(false)
    }
  }, [])

  async function addReferences(files: FileList | File[]) {
    const incoming = Array.from(files)
    if (!incoming.length || busyRef.current || current.current.disabled) return
    const initial = current.current.references
    const validation = validateCarouselReferenceFiles(incoming, initial.length)
    if (validation) {
      setError(validation)
      return
    }

    busyRef.current = true
    setBusy(true)
    current.current.onBusyChange?.(true)
    setError("")
    const added: CarouselReference[] = []
    let committed = false
    try {
      for (const file of incoming) {
        added.push(await saveCarouselReference(file))
        if (!mounted.current || current.current.disabled) return
      }
      // A changed draft must not inherit an upload started in the previous one.
      if (current.current.references !== initial) return
      current.current.onChange([...initial, ...added])
      committed = true
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : "Не удалось прикрепить фото. Попробуйте ещё раз.")
      }
    } finally {
      if (!committed) await Promise.allSettled(added.map((reference) => deleteCarouselReference(reference.id)))
      busyRef.current = false
      if (mounted.current) {
        setBusy(false)
        current.current.onBusyChange?.(false)
      }
    }
  }

  return (
    <div className="space-y-2.5" aria-busy={busy}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`${id}-upload`} className={cn(!blocked && "cursor-pointer")}>Фото-референсы</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{references.length} / {MAX_CAROUSEL_REFERENCES}</span>
      </div>
      <Input
        id={`${id}-upload`}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        tabIndex={-1}
        aria-hidden="true"
        disabled={blocked}
        onChange={(event) => {
          if (event.target.files) void addReferences(event.target.files)
          event.target.value = ""
        }}
      />
      <div
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return
          event.preventDefault()
          event.dataTransfer.dropEffect = blocked ? "none" : "copy"
          if (!blocked) setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!blocked) void addReferences(event.dataTransfer.files)
        }}
      >
        <Button
          id={`${id}-upload`}
          type="button"
          variant="outline"
          disabled={blocked}
          className={cn("h-11 w-full rounded-xl border-dashed", dragging && !blocked && "border-primary bg-primary/5")}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Spinner className="motion-reduce:animate-none" /> : <HugeiconsIcon icon={Attachment01Icon} strokeWidth={ICON_STROKE} />}
          {busy ? "Прикрепляем фото…" : full ? "Прикреплено 5 фото" : "Прикрепить фото"}
        </Button>
      </div>
      <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">Необязательно · JPG, PNG, WebP · до 15 МБ</p>
      {references.length > 0 && (
        <AttachmentGroup role="list" aria-label="Прикреплённые фото-референсы" className="gap-2">
          {references.map((reference) => (
            <ReferenceThumbnail
              key={reference.id}
              reference={reference}
              disabled={disabled || busy}
              onRemove={() => {
                onChange(references.filter((item) => item.id !== reference.id))
                setError("")
              }}
            />
          ))}
        </AttachmentGroup>
      )}
      {error && <p id={`${id}-error`} role="alert" className="text-xs leading-relaxed text-destructive">{error}</p>}
    </div>
  )
}
