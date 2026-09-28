import { test } from "node:test"
import assert from "node:assert/strict"
import { withBasePath, withoutBasePath } from "../src/lib/base-path.ts"
import { activeFromPath, pathFromActive } from "../src/lib/routes.ts"
import { initialTab } from "../src/lib/project-tabs.ts"

const entities = {
  isChat: (id: string) => id === "чат 1",
  isProject: (id: string) => id === "проект 1",
}

test("assets resolve under Pages without changing external or already based URLs", () => {
  assert.equal(withBasePath("/brand/molecula-mark.svg", "/molhub/"), "/molhub/brand/molecula-mark.svg")
  assert.equal(withBasePath("/molhub/brand/molecula-mark.svg", "/molhub/"), "/molhub/brand/molecula-mark.svg")
  assert.equal(withBasePath("/models/molly.svg", "/"), "/models/molly.svg")
  for (const url of ["https://example.com/photo.jpg", "//example.com/photo.jpg", "blob:local", "data:image/png;base64,abc"]) {
    assert.equal(withBasePath(url, "/molhub/"), url)
  }
  assert.equal(withoutBasePath("/molhub/", "/molhub/"), "/")
  assert.equal(withoutBasePath("/molhub", "/molhub/"), "/")
  assert.equal(withoutBasePath("/molhub-other/photo", "/molhub/"), "/molhub-other/photo")
})

test("tools, sections, chats and projects round trip locally and on Pages", () => {
  for (const base of ["/", "/molhub/"]) {
    for (const active of ["new:text", "new:image", "new:video", "new:audio", "projects", "roles", "чат 1", "проект 1"]) {
      const pathname = pathFromActive(active, entities, base)
      assert.ok(pathname?.startsWith(base))
      assert.equal(activeFromPath(pathname, base), active)
    }
    assert.equal(pathFromActive("deleted", entities, base), null)
    assert.equal(activeFromPath(`${base}unknown`, base), "new:text")
  }
})

test("direct Pages project links retain their selected tab", () => {
  const path = pathFromActive("проект 1", entities, "/molhub/")!
  assert.equal(initialTab("проект 1", "?tab=files", path, "/molhub/"), "files")
  assert.equal(initialTab("another-project", "?tab=files", path, "/molhub/"), "chats")
})
