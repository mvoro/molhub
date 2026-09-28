/* How the user last acted: keys or a pointer (mouse, pen, touch). Tracked in the capture phase, so
   it is already known when a handler for the same event runs (⌘K, Esc, a menu closing on a pick).
   Keyboard-opened modals skip their animation by it (app-sheet); menus closed by a pointer give
   focus back to their button without lighting its ring (app-menu). */
let last: "keyboard" | "pointer" = "pointer"
if (typeof window !== "undefined") {
  window.addEventListener("keydown", () => (last = "keyboard"), true)
  window.addEventListener("pointerdown", () => (last = "pointer"), true)
}

export const lastInput = () => last
