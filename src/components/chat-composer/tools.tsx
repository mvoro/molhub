import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { ArrowRight01Icon, Attachment01Icon, Camera01Icon, Folder01Icon, Image02Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import {
  AppMenu,
  AppMenuContent,
  AppMenuItem,
  AppMenuSeparator,
  AppMenuSub,
  AppMenuSubContent,
  AppMenuSubTrigger,
  AppMenuTrigger,
} from "@/components/ui/app-menu"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetTitle } from "@/components/ui/app-sheet"
import { SettingIcon } from "@/components/chat-composer/icons"
import { Boost, OptionItems, valueLabel, type SettingsProps } from "@/components/chat-composer/settings"
import { Button } from "@/components/ui/button"
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { ChatType } from "@/data/chats"
import {
  NO_ROLE,
  SETTING_TITLE,
  TOGGLE_BOOST,
  TOGGLE_LABEL,
  isToggle,
  menuSettings,
  type ChoiceKey,
  type SettingKey,
} from "@/data/composer-settings"
import type { ComposerMode } from "@/data/models"
import { TOOLS as SIDEBAR_TOOLS } from "@/data/tools"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* Gemini-style tools: plain chat is Молли; a tool switches the composer to one kind of output.
   Text models are not a tool — they are picked in the model picker, like Gemini's Flash/Pro. */
export type Tool = Exclude<ChatType, "text">

/* The tile of a tool in the sidebar (public/icons/sm): the menu and the sheet show the same one. */
const tile = (mode: Tool) => SIDEBAR_TOOLS.find((tool) => tool.id === `new:${mode}`)?.icon ?? ""

export const TOOLS: { mode: Tool; label: string; chip: string; description: string; icon: string }[] = [
  { mode: "image", label: "Создать изображение", chip: "Фото", description: "По описанию или вашему фото", icon: tile("image") },
  { mode: "video", label: "Создать видео", chip: "Видео", description: "Ролик из текста или кадров", icon: tile("video") },
  { mode: "audio", label: "Создать музыку", chip: "Аудио", description: "Песня по описанию или вашему тексту", icon: tile("audio") },
]

/* A tool's tile at the glyph's size. */
function ToolTile({ icon, className }: { icon: string; className?: string }) {
  return <img src={icon} alt="" width={24} height={24} draggable={false} className={cn("shrink-0 select-none", className)} />
}

export const isTool = (mode: ComposerMode): mode is Tool => TOOLS.some((tool) => tool.mode === mode)

type ToolsProps = {
  mode: ComposerMode
  attachmentsDisabled?: boolean
  /* Picking the active tool again turns it off (back to Молли), like Gemini. */
  onToolChange: (tool: Tool | null) => void
  /* Inside a chat the kind of output is fixed: only attaching is offered. */
  locked: boolean
  /* Which picker to open: any file, photos only, or the camera. */
  onAttach: (kind: "file" | "photo" | "camera") => void
  onFiles?: (files: File[]) => void
  /* The current mode's settings (ratio, quality, …) live in «+» too (26.09 evening, the user's ask); the
     role left for its own button in the bar (27.09). */
  settings?: SettingsProps
}

const MENU_LABEL = "px-3.5 pt-1 pb-1 text-xs font-normal text-muted-foreground"

/* The current value of a choice as the menu shows it: a chosen role stands out. */
function SettingValue({ setting, settings }: { setting: ChoiceKey; settings: SettingsProps["settings"] }) {
  const chosen = setting === "role" && settings.role !== NO_ROLE
  return <span className={cn("max-w-28 truncate text-xs", chosen ? "text-primary" : "text-muted-foreground")}>{valueLabel(setting, settings)}</span>
}

/* One setting of the desktop menu: a submenu for a choice (the role with its search), a switch for
   a toggle. */
