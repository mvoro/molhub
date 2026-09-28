import { test } from "node:test"
import assert from "node:assert/strict"
import { migrateMusicProjects } from "../src/lib/music-migration.ts"

const p = (id: string, name = id) => ({ id, name, createdAt: 1, updatedAt: 1 })
const s = (id: string, projectId: string | undefined, title: string) => ({ id, projectId, title })

test("проект с разными запросами переносится", () => {
  const { keep, songs } = migrateMusicProjects([p("mp1", "Альбом")], [s("1", "mp1", "А"), s("2", "mp1", "Б")], [])
  assert.deepEqual(keep.map((x) => x.id), ["mp1"])
  assert.deepEqual(songs.map((x) => x.projectId), ["mp1", "mp1"])
})
test("авто-проект одной песни не переносится, песни — без проекта", () => {
  const { keep, songs } = migrateMusicProjects([p("mp2", "Ночь")], [s("1", "mp2", "Ночь"), s("2", "mp2", "Ночь")], [])
  assert.deepEqual(keep, [])
  assert.deepEqual(songs.map((x) => x.projectId), [undefined, undefined])
})
test("демо: «Кофе у моря» → coffee, остальное без проекта", () => {
  const { keep, songs } = migrateMusicProjects(
    [p("demo", "Демо")],
    [s("1", "demo", "Кофе у моря"), s("2", "demo", "Ночной трамвай")],
    ["coffee"]
  )
  assert.deepEqual(keep, [])
  assert.deepEqual(songs.map((x) => x.projectId), ["coffee", undefined])
})
test("демо без проекта coffee — всё без проекта", () => {
  const { songs } = migrateMusicProjects([p("demo")], [s("1", "demo", "Кофе у моря")], [])
  assert.equal(songs[0].projectId, undefined)
})
test("id уже есть в хабе — не дублируется, песни остаются", () => {
  const { keep, songs } = migrateMusicProjects([p("coffee")], [s("1", "coffee", "А"), s("2", "coffee", "Б")], ["coffee"])
  assert.deepEqual(keep, [])
  assert.deepEqual(songs.map((x) => x.projectId), ["coffee", "coffee"])
})
test("песня с исчезнувшим проектом — без проекта", () => {
  const { songs } = migrateMusicProjects([], [s("1", "ghost", "А")], ["coffee"])
  assert.equal(songs[0].projectId, undefined)
})
