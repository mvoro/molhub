"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

/* The app's theme is the `.dark` class on <html> (no next-themes provider), so toasts follow it
   rather than the OS setting. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

const isDark = () => document.documentElement.classList.contains("dark")

const Toaster = ({ ...props }: ToasterProps) => {
  const dark = React.useSyncExternalStore(subscribeToTheme, isDark, () => false)
  const dismissCard = (target: HTMLElement) => {
    if (target.closest("button, a, input, textarea, [role=button]")) return
    target.closest("[data-sonner-toast]")?.querySelector<HTMLButtonElement>("[data-close-button]")?.click()
  }

  // The mobile sidebar translates its workspace. Fixed toasts must stay outside that transform.
  return createPortal(
    <div className="contents" onClick={(event) => dismissCard(event.target as HTMLElement)} onKeyDown={(event) => {
      if ((event.key === "Enter" || event.key === " ") && (event.target as HTMLElement).matches("[data-sonner-toast]")) {
        event.preventDefault()
        dismissCard(event.target as HTMLElement)
      }
    }}>
    <Sonner
      theme={dark ? "dark" : "light"}
      className="toaster group"
      closeButton
      containerAriaLabel="Уведомления"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2.25} className="size-4" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2.25} className="size-4" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2.25} className="size-4" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2.25} className="size-4" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2.25} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast cursor-pointer rounded-[16px]! border-0! shadow-[0_12px_40px_-8px_rgb(0_0_0/0.14),0_2px_6px_rgb(0_0_0/0.04)]! ring-1 ring-foreground/6",
          closeButton: "hidden!",
          actionButton: "h-8! rounded-full! px-3!",
        },
      }}
      {...props}
    />
    </div>,
    document.body
  )
}

export { Toaster }
