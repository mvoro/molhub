import * as React from "react"
import { toast } from "sonner"

import type { ComposerFile } from "@/components/chat-composer/use-composer-files"
import { THINKING_STEPS, imageCaption, pickReply, wantsImage } from "@/data/demo-replies"
import { isMolly } from "@/data/models"
import { PICTURES } from "@/hooks/use-media-feed"
import { replyDocument, type ChatAttachment, type ChatArtifact } from "@/lib/chat-attachments"
import { keepChatFile, readChatThread, removeChatThread, saveChatThread } from "@/lib/chat-storage"
import { clientId } from "@/lib/client-id"
import { demoChatMessages } from "@/data/demo-chats"

/* Messages and attachment blobs persist in IndexedDB. Replies run outside React, so switching
   chats does not stop generation. Reloading restores the part of an interrupted reply already shown. */
export type UserMessage = {
  id: string
  role: "user"
  text: string
  attachments?: ChatAttachment[]
}

export type ReplyImage = {
  src: string
  /* Width / height. */
  ratio: number
  status: "drawing" | "ready"
}

/* thinking → (drawing, Молли's pictures) → streaming → done; «stopped» from any of the first three. */
export type ReplyStatus = "thinking" | "drawing" | "streaming" | "done" | "stopped"

export type AssistantMessage = {
  id: string
  role: "assistant"
  /* The model's version name, as the picker shows it. */
  model: string
  /* The request it answers: a picture is named by it (the viewer's title, the download). */
  request: string
  status: ReplyStatus
  /* The thinking line's states while it thinks. */
  steps: string[]
  /* The whole reply; `shown` of its tokens (words and the spaces between them) are out. */
  text: string
  shown: number
  image?: ReplyImage
  rating?: "up" | "down"
  artifacts?: ChatArtifact[]
}

export type ChatMessage = UserMessage | AssistantMessage

export const isActive = (status: ReplyStatus) => status === "thinking" || status === "drawing" || status === "streaming"

/* Words and the whitespace between them, so a paragraph break survives the stream. */
export const tokenize = (text: string) => text.split(/(\s+)/).filter(Boolean)

const threads = new Map<string, ChatMessage[]>()
const listeners = new Set<() => void>()
const timers = new Map<string, number>()
const NONE: ChatMessage[] = []
const loading = new Map<string, Promise<void>>()
type ChatLoadState = "loading" | "ready" | "error"
const loadStates = new Map<string, ChatLoadState>()
const saves = new Map<string, number>()
const writes = new Map<string, Promise<unknown>>()
const deleted = new Set<string>()
const storageError = () => { toast.error("Не удалось сохранить историю на устройстве. Не закрывайте вкладку и освободите место.", { id: "chat-storage" }) }

function hydrate(chatId: string) {
  if (!loading.has(chatId)) {
    loadStates.set(chatId, "loading")
    emit()
    loading.set(chatId, readChatThread(chatId).then((stored) => {
      if (deleted.has(chatId)) return
      const saved = stored?.length ? stored : demoChatMessages(chatId)
      if (saved?.length) {
        const current = threads.get(chatId) ?? NONE
        const ids = new Set(current.map((message) => message.id))
        const restored = saved.filter((message) => !ids.has(message.id)).map((message): ChatMessage => {
          if (message.role !== "assistant" || !isActive(message.status)) return message
          return { ...message, status: "stopped", text: tokenize(message.text).slice(0, message.shown).join(""), image: message.image?.status === "ready" ? message.image : undefined, artifacts: undefined }
        })
        threads.set(chatId, [...restored, ...current])
      }
      loadStates.set(chatId, "ready")
      emit()
    }).catch((error: unknown) => { loading.delete(chatId); loadStates.set(chatId, "error"); emit(); throw error }))
  }
  return loading.get(chatId)!
}

