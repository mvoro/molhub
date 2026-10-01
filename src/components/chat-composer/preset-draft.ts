import type { ComposerDraft } from "./chat-composer.tsx"
import type { PromptPreset, PresetType } from "../../data/prompt-presets.ts"

type PresetDraft = Pick<ComposerDraft, "text" | "files" | "frames" | "template" | "photo">

/* A preset replaces the editable request. Video keeps its source-photo slot; selecting a photo
   style starts a photo request and releases the video-only slots, while ordinary files stay. */
export function selectComposerPreset(current: PresetDraft, preset: PromptPreset, type: PresetType): { draft: PresetDraft; releasedUrls: string[] } {
  const photo = current.photo ?? current.files.find((file) => file.type.startsWith("image/")) ?? null
  const draft: PresetDraft = type === "video"
    ? { ...current, text: preset.prompt, template: preset, photo, files: current.files.filter((file) => file !== photo) }
    : { ...current, text: preset.prompt, template: null, photo: null, frames: [null, null] }
  const kept = new Set([...draft.files, ...draft.frames, draft.photo].flatMap((file) => file ? [file.url] : []))
  const releasedUrls = [...new Set([...current.files, ...current.frames, current.photo].flatMap((file) => file && !kept.has(file.url) ? [file.url] : []))]
  return { draft, releasedUrls }
}
