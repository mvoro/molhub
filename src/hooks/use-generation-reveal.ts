import * as React from "react"

/* Whether a result is still coming in: from the start while it's being made — or, with `fresh`, one
   that landed while its card wasn't on screen — until the effect reports the picture visible. Reduced
   motion or a failed effect end it as soon as the result is ready (the card, then the picture fading
   in); without WebGL, in a background tab or when the effect never reports, a 12 s watchdog does. */
export function useGenerationReveal(ready: boolean, fresh = false) {
  const reduced = useReducedMotion()
  const [revealing, setRevealing] = React.useState(!ready || fresh)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    if (!ready || !revealing) return
    const timer = window.setTimeout(() => setRevealing(false), reduced || failed ? 0 : 12000)
    return () => window.clearTimeout(timer)
  }, [ready, revealing, reduced, failed])

  return {
    revealing,
    /* The effect is over the card. */
    effect: revealing && !reduced && !failed,
    onRevealed: React.useCallback(() => setRevealing(false), []),
    onFailed: React.useCallback(() => setFailed(true), []),
  }
}

const subscribeReduced = (change: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", change)
  return () => query.removeEventListener("change", change)
}
function useReducedMotion() {
  return React.useSyncExternalStore(subscribeReduced, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
}
