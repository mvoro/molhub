import * as React from "react"
import { useAuth, useComposerAuth } from "@/hooks/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp02Icon,
  Cancel01Icon,
  ImageAdd01Icon,
  InformationCircleIcon,
  Mic01Icon,
  StopIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { clientId } from "@/lib/client-id"
import { attachmentMimeType } from "@/lib/chat-attachments"

import { fileKind } from "@/components/chat-composer/file-icon"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { FileDropOverlay } from "@/components/chat-composer/file-drop"
import { useFileDrop } from "@/components/chat-composer/use-file-drop"
import { viewerKind } from "@/components/file-viewer/viewable"
import { MoleculeIcon, SETTING_ICON } from "@/components/chat-composer/icons"
import { ModelPicker } from "@/components/chat-composer/model-picker"
import { ModelLogo } from "@/components/model-logo"
import { RoleDetailsSheet } from "@/components/roles/role-details-sheet"
import { SettingPopover, SettingsSheet, type SettingsProps } from "@/components/chat-composer/settings"
import { ToolsMenu, ToolsSheet, type Tool } from "@/components/chat-composer/tools"
import { useVoiceInput } from "@/components/chat-composer/use-voice-input"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AudioPromptFields } from "@/components/chat-composer/audio-prompt-fields"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  barSettings as modelBarSettings,
  modelSettings,
  normalizeSettings,
  audioStyleLimit,
  NO_ROLE,
  SETTING_TITLE,
  barLabel,
  defaultSettings,
  estimateCost,
  formatCost,
  moleculesWord,
  type ChoiceKey,
  type Settings,
} from "@/data/composer-settings"
import type { ChatType } from "@/data/chats"
import { COMPOSER_MODES, findModel, resolveModelName, type ComposerMode } from "@/data/models"
import type { PromptPreset } from "@/data/prompt-presets"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { shake } from "@/lib/motion"
import { resolveRole } from "@/lib/roles"
import { cn } from "@/lib/utils"

export type ComposerFile = { id: string; name: string; size: number; type: string; url: string; file: File }

/* What the composer holds before sending, with the model and settings chosen per mode. The screen
   keeps a copy across the tool switches that remount the composer (the audio studio replaces it),
   and revokes the previews when it goes. */
export type ComposerDraft = {
  text: string
  files: ComposerFile[]
  frames: [ComposerFile | null, ComposerFile | null]
  /* The video template and the user's photo for it. */
  template?: PromptPreset | null
  photo?: ComposerFile | null
  models?: Record<ComposerMode, string>
  settings?: Record<ComposerMode, Settings>
}
export const emptyDraft = (): ComposerDraft => ({ text: "", files: [], frames: [null, null] })

export type ComposerMessage = {
  text: string
  files: ComposerFile[]
  /* Start and end frame for frame-driven video models (Kling); both null otherwise. */
  frames: [ComposerFile | null, ComposerFile | null]
  /* The video template the request runs through and the photo it animates: both or neither. The text
     is then the user's additions to the template's own prompt, and may be empty. */
  template: PromptPreset | null
  photo: ComposerFile | null
  mode: ComposerMode
  model: string
  settings: Settings
  cost: number
}

/* What the screen around the composer can do with it (the new-chat gallery). */
export type ComposerHandle = {
  /* Put a preset's prompt in the field (and its settings, e.g. the ratio). */
  fill: (text: string, options?: { patch?: Partial<Settings> }) => void
  /* Run the video through a template (the video tool's «Шаблоны»): see `templateSlots`. */
  applyTemplate: (preset: PromptPreset) => void
  /* Open the OS picker: photos, photos and videos, or any file. */
  attach: (accept?: "image" | "media" | "file") => void
  /* Pick a model by name, as the model picker does: the composer switches to its kind (the home
     page's model row). False when the catalog has no such model. */
  selectModel: (name: string) => boolean
}

const MAX_FILES = 10
const MAX_FILE_SIZE = 25 * 1024 * 1024

/* Touch keyboards have no Shift: Return adds a line there, and the arrow sends (ChatGPT app). */
const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

/* Chat composer: composer-chat's grey tray with Gemini's flow, on stock library parts (every
   control is a shadcn Button in its own variant and size; the only override is the maximal
   radius — pills. 26.09, the user's asks: «+» and the model are ghost, no border; 27.09 the mic,
   the send and the stop are black — INK). Anatomy:
   Grey tray: attached files (cards and square thumbnails, in
   the tray over the field) → white field (frame slots, text, bar: «+» · model ⌄ · the mode's main
   role · settings · mic · send with the price). No chip for the active tool (the user's ask, 27.09):
   the screen and «+» show it. «+» attaches, on the home screen picks a tool (Фото / Видео / Аудио; none =
   текст), and holds the settings the bar has no room for: a menu on desktop, a sheet on the phone. Text
   models come from the model picker.
   `onModeChange` absent means the kind is fixed (inside a chat): no tools, and the picker keeps to
   that type. */
