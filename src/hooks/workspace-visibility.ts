import { createContext } from "react"

// Drafts stay mounted while the user browses roles. Hidden workspaces pause dictation and
// file drops, and let completed background generations show their notifications.
export const WorkspaceVisibilityContext = createContext(true)