function persist(chatId: string, immediately = false) {
  if (!immediately && saves.has(chatId)) return
  window.clearTimeout(saves.get(chatId))
  saves.set(chatId, window.setTimeout(() => {
    saves.delete(chatId)
    const write = Promise.all([hydrate(chatId), writes.get(chatId)]).then(() => {
      if (!deleted.has(chatId)) return saveChatThread(chatId, threads.get(chatId) ?? NONE)
    }).catch(storageError)
    writes.set(chatId, write)
  }, immediately ? 0 : 500))
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const emit = () => listeners.forEach((listener) => listener())
const newId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const between = (min: number, max: number) => min + Math.random() * (max - min)

function patch(chatId: string, id: string, change: (message: AssistantMessage) => Partial<AssistantMessage>) {
  const thread = threads.get(chatId)
  if (!thread) return
  threads.set(
    chatId,
    thread.map((message) => (message.id === id && message.role === "assistant" ? { ...message, ...change(message) } : message))
  )
  emit()
  persist(chatId, !threads.get(chatId)?.some((message) => message.role === "assistant" && isActive(message.status)))
}

function later(id: string, ms: number, run: () => void) {
  window.clearTimeout(timers.get(id))
  timers.set(id, window.setTimeout(run, ms))
}

/* A reply, played: it thinks for a few seconds (one or two changes of the thinking line), then either
   streams its words — one to three at a time, about 25 a second, as tokens arrive — or, when Молли is
   asked for a picture, draws it first (the placeholder's dots, ~6 s), reveals it and then writes a line. */
function play(chatId: string, message: AssistantMessage, drawing: boolean) {
  const stream = () => {
    const tokens = tokenize(message.text)
    let shown = 0
    const tick = () => {
      for (let words = Math.ceil(Math.random() * 3); words > 0 && shown < tokens.length; shown++) {
        if (!/^\s+$/.test(tokens[shown])) words--
      }
      const done = shown >= tokens.length
      patch(chatId, message.id, () => ({ shown, status: done ? "done" : "streaming" }))
      if (!done) later(message.id, between(30, 80), tick)
    }
    tick()
  }

  if (!drawing) {
    later(message.id, between(2600, 4400), stream)
    return
  }
  const picture = PICTURES[Math.floor(Math.random() * PICTURES.length)]
  later(message.id, between(3000, 3600), () => {
    patch(chatId, message.id, () => ({ status: "drawing", image: { src: picture.src, ratio: picture.ratio, status: "drawing" } }))
    later(message.id, between(5500, 7000), () => {
      patch(chatId, message.id, (current) => ({ image: current.image && { ...current.image, status: "ready" } }))
      // The picture dissolves in over ~2.6 s (img-fx); the line under it starts as it settles.
      later(message.id, 2200, stream)
    })
  })
}

function makeReply(request: string, model: string): { message: AssistantMessage; drawing: boolean } {
  const id = newId()
  const text = pickReply()
  const artifact = replyDocument(request, text, id)
  const drawing = !artifact && isMolly(model) && wantsImage(request)
  const steps = drawing ? THINKING_STEPS.image : isMolly(model) ? THINKING_STEPS.molly : THINKING_STEPS.text
  return {
    drawing,
    message: { id, role: "assistant", model, request, status: "thinking", steps, text: drawing ? imageCaption() : artifact ? "Подготовила документ. Откройте его, чтобы прочитать рядом с чатом, скопировать текст или скачать файл." : text, shown: 0, artifacts: artifact ? [artifact] : undefined },
  }
}

/* The user's message and the model's reply to it. */
export function sendChatMessage(chatId: string, text: string, model: string, files: ComposerFile[] = []) {
  void hydrate(chatId).catch(storageError)
  const attachments = files.map(({ name, type, size, file, url }) => {
    const attachment = { id: clientId(), name, type, size }
    void keepChatFile(attachment.id, file).catch(storageError)
    URL.revokeObjectURL(url)
    return attachment
  })
  const user: UserMessage = { id: newId(), role: "user", text, attachments }
  const { message, drawing } = makeReply(text, model)
  threads.set(chatId, [...(threads.get(chatId) ?? NONE), user, message])
  emit()
  persist(chatId, true)
  play(chatId, message, drawing)
}

/* Stop: what has streamed stays (and copies as such), an unfinished picture goes. */
export function stopReply(chatId: string) {
  const reply = threads.get(chatId)?.findLast((message) => message.role === "assistant")
  if (reply?.role !== "assistant" || !isActive(reply.status)) return
  window.clearTimeout(timers.get(reply.id))
  timers.delete(reply.id)
  patch(chatId, reply.id, (current) => ({
    status: "stopped",
    text: tokenize(current.text).slice(0, current.shown).join(""),
    image: current.image?.status === "ready" ? current.image : undefined,
    artifacts: undefined,
  }))
}

/* A new reply in the old one's place, to the same request, by the same model. */
export function regenerateReply(chatId: string, id: string) {
  const thread = threads.get(chatId)
  const index = thread?.findIndex((message) => message.id === id) ?? -1
  const old = thread?.[index]
  const request = thread?.slice(0, index).findLast((message) => message.role === "user")
  if (!thread || old?.role !== "assistant" || !request) return
  window.clearTimeout(timers.get(id))
  timers.delete(id)
  const { message, drawing } = makeReply(request.text, old.model)
  threads.set(chatId, thread.with(index, message))
  emit()
  persist(chatId, true)
  play(chatId, message, drawing)
}

export function rateReply(chatId: string, id: string, rating: "up" | "down") {
  patch(chatId, id, (current) => ({ rating: current.rating === rating ? undefined : rating }))
}

export function useChatMessages(chatId: string) {
  React.useEffect(() => { void hydrate(chatId).catch(storageError) }, [chatId])
  return React.useSyncExternalStore(subscribe, () => threads.get(chatId) ?? NONE)
}

export function useChatLoadState(chatId: string) {
  return React.useSyncExternalStore(subscribe, () => loadStates.get(chatId) ?? "loading")
}

export function reloadChatMessages(chatId: string) {
  void hydrate(chatId).catch(storageError)
}

export function deleteChatMessages(chatId: string) {
  deleted.add(chatId)
  window.clearTimeout(saves.get(chatId))
  const messages = threads.get(chatId) ?? NONE
  for (const message of messages) { window.clearTimeout(timers.get(message.id)); timers.delete(message.id) }
  threads.delete(chatId)
  emit()
  void Promise.allSettled([loading.get(chatId), writes.get(chatId)]).then(() => removeChatThread(chatId, messages)).catch(storageError)
}