function SettingRow({ settings: props, setting: key }: { settings: SettingsProps; setting: SettingKey }) {
  if (isToggle(key)) {
    const on = props.settings[key]
    return (
      <AppMenuItem
        role="menuitemcheckbox"
        aria-checked={on}
        disabled={props.disabled}
        // Stays open: a switch is flipped in place, not chosen.
        onSelect={(event) => {
          event.preventDefault()
          props.onChange(key, !on)
        }}
      >
        <SettingIcon setting={key} />
        <span className="flex-1">{TOGGLE_LABEL[key]}</span>
        <Boost value={TOGGLE_BOOST[key]} />
        <Switch size="sm" checked={on} tabIndex={-1} aria-hidden className="pointer-events-none" />
      </AppMenuItem>
    )
  }
  const choice = key as ChoiceKey
  return (
    <AppMenuSub>
      <AppMenuSubTrigger disabled={props.disabled}>
        <SettingIcon setting={choice} />
        <span className="flex-1">{SETTING_TITLE[choice]}</span>
        <SettingValue setting={choice} settings={props.settings} />
      </AppMenuSubTrigger>
      <AppMenuSubContent title={SETTING_TITLE[choice]} className="w-64">
        <OptionItems {...props} setting={choice} />
      </AppMenuSubContent>
    </AppMenuSub>
  )
}

/* The tools lead from the home screen (text) into the photo, video and audio studios; inside a studio,
   or a chat, «+» no longer offers them (the user's ask, 27.09) — the sidebar switches studios. */
const offersTools = (mode: ComposerMode, locked: boolean) => !locked && !isTool(mode)

/* Desktop «+»: attach first, then the tools with the sidebar's tiles and what each makes (home only),
   then all the settings of the current mode, the bar's too (the user's ask, 27.09). No role: it has its
   own button right of the model (the user's ask, 27.09). */
export function ToolsMenu({ mode, onToolChange, locked, onAttach, attachmentsDisabled, settings, trigger }: ToolsProps & { trigger: React.ReactElement }) {
  const rest = settings ? menuSettings(settings.mode, settings.model, settings.settings) : []
  return (
    <AppMenu>
      <AppMenuTrigger asChild>{trigger}</AppMenuTrigger>
      <AppMenuContent side="bottom" align="start" sideOffset={10} className="w-80">
        <AppMenuItem aria-disabled={attachmentsDisabled} className={cn(attachmentsDisabled && "cursor-default opacity-50")} icon={Attachment01Icon} onSelect={() => onAttach("file")}>
          Загрузить фото и файлы
        </AppMenuItem>
        {offersTools(mode, locked) && (
          <>
            <AppMenuSeparator />
            {TOOLS.map((tool) => {
              const active = tool.mode === mode
              return (
                <AppMenuItem
                  key={tool.mode}
                  aria-checked={active}
                  role="menuitemcheckbox"
                  onSelect={() => onToolChange(active ? null : tool.mode)}
                  className="h-auto min-h-11 py-2"
                >
                  <ToolTile icon={tool.icon} className="size-[18px]" />
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate">{tool.label}</span>
                    <span className="truncate text-xs text-muted-foreground!">{tool.description}</span>
                  </span>
                  {active && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="text-foreground" />}
                </AppMenuItem>
              )
            })}
          </>
        )}
        {settings && rest.length > 0 && (
          <>
            <AppMenuSeparator />
            <DropdownMenuLabel className={MENU_LABEL}>Настройки</DropdownMenuLabel>
            {rest.map((key) => (
              <SettingRow key={key} settings={settings} setting={key} />
            ))}
          </>
        )}
      </AppMenuContent>
    </AppMenu>
  )
}

const SOURCES: { kind: "camera" | "photo" | "file"; label: string; icon: IconSvgElement }[] = [
  { kind: "camera", label: "Камера", icon: Camera01Icon },
  { kind: "photo", label: "Галерея", icon: Image02Icon },
  { kind: "file", label: "Файлы", icon: Folder01Icon },
]

/* A row of the phone's sheets («+», the model picker): 56px, a 24px glyph, the label over a line of
   detail. */
export const SHEET_ROW =
  "h-auto min-h-14 w-full justify-start gap-3.5 rounded-[16px] px-3 py-2.5 text-left text-base font-normal [&_svg]:size-6 active:translate-y-0 active:scale-[0.99]"
/* The same row as a label (around a switch): the library label, laid out like the rows above. */
const SHEET_LABEL =
  "flex min-h-14 w-full cursor-pointer items-center gap-3.5 rounded-[16px] px-3 py-2.5 text-base leading-normal font-normal select-none hover:bg-muted [&_svg:not([class*='size-'])]:size-6"

/* Phone «+» (Gemini app): source tiles on top, the tools below with a tick on the active one, then
   the settings of the current mode (a choice opens its own sheet, a switch flips in place).
   Every choice closes the sheet — one tap, one result. */
