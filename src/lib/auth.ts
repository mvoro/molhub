export type AuthVariant = "models" | "nano"
export type AuthSession = { provider: "email" | "VK ID" | "Яндекс" | "Google"; email?: string; accountId?: string }

// Prototype identities only; real OAuth will supply the provider's email / account ID.
export function demoSocialSession(provider: Exclude<AuthSession["provider"], "email">): AuthSession {
  return provider === "Google" ? { provider, email: "demo@gmail.com" } : { provider, accountId: "demo" }
}

export function authAccountName(session: AuthSession): string {
  if (session.email) return session.email
  const provider = session.provider === "Яндекс" ? "Яндекс ID" : session.provider
  return session.accountId ? `${provider}: ${session.accountId}` : provider
}

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
    if (value.provider !== "VK ID" && value.provider !== "Яндекс" && value.provider !== "Google") return null
    const email = "email" in value && typeof value.email === "string" && validEmail(value.email) ? value.email.trim() : undefined
    const accountId = "accountId" in value && typeof value.accountId === "string" ? value.accountId.trim() : undefined
    // Preserve supplied identities, and upgrade older demo sessions that only stored the provider.
    return email || accountId
      ? { provider: value.provider, ...(email && { email }), ...(accountId && { accountId }) }
      : demoSocialSession(value.provider)
  } catch { return null }
}
