import { withBasePath } from "../../lib/base-path.ts"
import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  AiMagicIcon,
  ArrowDown01Icon,
  ArrowUp02Icon,
  Cancel01Icon,
  FlashIcon,
  Globe02Icon,
  Idea01Icon,
  SignpostIcon,
  Mic01Icon,
  PaperclipIcon,
  StopIcon,
} from "@hugeicons/core-free-icons"

import type { ComposerMessage } from "@/components/chat-composer/chat-composer"
import { fileIcon } from "@/components/chat-composer/file-icon"
import { ModeIcon, MoleculeIcon } from "@/components/chat-composer/icons"
import { ModelPicker } from "@/components/chat-composer/model-picker"
import { SettingPopover, SettingsSheet, type SettingsProps } from "@/components/chat-composer/settings"
import { ToolsSheet } from "@/components/chat-composer/tools"
import { useComposerFiles } from "@/components/chat-composer/use-composer-files"
import { useVoiceInput } from "@/components/chat-composer/use-voice-input"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Segmented, SegmentedItem } from "@/components/ui/segmented"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  NO_ROLE,
  defaultSettings,
  estimateCost,
  formatCost,
  moleculesWord,
  settingOptions,
  type ChoiceKey,
  type Settings,
} from "@/data/composer-settings"
import type { ChatType } from "@/data/chats"
import { DEFAULT_MODEL, findModel, isMolly, type ComposerMode } from "@/data/models"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* Touch keyboards have no Shift: Return adds a line there, and the arrow sends (ChatGPT app). */
const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

/* Depth of the answer as one glyph each: a bolt, a spark, a bulb. */
const SPEED_ICON: Record<string, IconSvgElement> = { Быстро: FlashIcon, Оптимально: AiMagicIcon, Глубоко: Idea01Icon }

type TextComposerProps = {
  onSend: (message: ComposerMessage) => void
  /* A model of another kind picked in the picker opens that tool. Absent = inside a chat: the kind
     is fixed, the picker keeps to text models. */
  onModeChange?: (mode: ComposerMode) => void
  placeholder?: string
  generating?: boolean
  onStop?: () => void
  autoFocus?: boolean
  /* Model and settings to start with (a chat continues its new-chat choices). */
  initial?: { model: string; settings: Settings }
  className?: string
}

/* The text composer (26.09, after a Pinterest reference): one white card with a quiet border.
   Anatomy: attachment chips → the text → a bar. Left: a paperclip, the depth of the answer as a
   three-glyph segmented control (a pill on the phone), the «Поиск» toggle, the role. Right: the
   model pill, the mic, and the send pill with the price once there is something to send.
   Photo, video and audio keep their own composer (chat-composer.tsx). */