export function ToolsSheet({
  open,
  onOpenChange,
  mode,
  onToolChange,
  locked,
  onAttach,
  onFiles,
  attachmentsDisabled,
  settings,
  onOpenSetting,
}: ToolsProps & { open: boolean; onOpenChange: (open: boolean) => void; onOpenSetting?: (setting: ChoiceKey) => void }) {
  const switchId = React.useId()
  const pick = (action: () => void) => {
    onOpenChange(false)
    action()
  }
  // The role is not here: it has its own button right of the model (the user's ask, 27.09).
  const keys = settings ? menuSettings(settings.mode, settings.model, settings.settings) : []
  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent aria-describedby={undefined}>
        <AppSheetTitle className="sr-only">Добавить в запрос</AppSheetTitle>
        <AppSheetBody className="flex flex-col gap-3 px-3 pt-2 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {SOURCES.map((source) => onFiles && !attachmentsDisabled ? (
              <Button key={source.kind} asChild variant="secondary" className="relative h-20 flex-col gap-2 overflow-hidden rounded-[20px] text-sm font-normal [&_svg]:size-6">
                <Label>
                  <HugeiconsIcon icon={source.icon} strokeWidth={ICON_STROKE} />
                  {source.label}
                  <Input
                    type="file"
                    aria-label={source.label}
                    accept={source.kind === "file" && mode === "text" ? undefined : "image/*"}
                    capture={source.kind === "camera" ? "environment" : undefined}
                    multiple={source.kind !== "camera"}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files ?? [])
                      event.currentTarget.value = ""
                      if (files.length) { onFiles(files); onOpenChange(false) }
                    }}
                  />
                </Label>
              </Button>
            ) : (
              <Button
                key={source.kind}
                aria-disabled={attachmentsDisabled}
                variant="secondary"
                onClick={() => pick(() => onAttach(source.kind))}
                className="h-20 flex-col gap-2 rounded-[20px] text-sm font-normal aria-disabled:opacity-50 [&_svg]:size-6"
              >
                <HugeiconsIcon icon={source.icon} strokeWidth={ICON_STROKE} />
                {source.label}
              </Button>
            ))}
          </div>
          {offersTools(mode, locked) && (
            <div role="group" aria-label="Создать" className="flex flex-col gap-0.5">
              {TOOLS.map((tool) => {
                const active = tool.mode === mode
                return (
                  <Button
                    key={tool.mode}
                    variant="ghost"
                    aria-pressed={active}
                    onClick={() => pick(() => onToolChange(active ? null : tool.mode))}
                    className={cn(SHEET_ROW, "aria-pressed:bg-muted")}
                  >
                    <ToolTile icon={tool.icon} className="size-6" />
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate">{tool.label}</span>
                      <span className="truncate text-sm text-muted-foreground">{tool.description}</span>
                    </span>
                    {active && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="size-5!" />}
                  </Button>
                )
              })}
            </div>
          )}
          {settings && keys.length > 0 && (
            <div role="group" aria-label="Настройки" className="flex flex-col gap-0.5">
              {keys.map((key) => {
                if (isToggle(key)) {
                  const on = settings.settings[key]
                  return (
                    <Label key={key} htmlFor={`${switchId}-${key}`} className={SHEET_LABEL}>
                      <SettingIcon setting={key} />
                      <span className="flex-1 truncate">{TOGGLE_LABEL[key]}</span>
                      <Boost value={TOGGLE_BOOST[key]} className="text-sm" />
                      <Switch id={`${switchId}-${key}`} checked={on} disabled={settings.disabled} onCheckedChange={(next) => settings.onChange(key, next)} />
                    </Label>
                  )
                }
                const choice = key as ChoiceKey
                return (
                  <Button
                    key={key}
                    variant="ghost"
                    disabled={settings.disabled}
                    aria-label={`${SETTING_TITLE[choice]}: ${valueLabel(choice, settings.settings)}`}
                    onClick={() => pick(() => onOpenSetting?.(choice))}
                    className={SHEET_ROW}
                  >
                    <SettingIcon setting={choice} />
                    <span className="flex-1 truncate">{SETTING_TITLE[choice]}</span>
                    <span className={cn("max-w-40 truncate text-sm", choice === "role" && settings.settings.role !== NO_ROLE ? "text-primary" : "text-muted-foreground")}>
                      {valueLabel(choice, settings.settings)}
                    </span>
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} className="size-4! text-muted-foreground" />
                  </Button>
                )
              })}
            </div>
          )}
        </AppSheetBody>
      </AppSheetContent>
    </AppSheet>
  )
}
