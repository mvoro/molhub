import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { StepPicker } from "@/components/ui/step-picker"

const meta = {
  title: "Проект/StepPicker",
  component: StepPicker,
  parameters: {
    docs: {
      description: {
        component:
          "Уровень из нескольких ступеней (креативность и влияние стиля в студии музыки): ряд блоков — выбранный в primary, до него залиты, после — бледные; значение справа. Собран на `ToggleGroup` (single): радиогруппа, стрелки меняют уровень. По умолчанию подпись — проценты; `format` задаёт свою.",
      },
    },
  },
  args: { steps: 7, value: 3, onValueChange: () => {}, "aria-label": "Креативность" },
} satisfies Meta<typeof StepPicker>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({ initial, steps, label, format }: { initial: number; steps: number; label: string; format?: (step: number) => string }) {
  const [value, setValue] = React.useState(initial)
  return (
    <div className="w-[320px]">
      <StepPicker steps={steps} value={value} onValueChange={setValue} format={format} aria-label={label} />
    </div>
  )
}

export const Default: Story = {
  render: () => <Controlled initial={3} steps={7} label="Креативность" />,
}

export const Low: Story = {
  render: () => <Controlled initial={0} steps={7} label="Влияние стиля" />,
}

export const CustomLabels: Story = {
  name: "Свои подписи",
  render: () => <Controlled initial={1} steps={3} label="Темп" format={(step) => ["Медленно", "Средне", "Быстро"][step]} />,
}
