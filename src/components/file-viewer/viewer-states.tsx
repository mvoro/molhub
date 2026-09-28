import { HugeiconsIcon } from "@hugeicons/react"
import { FileNotFoundIcon } from "@hugeicons/core-free-icons"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { ICON_STROKE } from "@/lib/icons"

/* While a document is being read: a spinner and a word, centred in the viewer. */
export function ViewerLoading() {
  return (
    <div className="flex h-full min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Открываем файл…
    </div>
  )
}

/* The file could not be shown: what happened and what to do instead. */
export function ViewerMessage({
  title = "Не удалось открыть файл",
  description = "Возможно, он повреждён или защищён паролем. Откройте его на своём устройстве.",
}: {
  title?: string
  description?: string
}) {
  return (
    <Empty className="h-full min-h-60">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={FileNotFoundIcon} strokeWidth={ICON_STROKE} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
