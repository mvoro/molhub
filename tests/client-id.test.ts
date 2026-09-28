import test from "node:test"
import assert from "node:assert/strict"
import { clientId } from "../src/lib/client-id.ts"

test("files and simultaneous batch results get unique IDs without secure-context crypto", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "crypto")
  try {
    Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true })
    const ids = Array.from({ length: 100 }, clientId)
    assert.equal(new Set(ids).size, ids.length)
    assert.ok(ids.every(Boolean))
  } finally {
    if (original) Object.defineProperty(globalThis, "crypto", original)
  }
})
