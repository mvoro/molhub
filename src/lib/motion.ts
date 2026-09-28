/* A control saying «no» (the user's ask, 27.09, done by emil-design-eng): it shakes its head. A damped
   spring, not an even zig-zag — every swing smaller than the last, 2.5 of them, settled by 320ms — so it
   reads as a reaction, not an alarm. Sampled into keyframes and played on the WAAPI (off the main
   thread), on `translate`, so it never fights the element's own `transform` or `scale` (its press, its
   entrance). Pressing again restarts it: each refusal gets its own shake. Reduced motion skips it; the
   error colour next to it carries the message alone. */
export function shake(element: Element | null) {
  if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  element.getAnimations().forEach((running) => running.id === SHAKE && running.cancel())
  const swing = element.animate(SHAKE_FRAMES, { duration: 320, easing: "linear" })
  swing.id = SHAKE
}

const SHAKE = "shake"
/* x(t) = 7px · e^(−3t) · sin(5πt): peaks of 5.2 → 2.9 → 1.6 → 0.9 → 0.5px, at rest at both ends. The
   curve carries the physics; `linear` only joins its 33 samples. */
const SHAKE_FRAMES = Array.from({ length: 33 }, (_, index) => {
  const t = index / 32
  return { translate: `${(7 * Math.exp(-3 * t) * Math.sin(5 * Math.PI * t)).toFixed(2)}px 0` }
})