export function ChatComposer({
  mode,
  onModeChange,
  onSend,
  placeholder = "Спросите что-нибудь…",
  hint,
  generating = false,
  onStop,
  autoFocus = false,
  initial,
  draft,
  onDraftChange,
  onConfigChange,
  footer,
  drop,
  className,
  ref,
}: {
  mode: ComposerMode
  onModeChange?: (mode: ComposerMode) => void
  onSend: (message: ComposerMessage) => void
  placeholder?: string
  /* A prompt previewed in the empty field (Krea: pointing at an idea shows its prompt there). One line,
     muted, in the placeholder's place; it never touches the text, and typing hides it. */
  hint?: string
  generating?: boolean
  onStop?: () => void
  autoFocus?: boolean
  /* Model and settings to start the current mode with (a chat continues its new-chat choices). */
  initial?: { model: string; settings: Settings }
  /* The screen's copy of the text, files and frames: `draft` is read once, on mount, and
     `onDraftChange` reports every change after. With it, the previews outlive the composer. */
  draft?: ComposerDraft
  onDraftChange?: (draft: ComposerDraft) => void
  onConfigChange?: (config: { model: string; settings: Settings }) => void
  /* Hangs under the tray: the text screen's tongue (project, files). */
  footer?: React.ReactNode
  /* Where files dropped on the window go instead of the attachments, with the zone's own words — a project's
     «Файлы» tab (spec §8). One window drop zone, so the two never compete. */
  drop?: { title: string; limit: string; onDrop: (files: File[]) => void }
  className?: string
  ref?: React.Ref<ComposerHandle>
}) {
  const mobile = useIsMobile()
  const { requireAuth } = useAuth()
  const authVariant = mode === "image" ? "nano" : "models"
  const authCapture = useComposerAuth(authVariant)
  const [text, setText] = React.useState(() => draft?.text ?? "")
  const [files, setFiles] = React.useState<ComposerFile[]>(() => draft?.files ?? [])
  // The attachment open in the viewer; it stays set while the viewer closes, so it leaves whole.
  const [viewed, setViewed] = React.useState<ComposerFile | null>(null)
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [frames, setFrames] = React.useState<[ComposerFile | null, ComposerFile | null]>(() => draft?.frames ?? [null, null])
  const [template, setTemplate] = React.useState<PromptPreset | null>(() => draft?.template ?? null)
  const [photo, setPhoto] = React.useState<ComposerFile | null>(() => draft?.photo ?? null)
  // Sends refused for want of the template's photo; while above 0 its tile is red, until a photo comes
  // (or the template goes). A count, so every refusal is announced anew.
  const [missingPhoto, setMissingPhoto] = React.useState(0)
  const [models, setModels] = React.useState<Record<ComposerMode, string>>(
    () => Object.fromEntries(COMPOSER_MODES.map(kind => [kind, resolveModelName(kind, draft?.models?.[kind] ?? (kind === mode ? initial?.model : undefined))])) as Record<ComposerMode, string>
  )
  const [allSettings, setAllSettings] = React.useState(() => {
    return Object.fromEntries(COMPOSER_MODES.map(kind => [kind, normalizeSettings(kind, models[kind], draft?.settings?.[kind] ?? (kind === mode ? initial?.settings : undefined))])) as Record<ComposerMode, Settings>
  })
  const [toolsOpen, setToolsOpen] = React.useState(false)
  const [sheetSetting, setSheetSetting] = React.useState<ChoiceKey | null>(null)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [roleDetailsOpen, setRoleDetailsOpen] = React.useState(false)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const frameRef = React.useRef<HTMLInputElement>(null)
  const photoRef = React.useRef<HTMLInputElement>(null)
  const sendRef = React.useRef<HTMLSpanElement>(null)
  const frameSlot = React.useRef(0)
  const voice = useVoiceInput(setText)

  const locked = !onModeChange
  const settings = allSettings[mode]
  const model = models[mode]
  React.useEffect(() => {
    onConfigChange?.({ model, settings })
  }, [model, settings, onConfigChange])
  const modelInfo = findModel(model, mode)
  const frameCount = mode === "video" ? modelInfo?.version.frames ?? 0 : 0
  const needFrames = frameCount > 0
  const attachmentsAllowed = modelInfo?.version.attachments !== false
  const maxFiles = modelInfo?.version.maxFiles ?? MAX_FILES
  // Templates are the video tool's; on another tool the chosen one waits, unseen, for the way back.
  const shownTemplate = mode === "video" ? template : null
  const typed = text.trim() !== ""
  // A template is a whole request on its own: the text only adds to it.
  const ready = typed || shownTemplate !== null || (mode === "audio" && settings.custom && settings.styles.trim() !== "")
  const cost = estimateCost(mode, settings, modelInfo?.version.price, model)
  const busy = generating

  React.useEffect(() => {
    if (autoFocus && !isTouch()) fieldRef.current?.focus()
  }, [autoFocus, mode])

  // The screen's draft follows every change, so a remount starts where this one left off.
  React.useEffect(() => {
    onDraftChange?.({ text, files, frames, template, photo, models, settings: allSettings })
  }, [onDraftChange, text, files, frames, template, photo, models, allSettings])

  // Blob previews live as long as the composer holds the file — or the screen's draft does.
  const filesRef = React.useRef([...files, ...frames, photo])
  React.useEffect(() => {
    filesRef.current = [...files, ...frames, photo]
  }, [files, frames, photo])
  React.useEffect(
    () => () => {
      if (!onDraftChange) filesRef.current.forEach((item) => item && URL.revokeObjectURL(item.url))
    },
    [onDraftChange]
  )

  const change: SettingsProps["onChange"] = (key, value) => {
    if (requireAuth(authVariant)) setAllSettings((prev) => ({ ...prev, [mode]: { ...prev[mode], [key]: value } }))
  }

  const toFile = (file: File): ComposerFile => ({
    id: clientId(),
    name: file.name,
    size: file.size,
    type: attachmentMimeType(file),
    url: URL.createObjectURL(file),
    file,
  })

  const addFiles = (incoming: FileList | File[]) => {
    if (!requireAuth(authVariant)) return
    if (!attachmentsAllowed) return toast.error("Эта модель не поддерживает вложения. Выберите другую модель.")
    let list = Array.from(incoming)
    if (mode === "image" || mode === "video") {
      if (list.some(file => !attachmentMimeType(file).startsWith("image/"))) toast.error("Эта модель принимает только изображения")
      list = list.filter(file => attachmentMimeType(file).startsWith("image/"))
    }
    if (needFrames && !shownTemplate) {
      const available = frames.slice(0, frameCount).flatMap((file, index) => file ? [] : [index])
      for (const [index, file] of list.slice(0, available.length).entries()) setFrame(available[index], file)
      if (list.length > available.length) toast(`Можно добавить до ${frameCount} кадров`)
      return
    }
    // A template's empty photo slot takes the first picture, however it comes: «+», a drop, a paste.
    const picture = shownTemplate && !photo ? list.find((file) => attachmentMimeType(file).startsWith("image/")) : undefined
    if (picture) {
      setTemplatePhoto(picture)
      list = list.filter((file) => file !== picture)
    }
    const room = maxFiles - files.length
    const next: ComposerFile[] = []
    for (const file of list.slice(0, Math.max(0, room))) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Файл «${file.name}» больше 25 МБ`)
        continue
      }
      next.push(toFile(file))
    }
    if (list.length > room) toast(`Можно прикрепить до ${maxFiles} файлов`)
    if (next.length) setFiles((prev) => [...prev, ...next])
  }

  const setTemplatePhoto = (file: File | null) => {
    if (file && !attachmentMimeType(file).startsWith("image/")) return toast.error("Шаблону нужно фото: PNG, JPG или WebP")
    if (file && file.size > MAX_FILE_SIZE) return toast.error(`Файл «${file.name}» больше 25 МБ`)
    if (photo) URL.revokeObjectURL(photo.url)
    setPhoto(file ? toFile(file) : null)
    if (file) setMissingPhoto(0)
  }

  const applyTemplate = (preset: PromptPreset) => {
    if (!requireAuth(authVariant)) return
    setTemplate(preset)
    setMissingPhoto(0)
    if (preset.ratio) setAllSettings((prev) => ({ ...prev, video: normalizeSettings("video", models.video, { ...prev.video, ratio: preset.ratio! }) }))
    // A picture attached before the template becomes its photo.
    const picture = photo ? undefined : files.find((item) => item.type.startsWith("image/"))
    if (picture) {
      setPhoto(picture)
      setFiles((prev) => prev.filter((item) => item !== picture))
    }
    requestAnimationFrame(() => fieldRef.current?.focus({ preventScroll: true }))
  }

  // The cross on the template. Its photo stays with the request as an ordinary attachment, and focus
  // goes back to the text, since the cross itself is gone.
  const removeTemplate = () => {
    setTemplate(null)
    setMissingPhoto(0)
    if (photo) {
      setFiles((prev) => [photo, ...prev])
      setPhoto(null)
    }
    fieldRef.current?.focus({ preventScroll: true })
  }

  const removeFile = (id: string) =>
    setFiles((prev) => {
      const gone = prev.find((item) => item.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      return prev.filter((item) => item.id !== id)
    })

  const setFrame = (slot: number, file: File | null) => {
    if (file && !attachmentMimeType(file).startsWith("image/")) return toast.error("Кадр — это картинка: PNG, JPG или WebP")
    if (file && file.size > MAX_FILE_SIZE) return toast.error("Кадр больше 25 МБ")
    setFrames((prev) => {
      const next: typeof prev = [...prev]
      if (next[slot]) URL.revokeObjectURL(next[slot].url)
      next[slot] = file ? toFile(file) : null
      return next
    })
  }

  const pickFrame = (slot: number) => {
    frameSlot.current = slot
    frameRef.current?.click()
  }

  const submit = () => {
    if (!ready || busy) return
    if (!requireAuth(authVariant)) return
    // No photo for the template: its tile turns red, the send pill shakes its head and a toast says why
    // (one toast, replaced on every refusal).
    if (shownTemplate && !photo) {
      setMissingPhoto((count) => count + 1)
      shake(sendRef.current)
      toast.error("Шаблону нужно ваше фото", { id: "composer-photo", description: "Добавьте его, чтобы создать видео." })
      return
    }
    if (modelInfo?.version.requiresImage && !shownTemplate && !frames[0] && !settings.lastImage && !settings.chatImages) return toast.error("Добавьте начальный кадр — с него начнётся видео")
    if (!attachmentsAllowed && files.length) return toast.error("Эта модель не поддерживает вложения. Уберите файлы или выберите другую модель.")
    if (files.length > maxFiles) return toast.error(`Для этой модели можно прикрепить до ${maxFiles} файлов`)
    if ((mode === "image" || mode === "video") && files.some(file => !attachmentMimeType(file).startsWith("image/"))) return toast.error("Для этой модели нужны изображения. Уберите остальные файлы.")
    if (mode === "audio" && settings.custom && settings.styles.length > audioStyleLimit(model)) return toast.error(`Сократите стиль до ${audioStyleLimit(model)} символов`)
    voice.stop()
    const message: ComposerMessage = {
      text: text.trim(),
      files,
      // A template's photo is the start frame for the frame-driven models.
      frames: !needFrames ? [null, null] : shownTemplate ? [photo, null] : [frames[0], frameCount === 2 ? frames[1] : null],
      template: shownTemplate,
      photo: shownTemplate ? photo : null,
      mode,
      model,
      settings: normalizeSettings(mode, model, settings),
      cost,
    }
    onSend(message)
    // Sent previews belong to the message now. Discard attachments hidden by a mode switch,
    // and release the ref before navigation can unmount this composer.
    const sentUrls = new Set([...message.files, ...message.frames, message.photo].flatMap((file) => file ? [file.url] : []))
    for (const file of [...files, ...frames, photo]) {
      if (file && !sentUrls.has(file.url)) URL.revokeObjectURL(file.url)
    }
    filesRef.current = []
    setText("")
    setFiles([])
    setFrames([null, null])
    setTemplate(null)
    setPhoto(null)
    setMissingPhoto(0)
    const clearedSettings = mode === "audio" ? { ...allSettings, audio: { ...settings, styles: "", title: "", negative: "" } } : allSettings
    setAllSettings(clearedSettings)
    setViewerOpen(false)
    setViewed(null)
    for (const input of [fileRef.current, frameRef.current, photoRef.current]) {
      if (input) input.value = ""
    }
    // Navigation can unmount the composer before its draft effect runs.
    onDraftChange?.({ ...emptyDraft(), template: null, photo: null, models, settings: clearedSettings })
  }

  // Model selection remains within the requested output type, including Molly.
  const pickModel = (type: ChatType, name: string) => {
    if (!requireAuth(authVariant)) return
    const next: ComposerMode = locked ? mode : type
    setModels((prev) => ({ ...prev, [next]: name }))
    setAllSettings(prev => ({ ...prev, [next]: next === "audio" ? normalizeSettings(next, name, prev[next]) : { ...defaultSettings(next, name), ...(next === "text" ? { role: prev[next].role } : {}) } }))
    setSheetSetting(null)
    if (!locked && next !== mode) onModeChange?.(next)
  }

  const pickTool = (tool: Tool | null) => onModeChange?.(tool ?? "text")

  // One hidden input serves every source: the kind only changes what the OS picker offers.
  const attach = (kind: "file" | "photo" | "media" | "camera") => {
    if (!requireAuth(authVariant)) return
    if (!attachmentsAllowed) return toast.error("Эта модель не поддерживает вложения. Выберите другую модель.")
    const input = fileRef.current
    if (!input) return
    input.accept = mode === "image" || mode === "video" ? "image/*" : kind === "file" ? "" : kind === "media" ? "image/*,video/*" : "image/*"
    if (kind === "camera") input.setAttribute("capture", "environment")
    else input.removeAttribute("capture")
    input.click()
  }

  // A photo for the prompt goes where the model reads it: frame slots for Kling, files otherwise.
  const freeFrame = needFrames ? frames.slice(0, frameCount).findIndex((frame) => !frame) : -1
  const attachPhoto = (accept: "image" | "media" = "image") => {
    if (freeFrame >= 0) pickFrame(freeFrame)
    else attach(accept === "media" ? "media" : "photo")
  }

  // Presets from the gallery fill the field and their settings; «Загрузить фото» opens the picker.
  React.useImperativeHandle(ref, () => ({
    fill: (next, options) => {
      if (options?.patch && !requireAuth(authVariant)) return
      setText(next)
      if (options?.patch) setAllSettings((prev) => ({ ...prev, [mode]: normalizeSettings(mode, model, { ...prev[mode], ...options.patch }) }))
      requestAnimationFrame(() => {
        const field = fieldRef.current
        if (!field) return
        field.focus({ preventScroll: true })
        field.setSelectionRange(next.length, next.length)
      })
    },
    applyTemplate,
    attach: (accept) => (accept === "file" ? attach("file") : attachPhoto(accept)),
    selectModel: (name) => {
      const match = findModel(name, mode) ?? (!locked ? findModel(name) : undefined)
      if (match) pickModel(match.type, match.version.name)
      return Boolean(match)
    },
  }))

  const settingsProps: SettingsProps = {
    mode, model, settings, onChange: change, disabled: busy,
    onRolePrompt: (prompt) => {
      setText(prompt)
      requestAnimationFrame(() => fieldRef.current?.focus({ preventScroll: true }))
    },
  }

  // Files dropped anywhere on the window land here (the user's ask, 27.09): see use-file-drop.ts, the zone in file-drop.tsx.
  const dropping = useFileDrop({ disabled: busy && !drop, onDrop: (files) => (drop ? drop.onDrop([...files]) : addFiles(files)) })

  /* ── pieces ── */

  const toolsProps = { mode, onToolChange: pickTool, locked, onAttach: attach, onFiles: addFiles, attachmentsDisabled: !attachmentsAllowed, settings: settingsProps }
  const plus = (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="Добавить файлы и инструменты"
      disabled={busy}
      // Desktop gets aria-expanded from the menu trigger; spread only on the phone so it isn't overridden.
      {...(mobile && { "aria-expanded": toolsOpen, onClick: () => setToolsOpen(true) })}
      className={ROUND}
    >
      {/* While its menu is open, «+» turns 45° into «×»: one glyph morphing, not two swapping, so it
          reads as the same control now closing. A transition (not keyframes), so a quick reopen
          retargets from where it is; reduced motion swaps instantly. */}
      <HugeiconsIcon
        icon={Add01Icon}
        strokeWidth={ICON_STROKE}
        className="transition-transform duration-200 ease-(--ease-out) group-aria-expanded/button:rotate-45 motion-reduce:transition-none"
      />
    </Button>
  )

  /* The bar opens the picker; the active role is named in the panel above the composer. */
  const hasRole = modelSettings(mode, model).includes("role")
  const chosenRole = hasRole ? resolveRole(settings.role) : undefined
  const roleTrigger = (
    <Button
      key="role"
      variant="ghost"
      size="lg"
      aria-label={chosenRole ? `Роль: «${settings.role}». Изменить` : "Роль: не выбрана. Выбрать"}
      disabled={busy}
      onClick={mobile ? () => setSheetSetting("role") : undefined}
      className={cn(ROUND, "font-normal", chosenRole && "pr-1.5 hover:bg-transparent aria-expanded:bg-transparent dark:hover:bg-transparent")}
    >
      <HugeiconsIcon
        icon={SETTING_ICON.role}
        strokeWidth={ICON_STROKE}
        data-icon="inline-start"
        className={chosenRole ? undefined : "text-muted-foreground"}
      />
      Роль
    </Button>
  )
  const rolePicker = mobile ? roleTrigger : <SettingPopover key="role" {...settingsProps} setting="role" trigger={roleTrigger} />
  const roleButton = hasRole && (chosenRole ? (
    <span key="role" className={cn(BAR_CHIP, "flex shrink-0 items-center bg-secondary hover:bg-secondary-hover")}>
      {rolePicker}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Убрать роль «${settings.role}»`}
        disabled={busy}
        onClick={() => change("role", NO_ROLE)}
        className="-ml-1 mr-1.5 size-6 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
      </Button>
    </span>
  ) : (
    rolePicker
  ))

  /* Right side (Gemini): the mic while the field is empty, swapped for the send pill with the price
     once there is text — attachments alone don't make a request (the user's ask, 27.09); a stop
     button while generating. The mic stays while dictating, so the recording can still be stopped. */
  const costLabel = formatCost(cost)
  const mic = !busy && (!ready || voice.listening) && (
    <Button
      size="icon-lg"
      aria-label={voice.listening ? "Остановить запись" : "Голосовой ввод"}
      aria-pressed={voice.listening}
      onClick={voice.listening ? voice.stop : () => voice.start(text)}
      className={cn(ROUND, INK, "aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:animate-pulse")}
    >
      <HugeiconsIcon icon={Mic01Icon} strokeWidth={ICON_STROKE} />
    </Button>
  )
  const send = busy ? (
    <Button
      key="stop"
      size="icon-lg"
      aria-label="Остановить генерацию"
      disabled={!onStop}
      onClick={onStop}
      className={cn(ROUND, INK, "animate-in fade-in-0 zoom-in-90 duration-150 ease-(--ease-out) motion-reduce:animate-none")}
    >
      <HugeiconsIcon icon={StopIcon} strokeWidth={ICON_STROKE} />
    </Button>
  ) : (
    /* Cost as in Krea (the user's ask, 27.09): a grey pill with the molecule and the price, the round
       send button sitting in its right end. The price is in the text's ink, the molecule is the logo in
       its gradient (the user's ask, 27.09; both were primary). The price is read out by the button's label. In the dark
       the field is already bg-muted, so the pill lifts a step above it. The whole pill shakes when a
       template still waits for its photo. */
    ready && (
      <Badge
        key="send"
        ref={sendRef}
        variant="secondary"
        className="h-9 gap-2 overflow-visible border-0 p-0 pl-3 text-sm font-normal tabular-nums animate-in fade-in-0 zoom-in-90 duration-150 ease-(--ease-out) motion-reduce:animate-none dark:bg-foreground/10"
      >
        <span aria-hidden="true" className="flex items-center gap-1.5 text-foreground">
          <MoleculeIcon colored className="size-3.5" />
          {costLabel}
        </span>
        <Button size="icon-lg" aria-label={`Отправить — примерно ${costLabel} ${moleculesWord(cost)}`} onClick={submit} className={cn(ROUND, INK)}>
          <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.25} />
        </Button>
      </Badge>
    )
  )

  const modelButton = (
    <Button
      variant="ghost"
      size="lg"
      aria-label={`Модель: ${model}. Выбрать другую`}
      disabled={busy}
      className={cn(ROUND, "min-w-0 font-normal max-md:max-w-40 md:max-w-56")}
    >
      {/* The current model: its mark in colour (Lobe Icons, components/model-logo.tsx). */}
      <span data-icon="inline-start" className="flex shrink-0">
        <ModelLogo logo={modelInfo?.family.logo} mode={mode} color />
      </span>
      <span className="truncate">{model}</span>
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} data-icon="inline-end" className="text-muted-foreground" />
    </Button>
  )

  /* The mode's main settings right of the model (the user's ask, 27.09): ghost pills in the model's
     weight, the setting's glyph and its value. A menu of the values on desktop, one setting's sheet on
     the phone; the rest of the settings are in «+». */
  const barSettings = modelBarSettings(mode, model).map((key) => {
    const button = (
      <Button
        key={key}
        variant="ghost"
        size="lg"
        aria-label={`${SETTING_TITLE[key]}: ${settings[key]}. Изменить`}
        disabled={busy}
        onClick={mobile ? () => setSheetSetting(key) : undefined}
        className={cn(ROUND, "font-normal")}
      >
        <HugeiconsIcon icon={SETTING_ICON[key]} strokeWidth={ICON_STROKE} data-icon="inline-start" className="text-muted-foreground" />
        {barLabel(key, settings)}
        {key === "speed" && <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} data-icon="inline-end" className="text-muted-foreground" />}
      </Button>
    )
    return mobile ? button : <SettingPopover key={key} {...settingsProps} setting={key} trigger={button} />
  })

  // With a template its photo is the start frame, so the frame slots step aside.
  const frameSlots = needFrames && !shownTemplate
    ? (["Начальный кадр", "Конечный кадр"] as const).slice(0, frameCount).map((label, slot) => {
        const frame = frames[slot]
        return (
          <Attachment key={label} state={frame ? "done" : "idle"} size="sm" className="max-md:w-[calc(50%-4px)] md:w-44">
            <AttachmentMedia variant={frame ? "image" : "icon"}>
              {frame ? <img src={frame.url} alt="" /> : <HugeiconsIcon icon={ImageAdd01Icon} strokeWidth={ICON_STROKE} />}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{label}</AttachmentTitle>
              <AttachmentDescription>{frame ? frame.name : slot || !modelInfo?.version.requiresImage ? "Необязательно" : "Загрузите фото"}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentTrigger aria-label={`${frame ? "Заменить" : "Загрузить"} ${label.toLowerCase()}`} disabled={busy} onClick={() => pickFrame(slot)} />
            {frame && (
              <AttachmentActions>
                <AttachmentAction aria-label={`Убрать ${label.toLowerCase()}`} onClick={() => setFrame(slot, null)}>
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
                </AttachmentAction>
              </AttachmentActions>
            )}
          </Attachment>
        )
      })
    : []

  /* A chosen template in the tray over the field (the user's ask, 27.09): its picture with a cross that
     drops it, on the left, then Krea's upload zone for the photo it animates — a 48px tile with the
     slot's name under it; the photo takes the tile's place once added. Each column is named: «Шаблон»,
     «Фото». Sent without the photo, the tile turns red (the pill shakes, see `submit`) and a toast
     says why. The template's prompt goes with the request unseen; the field is for additions. */
  const templateSlots = shownTemplate && (
    <>
      <div className={SLOT}>
        <Attachment className={cn(FILE_CARD, FILE_THUMB)}>
          <AttachmentMedia variant="image" className="w-12 rounded-xl">
            <img src={shownTemplate.image} alt={`Шаблон «${shownTemplate.title}»`} />
          </AttachmentMedia>
          <AttachmentActions className="absolute -top-1.5 -right-1.5">
            <AttachmentAction
              variant="outline"
              aria-label={`Убрать шаблон «${shownTemplate.title}»`}
              disabled={busy}
              onClick={removeTemplate}
              className={REMOVE_FILE}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <span className={SLOT_LABEL}>Шаблон</span>
      </div>
      {photo ? (
        <div className={SLOT}>
          <Attachment className={cn(FILE_CARD, FILE_THUMB)}>
            <AttachmentTrigger
              aria-label="Открыть фото для шаблона"
              onClick={() => {
                setViewed(photo)
                setViewerOpen(true)
              }}
            />
            <AttachmentMedia variant="image" className="w-12 rounded-xl">
              <img src={photo.url} alt={photo.name} />
            </AttachmentMedia>
            <AttachmentActions className="absolute -top-1.5 -right-1.5">
              <AttachmentAction variant="outline" aria-label="Убрать фото" disabled={busy} onClick={() => setTemplatePhoto(null)} className={REMOVE_FILE}>
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <span className={SLOT_LABEL}>Фото</span>
        </div>
      ) : (
        <Button
          variant="ghost"
          aria-label="Добавить фото для шаблона"
          data-error={missingPhoto > 0 || undefined}
          disabled={busy}
          onClick={() => photoRef.current?.click()}
          className={cn(SLOT, UPLOAD)}
        >
          <span className={UPLOAD_TILE}>
            <HugeiconsIcon icon={ImageAdd01Icon} strokeWidth={ICON_STROKE} className="size-5" />
          </span>
          <span className={cn(SLOT_LABEL, "transition-colors duration-150 group-data-[error]/upload:text-destructive")}>Фото</span>
        </Button>
      )}
    </>
  )

  return (
    <div {...authCapture} className={cn("flex w-full flex-col", className)}>
      {chosenRole && (
        <div role="group" aria-label={`Активная роль: ${chosenRole.name}`} className="mx-5 flex min-h-9 items-center gap-2 rounded-t-[18px] bg-muted/50 py-1 pr-1.5 pl-3.5 text-[13px] text-foreground dark:bg-card/50">
          <HugeiconsIcon icon={SETTING_ICON.role} strokeWidth={ICON_STROKE} className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate font-medium" title={chosenRole.name}>{chosenRole.name}</span>
          <Button variant="ghost" size="icon-sm" aria-label={`Подробнее о роли «${chosenRole.name}»`} onClick={() => setRoleDetailsOpen(true)} className="shrink-0 rounded-full text-muted-foreground">
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={ICON_STROKE} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={`Убрать роль «${chosenRole.name}»`} disabled={busy} onClick={() => { change("role", NO_ROLE); fieldRef.current?.focus({ preventScroll: true }) }} className="shrink-0 rounded-full text-muted-foreground">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
          </Button>
        </div>
      )}
      {/* Grey tray (composer-chat / ChatGPT) around the white field — the user's mandatory element;
          the settings that used to sit in the tray under the field live in «+» since 26.09. Its fill
          is 50% (the user's ask, 27.09): the ground shows through the rim around the field, the
          field itself stays opaque. Over the photo and video results the rim frosts what passes under it
          (backdrop blur), since the scrim behind the composer no longer covers them fully (27.09). */}
      <div className="relative z-10 rounded-[28px] bg-muted/50 p-1 ring-1 ring-foreground/5 backdrop-blur-xl dark:bg-card/50">
        {/* Attached files in the tray over the field (the user's reference, 27.09): a picture as a
            square thumbnail, any other file as a card with a coloured square tile, the name and what
            it is. The cross sits on the top-right corner; the row scrolls sideways when full. A picture,
            a PDF or a Word file opens in the viewer on a click (the card's own trigger). A template and
            its photo lead the row; their names hang below, so the row aligns to the top. */}
        {(files.length > 0 || templateSlots) && (
          <AttachmentGroup className="items-start gap-2.5 px-1.5 pt-2 pr-2 pb-2">
            {templateSlots}
            {files.map((item) => {
              const image = item.type.startsWith("image/")
              const kind = fileKind(item)
              return (
                <Attachment key={item.id} className={cn(FILE_CARD, image && FILE_THUMB)}>
                  {viewerKind(item) && (
                    <AttachmentTrigger
                      aria-label={`Открыть ${item.name}`}
                      onClick={() => {
                        setViewed(item)
                        setViewerOpen(true)
                      }}
                    />
                  )}
                  <AttachmentMedia
                    variant={image ? "image" : "icon"}
                    className={image ? "w-12 rounded-xl" : cn("w-9 rounded-md", kind.tile)}
                  >
                    {image ? (
                      <img src={item.url} alt={item.name} />
                    ) : (
                      <HugeiconsIcon icon={kind.icon} strokeWidth={ICON_STROKE} className="size-5!" />
                    )}
                  </AttachmentMedia>
                  {!image && (
                    <AttachmentContent>
                      <AttachmentTitle className="text-[13px]">{item.name}</AttachmentTitle>
                      <AttachmentDescription className="text-[13px]">{kind.label}</AttachmentDescription>
                    </AttachmentContent>
                  )}
                  <AttachmentActions className="absolute -top-1.5 -right-1.5">
                    <AttachmentAction
                      variant="outline"
                      aria-label={`Убрать ${item.name}`}
                      onClick={() => removeFile(item.id)}
                      className={REMOVE_FILE}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              )
            })}
          </AttachmentGroup>
        )}

        <div
          className={cn("cursor-text rounded-[24px] bg-background dark:bg-muted", FIELD_EDGE)}
          // The whole field takes the tap: a click on its padding still lands in the text.
          onClick={(event) => {
            if (!(event.target as HTMLElement).closest("button, textarea, a, input, [role=menu]")) fieldRef.current?.focus()
          }}
        >
          {/* Frame slots (Kling) sit above the text, as in Gemini. */}
          {frameSlots.length > 0 && <AttachmentGroup className="gap-2 px-3 pt-3">{frameSlots}</AttachmentGroup>}
          {mode === "video" && model === "Veo Omni" && <p className="px-4 pt-3 text-xs text-muted-foreground">До 4 изображений. Последнее — начальный кадр.</p>}

          {mode === "audio" && settings.custom && <AudioPromptFields model={model} settings={settings} onChange={change} />}
          <div className="relative">
            <Textarea
              ref={fieldRef}
              rows={1}
              value={text}
              disabled={voice.listening}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") voice.stop()
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || isTouch()) return
                event.preventDefault()
                submit()
              }}
              onPaste={(event) => {
                if (event.clipboardData.files.length) {
                  event.preventDefault()
                  addFiles(event.clipboardData.files)
                }
              }}
              placeholder={hint && !text ? "" : shownTemplate ? "Добавьте детали, если нужно" : placeholder}
              aria-label="Сообщение"
              enterKeyHint={isTouch() ? "enter" : "send"}
              className="max-h-[200px] min-h-12 resize-none border-0 bg-transparent! px-4 pt-3.5 pb-1 text-base leading-6 shadow-none focus-visible:ring-0 disabled:opacity-100 md:text-[15px] max-md:max-h-[30svh]"
            />
            {hint && !text && (
              <p aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-3.5 truncate text-base leading-6 text-muted-foreground md:text-[15px]">
                {hint}
              </p>
            )}
          </div>

          {/* «+» and the model side by side on the left (the user's ask), the role after them. The
              model and the chip share a strip that scrolls sideways when the phone runs out of room
              (the role sits on the model's row there, the user's ask, 27.09); its edges fade
              only on the side with more to see, full strength after 24px of scroll (the library's 96px
              is longer than this row ever overflows). -m-1/p-1 keeps the focus rings out of the clip. */}
          <div className="flex items-center gap-1 px-2 pb-2">
            {mobile ? plus : <ToolsMenu {...toolsProps} trigger={plus} />}
            <div className="-m-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain p-1 scroll-fade-x scrollbar-none [--scroll-fade-reveal:24px]">
              <ModelPicker
                trigger={modelButton}
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                type={mode}
                model={model}
                onSelect={pickModel}
              />
              {barSettings}
              {roleButton}
            </div>
            {mic}
            {send}
          </div>
        </div>
      </div>

      {footer}

      <Input
        ref={fileRef}
        type="file"
        multiple
        hidden
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ""
        }}
      />
      <Input
        ref={frameRef}
        type="file"
        accept="image/*"
        hidden
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) setFrame(frameSlot.current, file)
          event.target.value = ""
        }}
      />
      <Input
        ref={photoRef}
        type="file"
        accept="image/*"
        hidden
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) setTemplatePhoto(file)
          event.target.value = ""
        }}
      />

      {mobile && (
        <>
          <ToolsSheet
            {...toolsProps}
            open={toolsOpen}
            onOpenChange={setToolsOpen}
            // From the «+» sheet into one setting's sheet: the first closes, then the second opens.
            onOpenSetting={(key) => window.setTimeout(() => setSheetSetting(key), 320)}
          />
          <SettingsSheet {...settingsProps} setting={sheetSetting} onClose={() => setSheetSetting(null)} />
        </>
      )}
      <FileViewer file={viewed} open={viewerOpen} onOpenChange={setViewerOpen} />
      <RoleDetailsSheet
        role={chosenRole ?? null}
        active
        open={roleDetailsOpen}
        onOpenChange={setRoleDetailsOpen}
        startLabel="Выбрать роль"
        promptLabel="Использовать этот запрос"
        allowPromptUse={!busy}
        onStart={(role, prompt) => {
          change("role", role.name)
          if (prompt) settingsProps.onRolePrompt?.(prompt)
        }}
      />
      <FileDropOverlay active={dropping} title={drop?.title} limit={drop?.limit ?? `${maxFiles === 1 ? "1 файл" : `До ${maxFiles} файлов`}, каждый до 25 МБ`} />
    </div>
  )
}

