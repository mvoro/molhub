import {
  CropIcon,
  Copy01Icon,
  FlashIcon,
  GemIcon,
  Globe02Icon,
  ImageDownloadIcon,
  LanguageSkillIcon,
  Layers01Icon,
  SignpostIcon,
  MusicNote01Icon,
  Timer02Icon,
  VoiceIcon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"

import type { SettingKey } from "@/data/composer-settings"
import type { ComposerMode } from "@/data/models"
import { CHAT_TYPE_ICON, ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

export const SETTING_ICON: Record<SettingKey, IconSvgElement> = {
  speed: FlashIcon,
  role: SignpostIcon,
  ratio: CropIcon,
  quality: GemIcon,
  resolution: GemIcon,
  gender: VoiceIcon,
  styleWeight: MusicNote01Icon,
  creativity: FlashIcon,
  audioWeight: VolumeHighIcon,
  custom: Layers01Icon,
  instrumental: MusicNote01Icon,
  count: Copy01Icon,
  duration: Timer02Icon,
  voice: VoiceIcon,
  language: LanguageSkillIcon,
  sound: VolumeHighIcon,
  backgroundMusic: MusicNote01Icon,
  lastImage: ImageDownloadIcon,
  chatImages: Layers01Icon,
  web: Globe02Icon,
}

/* The Molecula mark as a one-colour glyph (mask + currentColor), so it sits in monochrome UI
   like any other icon: Молли's mode icon and the molecule currency next to prices. `colored` is the
   logo itself, in its gradient (the send pill's price, the user's ask, 27.09). */
export function MoleculeIcon({ className, colored = false }: { className?: string; colored?: boolean }) {
  if (colored) {
    return (
      <img
        src="/brand/molecula-mark.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className={cn("inline-block size-4 shrink-0 select-none", className)}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 shrink-0 bg-current [mask:url(/brand/molecula-mark.svg)_center/contain_no-repeat]",
        className
      )}
    />
  )
}

/* Mode glyphs are monochrome: per-mode colours are gone from the composer. */
export function ModeIcon({ mode, className }: { mode: ComposerMode; className?: string }) {
  return <HugeiconsIcon icon={CHAT_TYPE_ICON[mode]} strokeWidth={ICON_STROKE} className={className} />
}

export function SettingIcon({ setting, className }: { setting: SettingKey; className?: string }) {
  return <HugeiconsIcon icon={SETTING_ICON[setting]} strokeWidth={ICON_STROKE} className={className} />
}
