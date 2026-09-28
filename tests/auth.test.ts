import { test } from "node:test"
import assert from "node:assert/strict"
import { authAccountName, demoSocialSession, readAuthSession, validDemoCode, validEmail } from "../src/lib/auth.ts"

test("a fresh or malformed session stays a guest", () => {
  for (const value of [null, "", "1", "true", "{}", "null", "not-json", '{"provider":"unknown"}', '{"provider":"email"}', '{"provider":"email","email":"broken"}']) {
    assert.equal(readAuthSession(value), null)
  }
})

test("only the supported demo sign-in methods restore a session", () => {
  for (const provider of ["VK ID", "Яндекс", "Google"] as const) {
    assert.deepEqual(readAuthSession(JSON.stringify({ provider })), demoSocialSession(provider))
  }
  assert.deepEqual(readAuthSession('{"provider":"email","email":" demo@example.com "}'), { provider: "email", email: "demo@example.com" })
})

test("account identities survive reload and are used instead of a generic account name", () => {
  const google = readAuthSession('{"provider":"Google","email":" person@gmail.com "}')!
  const yandex = readAuthSession('{"provider":"Яндекс","accountId":" example.id "}')!
  assert.equal(authAccountName(google), "person@gmail.com")
  assert.equal(authAccountName(yandex), "Яндекс ID: example.id")
  assert.equal(authAccountName(readAuthSession('{"provider":"email","email":"person@example.com"}')!), "person@example.com")
  assert.equal(authAccountName(readAuthSession('{"provider":"Google"}')!), "demo@gmail.com")
})

test("email and code follow the reference demo flow, including its error branch", () => {
  assert.equal(validEmail(" demo@example.com "), true)
  for (const email of ["", "demo", "demo@", "demo@example", "de mo@example.com"]) assert.equal(validEmail(email), false)
  for (const code of ["1234", "12345", "123456"]) assert.equal(validDemoCode(code), true)
  for (const code of ["0000", "", "123", "1234567", "12a4", " 1234"]) assert.equal(validDemoCode(code), false)
})
