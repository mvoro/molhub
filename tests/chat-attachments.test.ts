import { test } from "node:test"
import assert from "node:assert/strict"
import { attachmentKind, attachmentMimeType, replyDocument } from "../src/lib/chat-attachments.ts"

test("iPhone library and camera files recover missing MIME from their extension", () => {
  assert.equal(attachmentMimeType({ name: "IMG_0130.HEIC", type: "" }), "image/heic")
  assert.equal(attachmentMimeType({ name: "IMG_0130.HEIF", type: "application/octet-stream" }), "image/heif")
  assert.equal(attachmentMimeType({ name: "Фото.JPG", type: "" }), "image/jpeg")
  assert.equal(attachmentMimeType({ name: "Фото.HEIC", type: "image/jpeg" }), "image/jpeg")
  assert.equal(attachmentMimeType({ name: "Бриф.pdf", type: "application/pdf" }), "application/pdf")
})

test("camera and audio attachments without MIME retain their preview kind", () => {
  for (const [name, expected] of [["Фото.JPG", "image"], ["Клип.MOV", "video"], ["Голос.M4A", "audio"]]) {
    assert.equal(attachmentKind({ name, type: "" }), expected)
  }
})

test("document formats are identified without treating HTML as executable preview", () => {
  assert.equal(attachmentKind({ name: "Бриф.DOCX", type: "" }), "docx")
  assert.equal(attachmentKind({ name: "План.PDF", type: "application/octet-stream" }), "pdf")
  assert.equal(attachmentKind({ name: "notes.md", type: "text/plain" }), "markdown")
  assert.equal(attachmentKind({ name: "page.html", type: "text/html" }), "text")
  assert.equal(attachmentKind({ name: "bundle.zip", type: "application/zip" }), "file")
})

test("ordinary chat replies do not create unsolicited documents", () => {
  assert.equal(replyDocument("Привет, как дела?", "Всё хорошо", "m1"), undefined)
})

test("demo document is a real named Markdown file with a correct UTF-8 size", () => {
  const artifact = replyDocument('Создай PDF: "План/проекта"', "Привет, мир — описание", "m2")!
  assert.ok(artifact)
  assert.equal(artifact.type, "text/markdown")
  assert.ok(artifact.name.endsWith(".md"))
  assert.doesNotMatch(artifact.name, /[\\/:*?"<>|\n]/)
  assert.match(artifact.content!, /Привет, мир — описание/)
  assert.equal(artifact.size, new TextEncoder().encode(artifact.content).length)
})
