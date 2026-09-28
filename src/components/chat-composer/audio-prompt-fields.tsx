import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { audioStyleLimit } from "@/data/composer-settings"
import type { SettingsProps } from "./settings"

/** Suno's free-text options sit above the prompt; switches and numeric choices stay in Settings. */
export function AudioPromptFields({ model = "Suno V5", settings, onChange }: Pick<SettingsProps, "model" | "settings" | "onChange">) {
  const limit = audioStyleLimit(model)
  return (
    <div className="grid gap-3 px-4 pt-4">
      <Label className="grid gap-2">
        Жанр / стиль
        <Textarea value={settings.styles} onChange={e => onChange("styles", e.target.value)} maxLength={limit} placeholder="Acoustic folk, soft vocals" className="min-h-20" />
        <span className="text-xs font-normal text-muted-foreground">{settings.styles.length} / {limit}</span>
      </Label>
      <Label className="grid gap-2">
        Название трека
        <Input value={settings.title} onChange={e => onChange("title", e.target.value)} maxLength={80} placeholder="Звёздная пыль" />
      </Label>
      <Label className="grid gap-2">
        Избегать стилей
        <Input value={settings.negative} onChange={e => onChange("negative", e.target.value)} placeholder="Rock, distortion" />
      </Label>
    </div>
  )
}
