import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "@/hooks/use-theme"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

function subscribeSystemTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

export function ThemeToggle({ className, tabIndex }: { className?: string; tabIndex?: number }) {
  const [theme, setTheme] = useTheme()
  const systemDark = React.useSyncExternalStore(subscribeSystemTheme, () => window.matchMedia("(prefers-color-scheme: dark)").matches, () => false)
  const dark = theme === "dark" || (theme === "system" && systemDark)
  const label = dark ? "Включить светлую тему" : "Включить тёмную тему"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-lg" tabIndex={tabIndex} aria-label={label}
          onClick={() => setTheme(dark ? "light" : "dark")}
          className={cn("size-9 rounded-[10px] active:translate-y-0 active:scale-[0.96]", className)}>
          <HugeiconsIcon icon={dark ? Sun03Icon : Moon02Icon} strokeWidth={ICON_STROKE} className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
