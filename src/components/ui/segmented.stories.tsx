import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Segmented, SegmentedItem } from "@/components/ui/segmented"

const meta = {
  title: "Проект/Segmented",
  component: Segmented,
  parameters: {
    docs: {
      description: {
        component:
          "Сегмент-переключатель: один вариант из двух–трёх в сером треке, выбранный — на белой пилюле. Собран на `ToggleGroup` (single): семантика радиогруппы, стрелки переключают. Повторный клик по выбранному варианту ничего не снимает; `allowEmpty` разрешает снять выбор там, где «ничего» значит «решит модель» (голос в студии музыки). `size=\"sm\"` — компактный, по ширине содержимого, для строк настроек.",
      },
    },
  },
  args: { value: "", onValueChange: () => {} },
} satisfies Meta<typeof Segmented>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({ initial, size, allowEmpty, options, label }: { initial: string; size?: "default" | "sm"; allowEmpty?: boolean; options: [string, string][]; label: string }) {
  const [value, setValue] = React.useState(initial)
  return (
    <div className="w-[360px]">
      <Segmented value={value} onValueChange={setValue} size={size} allowEmpty={allowEmpty} aria-label={label}>
        {options.map(([id, text]) => (
          <SegmentedItem key={id} value={id}>
            {text}
          </SegmentedItem>
        ))}
      </Segmented>
    </div>
  )
}

export const Default: Story = {
  render: () => <Controlled initial="auto" label="Режим" options={[["auto", "Авто"], ["detailed", "Детальный"]]} />,
}

export const Vocals: Story = {
  render: () => <Controlled initial="vocal" label="Вокал в треке" options={[["vocal", "С вокалом"], ["instrumental", "Без вокала"]]} />,
}

export const SmallDeselectable: Story = {
  name: "Компактный, можно снять выбор",
  render: () => <Controlled initial="female" size="sm" allowEmpty label="Голос" options={[["male", "Муж"], ["female", "Жен"]]} />,
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[360px]">
      <Segmented value="vocal" onValueChange={() => {}} disabled aria-label="Вокал в треке">
        <SegmentedItem value="vocal">С вокалом</SegmentedItem>
        <SegmentedItem value="instrumental">Без вокала</SegmentedItem>
      </Segmented>
    </div>
  ),
}
