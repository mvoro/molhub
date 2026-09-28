import { withBasePath } from "../lib/base-path.ts"
import meta from "@lobehub/icons-static-svg/icons/meta.svg?url"
import midjourney from "@lobehub/icons-static-svg/icons/midjourney.svg?url"
import ideogram from "@lobehub/icons-static-svg/icons/ideogram.svg?url"
import happyhorse from "@lobehub/icons-static-svg/icons/happyhorse.svg?url"
import minimax from "@lobehub/icons-static-svg/icons/minimax.svg?url"
import bytedance from "@lobehub/icons-static-svg/icons/bytedance.svg?url"
import claude from "@lobehub/icons-static-svg/icons/claude.svg?url"
import claudeColor from "@lobehub/icons-static-svg/icons/claude-color.svg?url"
import deepmind from "@lobehub/icons-static-svg/icons/deepmind.svg?url"
import deepmindColor from "@lobehub/icons-static-svg/icons/deepmind-color.svg?url"
import deepseek from "@lobehub/icons-static-svg/icons/deepseek.svg?url"
import deepseekColor from "@lobehub/icons-static-svg/icons/deepseek-color.svg?url"
import elevenlabs from "@lobehub/icons-static-svg/icons/elevenlabs.svg?url"
import flux from "@lobehub/icons-static-svg/icons/flux.svg?url"
import gemini from "@lobehub/icons-static-svg/icons/gemini.svg?url"
import geminiColor from "@lobehub/icons-static-svg/icons/gemini-color.svg?url"
import grok from "@lobehub/icons-static-svg/icons/grok.svg?url"
import kimi from "@lobehub/icons-static-svg/icons/kimi.svg?url"
import kimiColor from "@lobehub/icons-static-svg/icons/kimi-color.svg?url"
import kling from "@lobehub/icons-static-svg/icons/kling.svg?url"
import klingColor from "@lobehub/icons-static-svg/icons/kling-color.svg?url"
import nanobanana from "@lobehub/icons-static-svg/icons/nanobanana.svg?url"
import nanobananaColor from "@lobehub/icons-static-svg/icons/nanobanana-color.svg?url"
import openai from "@lobehub/icons-static-svg/icons/openai.svg?url"
import perplexity from "@lobehub/icons-static-svg/icons/perplexity.svg?url"
import perplexityColor from "@lobehub/icons-static-svg/icons/perplexity-color.svg?url"
import qwen from "@lobehub/icons-static-svg/icons/qwen.svg?url"
import qwenColor from "@lobehub/icons-static-svg/icons/qwen-color.svg?url"
import recraft from "@lobehub/icons-static-svg/icons/recraft.svg?url"
import runway from "@lobehub/icons-static-svg/icons/runway.svg?url"
import sora from "@lobehub/icons-static-svg/icons/sora.svg?url"
import soraColor from "@lobehub/icons-static-svg/icons/sora-color.svg?url"
import suno from "@lobehub/icons-static-svg/icons/suno.svg?url"
import zai from "@lobehub/icons-static-svg/icons/zai.svg?url"

import { ModeIcon } from "@/components/chat-composer/icons"
import type { ComposerMode } from "@/data/models"
import { cn } from "@/lib/utils"

/* Vendor marks from Lobe Icons (the user's ask, 27.09; lobehub.com/icons). The static SVG set, not the
   React package: that one needs antd, @lobehub/ui and lucide, a second UI kit in a shadcn app. A mark has
   a mono version (drawn in `currentColor`) and, for most brands, a colour one; OpenAI, Grok, FLUX,
   Recraft, Runway, Suno, ElevenLabs and Z.ai are black by design and have only the mono one. Молли is
   our own mark (public/models). */
/* `round`: the colour mark is a square tile, cut to a circle (the user's ask, 27.09: Sora's read as a
   square among the round marks). */
const LOGOS: Record<string, { mono: string; color?: string; round?: boolean }> = {
  // Молли's mono mark is her circle with the star cut out, the same shape as the colour one.
  meta: { mono: meta },
  midjourney: { mono: midjourney },
  ideogram: { mono: ideogram },
  happyhorse: { mono: happyhorse },
  minimax: { mono: minimax },
  bytedance: { mono: bytedance },
  seedream: { mono: bytedance },
  seedance: { mono: bytedance },
  molly: { mono: withBasePath("/models/molly-mono.svg"), color: withBasePath("/models/molly.svg") },
  openai: { mono: openai },
  claude: { mono: claude, color: claudeColor },
  gemini: { mono: gemini, color: geminiColor },
  deepmind: { mono: deepmind, color: deepmindColor },
  deepseek: { mono: deepseek, color: deepseekColor },
  perplexity: { mono: perplexity, color: perplexityColor },
  grok: { mono: grok },
  kimi: { mono: kimi, color: kimiColor },
  qwen: { mono: qwen, color: qwenColor },
  zai: { mono: zai },
  nanobanana: { mono: nanobanana, color: nanobananaColor },
  flux: { mono: flux },
  recraft: { mono: recraft },
  sora: { mono: sora, color: soraColor, round: true },
  kling: { mono: kling, color: klingColor },
  runway: { mono: runway },
  suno: { mono: suno },
  elevenlabs: { mono: elevenlabs },
}

/* A model's mark. `color`: the brand's colours (the current model); without it the mark is one flat
   colour — the text's, so the caller greys it with `text-muted-foreground` (the other models in the
   picker). A brand with no colour version stays flat either way, in the caller's colour. The mono mark
   is the SVG as a mask over `currentColor`, so any token colours it. No logo: the mode's glyph. */
export function ModelLogo({
  logo,
  color = false,
  mode = "text",
  className,
}: {
  logo?: string
  color?: boolean
  mode?: ComposerMode
  className?: string
}) {
  const mark = logo ? LOGOS[logo] : undefined
  if (!mark) return <ModeIcon mode={mode} className={cn("size-4 shrink-0", className)} />
  if (color && mark.color) {
    return <img src={mark.color} alt="" draggable={false} className={cn("size-4 shrink-0 object-contain select-none", mark.round && "rounded-full", className)} />
  }
  return (
    <span
      aria-hidden="true"
      // Quoted: Vite inlines a small SVG as a data URI, which an unquoted url() would break on.
      style={{ maskImage: `url("${mark.mono}")`, WebkitMaskImage: `url("${mark.mono}")` }}
      className={cn("inline-block size-4 shrink-0 bg-current mask-contain mask-center mask-no-repeat", className)}
    />
  )
}
