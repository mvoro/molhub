import { test } from "node:test"
import assert from "node:assert/strict"
import { fileAddMessages, filesWord, formatFileSize, MAX_PROJECT_FILE_SIZE, planFileAdds } from "../src/lib/project-file-limits.ts"

const f = (name: string, size = 10) => ({ name, size })
test("ровно 25 МБ проходит, на байт больше — нет", () => {
  const plan = planFileAdds(0, [f("a.pdf", MAX_PROJECT_FILE_SIZE), f("b.pdf", MAX_PROJECT_FILE_SIZE + 1)])
  assert.deepEqual(plan.accepted.map((x) => x.name), ["a.pdf"])
  assert.deepEqual(plan.tooBig.map((x) => x.name), ["b.pdf"])
})
test("пустой файл проходит", () => assert.equal(planFileAdds(0, [f("empty.txt", 0)]).accepted.length, 1))
test("18 в проекте + 5 новых = 2 добавлено, 3 не влезло", () => {
  const plan = planFileAdds(18, [f("1"), f("2"), f("3"), f("4"), f("5")])
  assert.equal(plan.accepted.length, 2)
  assert.equal(plan.overflow.length, 3)
  assert.deepEqual(fileAddMessages(plan), [
    "Добавлено 2 файла из 5: в проекте может быть до 20 файлов. Удалите ненужные, чтобы добавить остальные.",
  ])
})
test("21-й файл — лимит", () => {
  const plan = planFileAdds(20, [f("x")])
  assert.deepEqual(fileAddMessages(plan), ["В проекте уже 20 файлов. Удалите ненужные, чтобы добавить новые."])
})
test("1 из 3 — «Добавлен 1 файл»", () => {
  assert.deepEqual(fileAddMessages(planFileAdds(19, [f("1"), f("2"), f("3")])), [
    "Добавлен 1 файл из 3: в проекте может быть до 20 файлов. Удалите ненужные, чтобы добавить остальные.",
  ])
})
test("большой файл — своя ошибка с «что делать»", () => {
  assert.deepEqual(fileAddMessages(planFileAdds(0, [f("Бриф.pdf", MAX_PROJECT_FILE_SIZE + 1)])), [
    "Не удалось добавить «Бриф.pdf»: файл больше 25 МБ. Сожмите его или разделите на части.",
  ])
})
test("всё влезло — сообщений нет", () => assert.deepEqual(fileAddMessages(planFileAdds(0, [f("a"), f("b")])), []))
test("склонение и размер", () => {
  assert.equal(filesWord(1), "файл")
  assert.equal(filesWord(3), "файла")
  assert.equal(filesWord(11), "файлов")
  assert.equal(filesWord(21), "файл")
  assert.equal(formatFileSize(900), "900 Б")
  assert.equal(formatFileSize(84 * 1024), "84 КБ")
  assert.equal(formatFileSize(1.2 * 1024 * 1024), "1,2 МБ")
})