/* The composer's buttons at the maximal radius — pills (the user's ask, 26.09); their variants and
   sizes stay the library's. */
const ROUND = "rounded-full"
/* Mic, send and stop are black (the user's ask, 27.09): the ink of the text, so white in the dark,
   as Krea's send. An exception to «accents are primary» — the price in the send pill stays primary. */
const INK = "bg-foreground text-background hover:bg-foreground/85 aria-expanded:bg-foreground/85"
/* The chosen role's chip in the bar. In dark the tray is `muted`, the same tone as `secondary`, so
   the chip takes the send pill's foreground tint there, or it vanishes into the tray. */
const BAR_CHIP = cn(
  ROUND,
  "group/chip font-normal animate-in fade-in-0 zoom-in-95 duration-150 ease-(--ease-out) motion-reduce:animate-none dark:bg-foreground/10 dark:hover:bg-foreground/15"
)
/* The white field's edge: a hairline ring and a soft drop. Attached files wear the same one (the
   user's ask, 27.09), so the cards and the field read as one family on the tray. */
const FIELD_EDGE = "shadow-[0_1px_3px_rgb(0_0_0/0.05)] ring-1 ring-foreground/6"
/* Attached file in the tray: a white card 48px tall with the field's edge, the 36px tile in its 6px
   padding (radii concentric: 14 → 8), two lines of text; it pops in as the file lands. On dark it
   takes the field's `muted`, as the field does. No hover fill (the user's ask, 27.09): the library's
   half-transparent one let the tray show through the card; the pointer cursor says it opens. */
