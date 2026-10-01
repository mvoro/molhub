import type { ComposerDraft } from "../components/chat-composer/chat-composer.tsx"
import { defaultSettings, normalizeSettings } from "../data/composer-settings.ts"
import { COMPOSER_MODES, resolveModelName } from "../data/models.ts"
import type { Trend } from "../data/trends.ts"

/* Repeating a trend starts an editable request. Its preview is an example result, not an
   attachment or a hidden video template; the user can add their own source photo in the studio. */
export function createTrendDraft(trend: Trend): ComposerDraft {
  const models = Object.fromEntries(COMPOSER_MODES.map((mode) => [
    mode,
    resolveModelName(mode, mode === trend.type ? trend.model : undefined),
  ])) as NonNullable<ComposerDraft["models"]>

  return {
    text: trend.preset.prompt,
    files: [],
    frames: [null, null],
    template: null,
    photo: null,
    models,
    settings: Object.fromEntries(COMPOSER_MODES.map((mode) => [
      mode,
      mode === trend.type
        ? normalizeSettings(mode, models[mode], trend.settings)
        : defaultSettings(mode, models[mode]),
    ])) as NonNullable<ComposerDraft["settings"]>,
  }
}