export function TextComposer({
  onSend,
  onModeChange,
  placeholder = "Спросите что-нибудь…",
  generating = false,
  onStop,
  autoFocus = false,
  initial,
  className,
}: TextComposerProps) {
  const mobile = useIsMobile()
  const [text, setText] = React.useState("")
  const [model, setModel] = React.useState(initial?.model ?? DEFAULT_MODEL.text)
  const [settings, setSettings] = React.useState<Settings>(() => initial?.settings ?? defaultSettings("text"))
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [sourcesOpen, setSourcesOpen] = React.useState(false)
  const [sheetSetting, setSheetSetting] = React.useState<ChoiceKey | null>(null)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)
  const busy = generating
  const attachments = useComposerFiles({ disabled: busy })
  const voice = useVoiceInput(setText)

  const locked = !onModeChange
  const modelInfo = findModel(model)
  const filled = text.trim() !== "" || attachments.files.length > 0
  const cost = estimateCost("text", settings, modelInfo?.version.price)
  const costLabel = formatCost(cost)

  React.useEffect(() => {
    if (autoFocus && !isTouch()) fieldRef.current?.focus()
  }, [autoFocus])

  const change: SettingsProps["onChange"] = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))
  const settingsProps: SettingsProps = { mode: "text", settings, onChange: change, disabled: busy }

  const submit = () => {
    if (!filled || busy) return
    voice.stop()
    onSend({ text: text.trim(), files: attachments.files, frames: [null, null], template: null, photo: null, mode: "text", model, settings, cost })
    setText("")
    attachments.clear()
  }

  /* Another tab of the picker opens that tool; Молли is a text model wherever she is picked. */
  const pickModel = (type: ChatType, name: string) => {
    if (type !== "text" && !isMolly(name) && !locked) {
      onModeChange?.(type)
      return
    }
    setModel(name)
  }

  /* ── bar, left ── */

  const attach = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Прикрепить файлы"
          disabled={busy}
          onClick={() => (mobile ? setSourcesOpen(true) : attachments.pick("file"))}
          className={cn(ROUND, ICON, TOUCH_ICON, "shrink-0 shadow-none")}
        >
          <HugeiconsIcon icon={PaperclipIcon} strokeWidth={ICON_STROKE} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" hidden={mobile}>
        Прикрепить файлы
      </TooltipContent>
    </Tooltip>
  )

  /* Desktop: three glyphs in a grey track, the chosen one lifted on white (the reference's group).
     The phone has no room for a track and no tooltips: the chosen glyph with a chevron opens a
     sheet that names all three (the sheet carries the labels). */
  const speed = mobile ? (
    <Button
      variant="outline"
      size="lg"
      aria-label={`Скорость ответа: ${settings.speed}`}
      disabled={busy}
      onClick={() => setSheetSetting("speed")}
      className={cn(PILL, ICON, "shrink-0 gap-1 pr-1.5 pl-2.5")}
    >
      <HugeiconsIcon icon={SPEED_ICON[settings.speed] ?? FlashIcon} strokeWidth={ICON_STROKE} />
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-4! text-muted-foreground" />
    </Button>
  ) : (
    <Segmented
      value={settings.speed}
      onValueChange={(value) => change("speed", value)}
      size="sm"
      disabled={busy}
      aria-label="Скорость ответа"
      className="shrink-0 p-0.5"
    >
      {settingOptions("text", "speed").map((option) => (
        <Tooltip key={option.value}>
          {/* The trigger wraps the item rather than being it: a trigger's own data-state (the
              tooltip's open/closed) would overwrite the item's on/off, which styles the white pill. */}
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <SegmentedItem value={option.value} aria-label={option.value} className="h-8 w-9 flex-none px-0 [&_svg]:size-[18px]">
                <HugeiconsIcon icon={SPEED_ICON[option.value] ?? FlashIcon} strokeWidth={ICON_STROKE} />
              </SegmentedItem>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {option.value} · {option.description}
            {option.boost ? <Surcharge value={option.boost} /> : null}
          </TooltipContent>
        </Tooltip>
      ))}
    </Segmented>
  )

  const web = (
    <Toggle
      variant="outline"
      size="lg"
      pressed={settings.web}
      onPressedChange={(on) => change("web", on)}
      disabled={busy}
      aria-label="Искать в интернете"
      className={cn(PILL, ICON, "shrink-0", TOGGLE_ON)}
    >
      <HugeiconsIcon icon={Globe02Icon} strokeWidth={ICON_STROKE} />
      Поиск
    </Toggle>
  )

  const roleSet = settings.role !== NO_ROLE
  const roleTrigger = (
    <Button
      variant="outline"
      size="lg"
      aria-label={`Роль: ${roleSet ? settings.role : "не выбрана"}`}
      aria-pressed={roleSet || undefined}
      disabled={busy}
      onClick={mobile ? () => setSheetSetting("role") : undefined}
      className={cn(PILL, ICON, "min-w-0 max-w-52 pr-2", roleSet && ACTIVE_PILL)}
    >
      <HugeiconsIcon icon={SignpostIcon} strokeWidth={ICON_STROKE} />
      <span className="truncate">{roleSet ? settings.role : "Роль"}</span>
      {!roleSet && <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-4! text-muted-foreground" />}
    </Button>
  )
  const roleControl = mobile ? roleTrigger : <SettingPopover {...settingsProps} setting="role" trigger={roleTrigger} />
  // A chosen role reads as one pill with its own reset, glued by the library group.
  const role = roleSet ? (
    <ButtonGroup className="shrink-0">
      {roleControl}
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Сбросить роль"
        disabled={busy}
        onClick={() => change("role", NO_ROLE)}
        className={cn(ROUND, TOUCH_ICON, "w-8 shadow-none", ACTIVE_PILL)}
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} className="size-4!" />
      </Button>
    </ButtonGroup>
  ) : (
    roleControl
  )

  /* ── bar, right ── */

  const modelButton = (
    <Button
      variant="outline"
      size="lg"
      aria-label={`Модель: ${model}. Выбрать другую`}
      disabled={busy}
      className={cn(PILL, "min-w-0 pr-2 pl-2 max-md:max-w-36 md:max-w-56")}
    >
      <Avatar className="size-5 bg-transparent after:hidden">
        {modelInfo?.family.logo && <AvatarImage src={withBasePath(`/models/${modelInfo.family.logo}.svg`)} alt="" />}
        <AvatarFallback className="bg-transparent">
          <ModeIcon mode="text" className="size-4" />
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{model}</span>
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="size-4! text-muted-foreground" />
    </Button>
  )

  /* The mic while the field is empty, the send pill with the price once there is something to send
     (desktop keeps the mic beside it), a stop button while generating. */
  const mic = !busy && !(mobile && filled) && (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={voice.listening ? "Остановить запись" : "Голосовой ввод"}
          aria-pressed={voice.listening}
          onClick={voice.listening ? voice.stop : () => voice.start(text)}
          className={cn(ROUND, ICON, TOUCH_ICON, "aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:animate-pulse")}
        >
          <HugeiconsIcon icon={Mic01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" hidden={mobile}>
        {voice.listening ? "Остановить запись" : "Голосовой ввод"}
      </TooltipContent>
    </Tooltip>
  )
  const send = busy ? (
    <Button
      key="stop"
      size="icon-lg"
      aria-label="Остановить генерацию"
      disabled={!onStop}
      onClick={onStop}
      className={cn(ROUND, ICON, TOUCH_ICON, "animate-in fade-in-0 zoom-in-90 duration-150 ease-(--ease-out) motion-reduce:animate-none")}
    >
      <HugeiconsIcon icon={StopIcon} strokeWidth={ICON_STROKE} />
    </Button>
  ) : (
    filled && (
      <Button
        key="send"
        size="lg"
        aria-label={`Отправить — примерно ${costLabel} ${moleculesWord(cost)}`}
        onClick={submit}
        className={cn(ROUND, TOUCH, "gap-1.5 pr-2 pl-3.5 tabular-nums animate-in fade-in-0 zoom-in-90 duration-150 ease-(--ease-out) motion-reduce:animate-none")}
      >
        {costLabel}
        <MoleculeIcon className="size-3" />
        <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.25} className="ml-0.5 size-[18px]!" />
      </Button>
    )
  )

  /* ── attachments: pills over the text, a thumbnail or a file glyph, the name, a cross ── */

  const chips = attachments.files.map((item) => {
    const image = item.type.startsWith("image/")
    return (
      <Attachment key={item.id} size="xs" className={CHIP}>
        <AttachmentMedia variant={image ? "image" : "icon"} className="size-6! rounded-full!">
          {image ? <img src={item.url} alt="" /> : <HugeiconsIcon icon={fileIcon(item)} strokeWidth={ICON_STROKE} />}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle className="text-[13px] font-normal">{item.name}</AttachmentTitle>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label={`Убрать ${item.name}`} onClick={() => attachments.remove(item.id)} className="size-6 rounded-full">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    )
  })

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div
        className={cn(CARD, attachments.dragging && "border-primary/40 ring-2 ring-primary/20")}
        {...attachments.dragProps}
        // The whole card takes the tap: a click on its padding still lands in the text.
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest("button, textarea, a, input, [role=menu]")) fieldRef.current?.focus()
        }}
      >
        {attachments.files.length > 0 && <AttachmentGroup className="gap-2 px-3 pt-3">{chips}</AttachmentGroup>}

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
          onPaste={attachments.onPaste}
          placeholder={placeholder}
          aria-label="Сообщение"
          enterKeyHint={isTouch() ? "enter" : "send"}
          className={FIELD}
        />

        <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
          {/* The left cluster scrolls on a narrow screen (the model and send stay put); the 4px bleed
              keeps focus rings whole inside the scroller. */}
          <div className="-m-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto p-1 scroll-fade-x scrollbar-none">
            {attach}
            {speed}
            {web}
            {role}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ModelPicker
              trigger={modelButton}
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              type="text"
              model={model}
              onSelect={pickModel}
            />
            {mic}
            {send}
          </div>
        </div>
      </div>

      {attachments.input}

      {mobile && (
        <>
          {/* «locked» leaves only the three sources (camera, gallery, files): tools are the chips above. */}
          <ToolsSheet mode="text" locked onToolChange={() => undefined} onAttach={attachments.pick} onFiles={attachments.add} open={sourcesOpen} onOpenChange={setSourcesOpen} />
          <SettingsSheet {...settingsProps} setting={sheetSetting} onClose={() => setSheetSetting(null)} />
        </>
      )}
    </div>
  )
}

