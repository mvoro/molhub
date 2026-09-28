import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import {
  AppMenu,
  AppMenuContent,
  AppMenuTrigger,
} from "@/components/ui/app-menu"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { MoleculeIcon } from "@/components/chat-composer/icons"
import { RolePicker } from "@/components/roles/role-picker"
import { Button } from "@/components/ui/button"
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  SETTING_TITLE,
  formatCost,
  settingOptions,
  type ChoiceKey,
  type Settings,
} from "@/data/composer-settings"
import type { ComposerMode } from "@/data/models"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

export type SettingsProps = {
  mode: ComposerMode
  model?: string
  settings: Settings
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onRolePrompt?: (prompt: string) => void
  disabled?: boolean
}

export const valueLabel = (key: ChoiceKey, settings: Settings) =>
  key === "role" ? settings.role || "Не выбрана" : settings[key]

/* "+500 ✺" — the surcharge in molecules. Grey even on the highlighted row (the molecule colours
   itself, so it carries the muted colour past the row's focus rule), like the price in the model picker. */
export function Boost({ value, className }: { value?: number; className?: string }) {
  if (!value) return null
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-[3px] text-xs text-muted-foreground! tabular-nums", className)}>
      {value > 0 ? "+" : ""}{formatCost(value)}
      <MoleculeIcon className="size-3 text-muted-foreground!" />
    </span>
  )
}

/* ─── Desktop: popovers on the library dropdown (AppMenu) ─────────────────────────────── */

const MENU_ROW = "h-auto min-h-9 gap-2.5 rounded-[10px] py-2 pr-9 pl-3.5 text-sm"

export function OptionItems({ mode, model, setting, settings, onChange }: SettingsProps & { setting: ChoiceKey }) {
  return (
    <DropdownMenuRadioGroup value={settings[setting]} onValueChange={(value) => onChange(setting, value)}>
      {settingOptions(mode, setting, model).map((option) => (
        <DropdownMenuRadioItem key={option.value} value={option.value} className={MENU_ROW}>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate">{option.value}</span>
            {option.description && <span className="text-xs text-muted-foreground!">{option.description}</span>}
          </span>
          {option.hint && <span className="text-xs text-muted-foreground!">{option.hint}</span>}
          <Boost value={option.boost} />
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

/* A setting's own menu, opened from its button in the bar: just the values of that setting. Opens as
   the composer's other menus do («+», the model). */
export function SettingPopover(props: SettingsProps & { setting: ChoiceKey; trigger: React.ReactElement }) {
  const { setting, trigger } = props
  if (setting === "role") {
    return <RolePicker value={props.settings.role} onChange={(value) => props.onChange("role", value)} onPrompt={props.onRolePrompt} trigger={trigger} />
  }
  return (
    <AppMenu>
      <AppMenuTrigger asChild>{trigger}</AppMenuTrigger>
      <AppMenuContent side="bottom" align="start" sideOffset={10} className="w-64">
        <DropdownMenuLabel className="px-3.5 pt-1 pb-1.5 text-xs font-normal text-muted-foreground">{SETTING_TITLE[setting]}</DropdownMenuLabel>
        <OptionItems {...props} />
      </AppMenuContent>
    </AppMenu>
  )
}

/* ─── Mobile: one bottom sheet ─────────────────────────────────────────────────────────── */

const SHEET_ROW =
  "h-auto min-h-12 w-full justify-start gap-3 rounded-[14px] px-3 py-2.5 has-[>svg]:px-3 text-left text-base font-normal whitespace-normal active:translate-y-0 active:scale-[0.99] [&_svg]:size-5"

function SheetOptions({ mode, model, setting, settings, onChange, onDone }: SettingsProps & { setting: ChoiceKey; onDone: () => void }) {
  return (
    <div className="flex flex-col gap-1 pb-4">
      {settingOptions(mode, setting, model).map((option) => (
        <SheetChoice
          key={option.value}
          label={option.value}
          description={option.description}
          hint={option.hint}
          boost={option.boost}
          selected={settings[setting] === option.value}
          onSelect={() => {
            onChange(setting, option.value)
            onDone()
          }}
        />
      ))}
    </div>
  )
}

function SheetChoice({
  label,
  description,
  hint,
  boost,
  selected,
  onSelect,
}: {
  label: string
  description?: string
  hint?: string
  boost?: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Button variant="ghost" aria-pressed={selected} onClick={onSelect} className={cn(SHEET_ROW, "aria-pressed:bg-muted")}>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate">{label}</span>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </span>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      <Boost value={boost} className="text-sm" />
      {selected && <HugeiconsIcon icon={Tick02Icon} strokeWidth={ICON_STROKE} className="text-foreground" />}
    </Button>
  )
}

/* Phone: one setting per bottom sheet, opened from its button under the field; a choice closes it. */
export function SettingsSheet({
  setting,
  onClose,
  ...props
}: SettingsProps & { setting: ChoiceKey | null; onClose: () => void }) {
  // Keep the last setting while the sheet slides out, so its content doesn't blank mid-exit.
  const [shown, setShown] = React.useState(setting)
  if (setting && setting !== shown) setShown(setting)
  if (shown === "role") {
    return (
      <RolePicker
        value={props.settings.role}
        onChange={(value) => props.onChange("role", value)}
        onPrompt={props.onRolePrompt}
        open={setting === "role"}
        onOpenChange={(next) => !next && onClose()}
      />
    )
  }
  return (
    <AppSheet open={setting !== null} onOpenChange={(next) => !next && onClose()}>
      <AppSheetContent aria-describedby={undefined}>
        <AppSheetHeader closeLabel="Закрыть">
          <AppSheetTitle>{shown ? SETTING_TITLE[shown] : ""}</AppSheetTitle>
        </AppSheetHeader>
        <AppSheetBody className="px-3">
          {shown && <SheetOptions setting={shown} mode={props.mode} model={props.model} settings={props.settings} onChange={props.onChange} onDone={onClose} />}
        </AppSheetBody>
      </AppSheetContent>
    </AppSheet>
  )
}
