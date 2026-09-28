import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"

import type { ChatMessage } from "../src/hooks/use-chat-messages.ts"
import { clientId } from "../src/lib/client-id.ts"
import { demoChatMessages } from "../src/data/demo-chats.ts"

// Run the actual message store in isolation. Only its browser clock and external services
// are replaced; this exercises its hydration, streaming and deletion scheduling together.
const source = ts.transpileModule(
  readFileSync(new URL("../src/hooks/use-chat-messages.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function setup(overrides: {
  read?: () => Promise<ChatMessage[] | undefined>
  save?: () => Promise<void>
} = {}) {
  let now = 0
  let timerId = 0
  let seed = 1
  const timers = new Map<number, { at: number; run: () => void }>()
  const snapshots: { at: number; messages: ChatMessage[] }[] = []
  const events: string[] = []
  const math = Object.create(Math)
  math.random = () => ((seed = (seed * 48271) % 2147483647) / 2147483647)
  const modules: Record<string, unknown> = {
    react: { useEffect: () => {}, useSyncExternalStore: (_subscribe: unknown, get: () => ChatMessage[]) => get() },
    sonner: { toast: { error: () => events.push("storage-error") } },
    "@/data/demo-replies": {
      THINKING_STEPS: { text: [], molly: [], image: [] },
      pickReply: () => Array(1000).fill("word").join(" "),
      wantsImage: () => false,
    },
    "@/data/models": { isMolly: () => false },
    "@/lib/client-id": { clientId },
    "@/data/demo-chats": { demoChatMessages },
    "@/hooks/use-media-feed": { PICTURES: [] },
    "@/lib/chat-attachments": { replyDocument: () => undefined },
    "@/lib/chat-storage": {
      readChatThread: overrides.read ?? (async () => undefined),
      saveChatThread: async (_chatId: string, messages: ChatMessage[]) => {
        events.push("write-started")
        snapshots.push({ at: now, messages: structuredClone(messages) })
        await overrides.save?.()
        events.push("write-finished")
      },
      keepChatFile: async () => { events.push("blob-retained") },
      removeChatThread: async () => { events.push("removed") },
    },
  }
  const api = {} as typeof import("../src/hooks/use-chat-messages.ts")
  runInNewContext(source, {
    exports: api, Date, Math: math, crypto,
    URL: { revokeObjectURL: () => events.push("preview-revoked") },
    window: {
      setTimeout: (run: () => void, delay: number) => {
        timers.set(++timerId, { at: now + delay, run })
        return timerId
      },
      clearTimeout: (id: number) => timers.delete(id),
    },
    require: (name: string) => {
      assert.ok(name in modules, `Unexpected dependency: ${name}`)
      return modules[name]
    },
  })
  const flush = async () => { for (let turn = 0; turn < 16; turn++) await Promise.resolve() }
  const advance = async (until: number) => {
    await flush()
    while (true) {
      const next = [...timers].sort((left, right) => left[1].at - right[1].at)[0]
      if (!next || next[1].at > until) break
      now = next[1].at
      timers.delete(next[0])
      next[1].run()
      await flush()
    }
    now = until
    await flush()
  }
  return { api, snapshots, events, advance, flush }
}

const previous: ChatMessage = { id: "old-message", role: "user", text: "Previous message" }

test("empty demo history loads review files while saved conversations take precedence", async () => {
  const empty = setup()
  empty.api.reloadChatMessages("demo-files")
  await empty.flush()
  const seeded = empty.api.useChatMessages("demo-files")
  assert.equal(seeded.length, 2)
  assert.equal(seeded[0].role === "user" && seeded[0].attachments?.length, 2)
  assert.equal(seeded[1].role === "assistant" && seeded[1].artifacts?.[0].name, "План запуска.md")
  const saved = setup({ read: async () => [previous] })
  saved.api.reloadChatMessages("demo-files")
  await saved.flush()
  assert.deepEqual(structuredClone(saved.api.useChatMessages("demo-files")), [previous])
})

test("sending before hydration preserves previous and new messages", async () => {
  const read = deferred<ChatMessage[]>()
  const app = setup({ read: () => read.promise })
  app.api.sendChatMessage("chat", "New message", "model")
  await app.advance(0)
  assert.equal(app.snapshots.length, 0)
  read.resolve([previous])
  await app.flush()
  assert.deepEqual(app.snapshots[0].messages.filter(item => item.role === "user").map(item => item.text), ["Previous message", "New message"])
})

test("failed hydration cannot overwrite history and can be retried", async () => {
  let unavailable = true
  const app = setup({ read: async () => {
    if (unavailable) throw new Error("IndexedDB read failed")
    return [previous]
  } })
  app.api.sendChatMessage("chat", "New message", "model")
  await app.advance(0)
  assert.equal(app.snapshots.length, 0)
  assert.ok(app.events.includes("storage-error"))
  unavailable = false
  // The next persistence checkpoint retries the read before it can write anything.
  app.api.stopReply("chat")
  await app.advance(0)
  assert.deepEqual(app.snapshots[0].messages.filter(item => item.role === "user").map(item => item.text), ["Previous message", "New message"])
})

test("a continuously streaming response writes checkpoints before completion", async () => {
  const app = setup()
  app.api.sendChatMessage("chat", "Request", "model")
  await app.advance(7000)
  const current = app.api.useChatMessages("chat").at(-1)
  assert.equal(current?.role === "assistant" && current.status, "streaming")
  const checkpoints = app.snapshots.filter(({ messages }) => {
    const last = messages.at(-1)
    return last?.role === "assistant" && last.status === "streaming" && last.shown > 0
  })
  assert.ok(checkpoints.length >= 3, "Continuous tokens must not postpone every save until completion")
  for (let index = 1; index < checkpoints.length; index++) {
    assert.ok(checkpoints[index].at - checkpoints[index - 1].at <= 600)
  }
})

test("deletion waits for an in-flight save and does not resurrect the thread", async () => {
  const write = deferred<void>()
  const app = setup({ save: () => write.promise })
  app.api.sendChatMessage("chat", "Request", "model")
  await app.advance(0)
  app.api.deleteChatMessages("chat")
  await app.flush()
  assert.deepEqual(app.events, ["write-started"])
  write.resolve()
  await app.flush()
  assert.deepEqual(app.events, ["write-started", "write-finished", "removed"])
  await app.advance(10000)
  assert.equal(app.snapshots.length, 1)
  assert.equal(app.api.useChatMessages("chat").length, 0)
})

test("sent attachment previews are released after their blobs are retained", async () => {
  const app = setup()
  const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" })
  app.api.sendChatMessage("chat", "Describe", "model", [{
    id: "draft-photo", name: file.name, type: file.type, size: file.size, file, url: "blob:draft-photo",
  }])
  assert.deepEqual(app.events.slice(0, 2), ["blob-retained", "preview-revoked"])
  await app.advance(0)
  const saved = app.snapshots[0].messages[0]
  assert.equal(saved.role === "user" && saved.attachments?.[0].name, "photo.jpg")
})