const FILE_CARD = cn(
  "h-12 min-w-0 max-w-60 flex-nowrap gap-3 rounded-xl border-0 bg-background p-1.5 pr-4 has-data-[slot=attachment-content]:p-1.5 has-data-[slot=attachment-content]:pr-4 has-data-[slot=attachment-media]:p-1.5 has-data-[slot=attachment-media]:pr-4 animate-in fade-in-0 zoom-in-95 duration-150 ease-(--ease-out) motion-reduce:animate-none dark:bg-muted has-[>a,>button]:hover:bg-background dark:has-[>a,>button]:hover:bg-muted",
  FIELD_EDGE
)
/* A picture is the thumbnail alone: a 48px square, no padding, no text. */
const FILE_THUMB = "size-12 p-0 has-data-[slot=attachment-media]:p-0"
/* The cross on the card's corner: a 20px white disc with a hairline and a soft shadow, so it reads
   over both the card and the tray; the hit area is 32px. */
const REMOVE_FILE =
  "relative size-5 rounded-full shadow-xs after:absolute after:-inset-1.5 after:content-[''] dark:bg-muted dark:hover:bg-secondary-hover [&_svg:not([class*='size-'])]:size-3"
/* A template slot: the 48px square with its name under it (Krea: 6px apart, 10px medium, muted; 11px
   here for Cyrillic). */
