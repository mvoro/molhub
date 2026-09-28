import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Attachment01Icon, Mic01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          "Тонкая разделительная линия (`bg-border`). Горизонтальная — между пунктами списка (пример в `ScrollArea`/списке чатов), вертикальная — между иконками в одном ряду тулбара, например в панели композера.",
      },
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3 text-sm">
      <p>Логотип для кофейни в стиле минимализм</p>
      <Separator />
      <p>Промо-ролик для запуска приложения</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Прикрепить файл">
        <HugeiconsIcon icon={Attachment01Icon} strokeWidth={ICON_STROKE} />
      </Button>
      <Separator orientation="vertical" />
      <Button variant="ghost" size="icon" aria-label="Голосовой ввод">
        <HugeiconsIcon icon={Mic01Icon} strokeWidth={ICON_STROKE} />
      </Button>
      <Separator orientation="vertical" />
      <Button variant="ghost" size="icon" aria-label="Новый чат">
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
      </Button>
    </div>
  ),
}
