import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiWatermarkIcon, SparklesIcon } from "@hugeicons/core-free-icons"

import { Toggle } from "@/components/ui/toggle"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          "Кнопка-переключатель с двумя состояниями (нажата/не нажата) на базе Radix `Toggle`. Для группы взаимоисключающих или множественных переключателей используйте `ToggleGroup`.",
      },
    },
  },
  args: { children: "Улучшить запрос" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outline"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pressed: Story = {
  args: { defaultPressed: true },
}

export const Outline: Story = {
  args: { variant: "outline" },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm">Быстро</Toggle>
      <Toggle size="default">Быстро</Toggle>
      <Toggle size="lg">Быстро</Toggle>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Улучшить запрос" defaultPressed>
        <HugeiconsIcon icon={SparklesIcon} strokeWidth={ICON_STROKE} />
        Улучшить запрос
      </Toggle>
      <Toggle aria-label="Без водяного знака" variant="outline">
        <HugeiconsIcon icon={AiWatermarkIcon} strokeWidth={ICON_STROKE} />
      </Toggle>
    </div>
  ),
}