const SLOT = "flex flex-none snap-start flex-col items-center gap-1.5"
const SLOT_LABEL = "text-[11px] leading-none font-medium text-muted-foreground select-none"
/* Krea's upload tile. The button is the whole column, tile and name; only the tile shows its states:
   the focus ring, the hover ink (fine pointers), the press (0.97) and the error — a red tint and edge,
   eased in 150ms. It pops in with the template, as a file card does. */
const UPLOAD =
  "group/upload h-auto rounded-none border-0 p-0 font-normal hover:bg-transparent focus-visible:ring-0 active:scale-[0.97]"
const UPLOAD_TILE = cn(
  "flex size-12 items-center justify-center rounded-xl bg-background text-muted-foreground transition-[color,background-color,box-shadow] duration-150 ease-out pointer-fine:group-hover/upload:text-foreground dark:bg-muted",
  FIELD_EDGE,
  "animate-in fade-in-0 zoom-in-95 ease-(--ease-out) motion-reduce:animate-none",
  "group-focus-visible/upload:ring-3 group-focus-visible/upload:ring-ring/50",
  "group-data-[error]/upload:bg-destructive/10 group-data-[error]/upload:text-destructive group-data-[error]/upload:ring-destructive/60 dark:group-data-[error]/upload:bg-destructive/20"
)
