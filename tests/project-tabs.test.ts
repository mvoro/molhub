import { test } from "node:test"
import assert from "node:assert/strict"
import { initialTab, recallTab, rememberTab, searchForTab, tabFromSearch } from "../src/lib/project-tabs.ts"

test("вкладка из адреса", () => {
  assert.equal(tabFromSearch("?tab=media"), "media")
  assert.equal(tabFromSearch("?tab=files&x=1"), "files")
  assert.equal(tabFromSearch("?tab=chats"), "chats")
  assert.equal(tabFromSearch("?tab=bogus"), null)
  assert.equal(tabFromSearch(""), null)
})
test("адрес для вкладки: у «Чатов» параметра нет", () => {
  assert.equal(searchForTab("chats"), "")
  assert.equal(searchForTab("media"), "?tab=media")
})
test("память вкладки на проект", () => {
  assert.equal(recallTab("p1"), "chats")
  rememberTab("p1", "files")
  assert.equal(recallTab("p1"), "files")
  assert.equal(initialTab("p1", ""), "files")
  assert.equal(initialTab("p1", "?tab=media"), "media")
})

test("вкладка из адреса — только если адрес этого проекта", () => {
  rememberTab("p2", "media")
  // Opening project p3 while the address still belongs to p1 (?tab=files): p3 starts on its own memory.
  assert.equal(initialTab("p3", "?tab=files", "/project/p1"), "chats")
  assert.equal(initialTab("p2", "?tab=files", "/project/p1"), "media")
  // A direct load or «Назад» to p2's own address keeps the address's tab.
  assert.equal(initialTab("p2", "?tab=files", "/project/p2"), "files")
  // Ids are encoded in the address.
  assert.equal(initialTab("пр 1", "?tab=files", "/project/%D0%BF%D1%80%201"), "files")
})
