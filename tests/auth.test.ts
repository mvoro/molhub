import { test } from "node:test"
import assert from "node:assert/strict"
import { readAuthSession, validDemoCode, validEmail } from "../src/lib/auth.ts"

test("a fresh or malformed session stays a guest", () => {
  for (const value of [null, "", "1", "true", "{}", "null", "not-json", '{"provider":"unknown"}', '{"provider":"email"}', '{"provider":"email","email":"broken"}']) {
    assert.equal(readAuthSession(value), null)
  }
})

test("only the supported demo sign-in methods restore a session", () => {
  for (const provider of ["VK ID", "Яндекс", "Google"]) {
    assert.deepEqual(readAuthSession(JSON.stringify({ provider })), { provider })
  }
  assert.deepEqual(readAuthSession('{"provider":"email","email":" demo@example.com "}'), { provider: "email", email: "demo@example.com" })
})

test("email and code follow the reference demo flow, including its error branch", () => {
  assert.equal(validEmail(" demo@example.com "), true)
  for (const email of ["", "demo", "demo@", "demo@example", "de mo@example.com"]) assert.equal(validEmail(email), false)
  for (const code of ["1234", "12345", "123456"]) assert.equal(validDemoCode(code), true)
  for (const code of ["0000", "", "123", "1234567", "12a4", " 1234"]) assert.equal(validDemoCode(code), false)
})