/* "+2 ✺" inside a tooltip. */
function Surcharge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 tabular-nums">
      +{formatCost(value)}
      <MoleculeIcon className="size-2.5" />
    </span>
  )
}

/* Touch screens get the sidebar's 40px targets. */
const TOUCH = "pointer-coarse:h-10"
const TOUCH_ICON = "pointer-coarse:size-10"
const ROUND = "rounded-full"
/* Bar icons at the sidebar's size (18px in a 36px button). */
const ICON = "[&_svg:not([class*='size-'])]:size-[18px]"
/* Outline pills of the bar (the model, «Поиск», «Роль»): quiet border, the muted fill on hover. */
const PILL = cn(ROUND, TOUCH, "h-9 gap-1.5 px-3 font-normal shadow-none")
/* A pill that holds a choice (a role, search on): the primary tint instead of a border. */
const ACTIVE_PILL =
  "border-transparent bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary aria-expanded:bg-primary/15 aria-expanded:text-primary dark:border-transparent dark:bg-primary/20 dark:hover:bg-primary/25"
const TOGGLE_ON =
  "aria-pressed:border-transparent aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:hover:bg-primary/15 data-[state=on]:border-transparent data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:hover:bg-primary/15 dark:aria-pressed:bg-primary/20 dark:data-[state=on]:bg-primary/20"
/* One white card with a quiet border and a faint lift (the reference), the primary tint while a
   file is dragged over it. */
const CARD =
  "relative z-10 cursor-text rounded-[24px] border border-border bg-background shadow-[0_2px_10px_rgb(0_0_0/0.04)] transition-[box-shadow,border-color] duration-150 dark:bg-card"
const FIELD =
  "max-h-[200px] min-h-12 resize-none border-0 bg-transparent! px-4 pt-3.5 pb-1 text-base leading-6 shadow-none focus-visible:ring-0 disabled:opacity-100 md:text-[15px] max-md:max-h-[30svh]"
/* Attachment pill: 32px tall, the glyph or thumbnail at the left, the cross at the right. */
const CHIP =
  "h-8 min-w-0 max-w-56 flex-nowrap gap-1.5 rounded-full px-1 py-0 has-data-[slot=attachment-content]:px-1 has-data-[slot=attachment-content]:py-0 has-data-[slot=attachment-media]:px-1 has-data-[slot=attachment-media]:py-0 animate-in fade-in-0 zoom-in-95 duration-150 ease-(--ease-out) motion-reduce:animate-none"
