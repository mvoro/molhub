export type AuthVariant = "models" | "nano"
export type AuthSession = { provider: "email" | "VK ID" | "Яндекс" | "Google"; email?: string }

export const AUTH_STORAGE_KEY = "ai-hub:demo-auth-v1"
export const validEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim())
// Same demo contract as ideas-scroll-demo.html. This does not authenticate with a server.
export const validDemoCode = (value: string) => /^\d{4,6}$/.test(value) && value !== "0000"

export function readAuthSession(raw: string | null): AuthSession | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null")
    if (!value || typeof value !== "object" || !("provider" in value)) return null
    if (value.provider === "email") {
      return "email" in value && typeof value.email === "string" && validEmail(value.email)
        ? { provider: "email", email: value.email.trim() } : null
    }
    return value.provider === "VK ID" || value.provider === "Яндекс" || value.provider === "Google"
      ? { provider: value.provider } : null
  } catch { return null }
}
