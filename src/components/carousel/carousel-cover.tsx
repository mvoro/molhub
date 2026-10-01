import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import type { CarouselTemplate } from "@/lib/carousel/model"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

type CarouselCoverProps = {
  template: CarouselTemplate
  title?: string
  count?: number
  format?: string
  className?: string
}

/** The palette belongs to the slide artwork, independently of the app theme. */
export function CarouselCover({ template, title, count = 5, format = "4:5", className }: CarouselCoverProps) {
  const serif = template.font === "Georgia"
  const aspectRatio = ["1:1", "4:5", "9:16"].includes(format) ? format.replace(":", " / ") : "4 / 5"

  return (
    <span
      aria-hidden="true"
      className={cn("relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl p-[9%] text-left [container-type:inline-size]", className)}
      style={{ backgroundColor: template.background, color: template.ink, aspectRatio }}
    >
      {template.image && (
        <img
          src={template.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 size-full object-cover"
          style={template.id === "botanical" ? { filter: "brightness(0.83)" } : undefined}
        />
      )}
      <span
        className="block border-b border-current/20 pb-[8%] font-semibold tracking-[0.04em]"
        style={{ fontSize: "3.4cqw", lineHeight: 1.4 }}
      >
        {template.eyebrow}
      </span>
      <strong
        className="mt-[17%] min-h-0 max-h-[53%] line-clamp-5 break-words whitespace-pre-line"
        style={{
          fontFamily: serif ? "Georgia, serif" : "var(--font-sans)",
          fontSize: serif ? "12.5cqw" : "11cqw",
          fontWeight: serif ? 400 : 700,
          letterSpacing: serif ? "-0.04em" : "-0.05em",
          lineHeight: 1.05,
        }}
      >
        {title || template.title}
      </strong>
      <span className="mt-auto flex items-center justify-between pt-[8%] font-medium" style={{ fontSize: "3.5cqw" }}>
        <span>01 / {String(count).padStart(2, "0")}</span>
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} style={{ width: "5cqw", height: "5cqw" }} />
      </span>
    </span>
  )
}
