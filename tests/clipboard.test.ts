import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"

const source = ts.transpileModule(readFileSync(new URL("../src/lib/clipboard.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function setup({ modern = false, rejected = false, legacy = true, modal = false } = {}) {
  let copied: string | undefined
  let input: Field | undefined
  const successes: string[] = []
  const root = { append: (field: Field) => { input = field; field.container = root } }
  const dialog = { append: (field: Field) => { input = field; field.container = dialog } }
  class Field {
    value = ""
    style = { cssText: "" }
    readOnly = false
    tabIndex = 0
    isConnected = true
    isSelected = false
    container: object | null = null
    closest() { return modal ? dialog : null }
    focus() { document.activeElement = this }
    select() { this.isSelected = true }
    setSelectionRange() { this.isSelected = true }
    remove() { this.isConnected = false; input = undefined }
  }
  const opener = new Field()
  const range = { cloneRange: () => range }
  const selection = { rangeCount: 1, getRangeAt: () => range, removeAllRanges: () => {}, addRange: () => {} }
  const document = {
    activeElement: opener,
    body: root,
    createElement: () => new Field(),
    execCommand: (command: string) => {
      assert.equal(command, "copy")
      if (!legacy) return false
      assert.equal(document.activeElement, input)
      assert.equal(input?.isSelected, true)
      assert.equal(input?.container, modal ? dialog : root)
      copied = input?.value
      return true
    },
  }
  const api = {} as { copyText: (text: string, successMessage?: string) => Promise<void> }
  runInNewContext(source, {
    exports: api, document, HTMLElement: Field,
    require: (name: string) => {
      assert.equal(name, "sonner")
      return { toast: { success: (message: string) => {
        assert.notEqual(copied, undefined, "success must follow the clipboard write")
        successes.push(message)
      } } }
    },
    window: { getSelection: () => selection },
    navigator: { clipboard: modern ? { writeText: async (text: string) => {
      if (rejected) throw new Error("NotAllowedError")
      copied = text
    } } : undefined },
  })
  return { ...api, successes, copied: () => copied, field: () => input, focused: () => document.activeElement, opener }
}

test("copy works over HTTP when Clipboard API is unavailable", async () => {
  const env = setup()
  const value = "План запуска\n\n1. Проверить бриф\n2. Подготовить меню"
  await env.copyText(value)
  assert.equal(env.copied(), value)
  assert.equal(env.field(), undefined)
  assert.equal(env.focused(), env.opener)
  assert.deepEqual(env.successes, ["Скопировано"])
})

test("permission rejection falls back while copying inside a modal", async () => {
  const env = setup({ modern: true, rejected: true, modal: true })
  await env.copyText("Текст документа", "Текст документа скопирован")
  assert.equal(env.copied(), "Текст документа")
  assert.equal(env.field(), undefined)
  assert.equal(env.focused(), env.opener)
  assert.deepEqual(env.successes, ["Текст документа скопирован"])
})

test("successful Clipboard API copy preserves exact text", async () => {
  const env = setup({ modern: true })
  await env.copyText("  строка\nещё строка  ")
  assert.equal(env.copied(), "  строка\nещё строка  ")
  assert.equal(env.field(), undefined)
  assert.deepEqual(env.successes, ["Скопировано"])
})

test("failed fallback reports failure and restores the page", async () => {
  const env = setup({ legacy: false })
  await assert.rejects(env.copyText("Текст"), /Copy failed/)
  assert.equal(env.copied(), undefined)
  assert.equal(env.field(), undefined)
  assert.equal(env.focused(), env.opener)
  assert.deepEqual(env.successes, [])
})
