import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon, Search01Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Tooltip",
  component: TooltipContent,
  parameters: {
    docs: {
      description: {
        component:
          "Тултип всегда тёмно-серый (токен `--tooltip`) в обеих темах. Подсказки — короткие, без точки в конце; хоткей — через `Kbd`. На тач-устройствах тултипы прячут (`hidden={isMobile}`).",
      },
    },
  },
  args: { side: "bottom" },
  argTypes: { side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] } },
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Поиск чатов">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
        </Button>
      </TooltipTrigger>
      <TooltipContent {...args}>Поиск чатов</TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof TooltipContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHotkey: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-20 py-6">
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Новый чат">
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
          </Button>
        </TooltipTrigger>
        <TooltipContent {...args}>
          Новый чат
          <KbdGroup>
            <Kbd>⇧</Kbd>
            <Kbd>⌘</Kbd>
            <Kbd>O</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Свернуть боковую панель">
            <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={ICON_STROKE} />
          </Button>
        </TooltipTrigger>
        <TooltipContent {...args}>
          Свернуть боковую панель
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>B</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}
