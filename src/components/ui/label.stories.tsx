import type { Meta, StoryObj } from "@storybook/react-vite"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    docs: {
      description: {
        component:
          "Подпись поля на базе Radix `Label`. Для целой строки формы (подпись + описание + ошибка) используйте `Field`/`FieldLabel` — обычный `Label` подходит для точечных случаев без `Field`. `htmlFor` должен совпадать с `id` поля.",
      },
    },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="story-label-input">Название проекта</Label>
      <Input id="story-label-input" placeholder="Например, «Лендинг кофейни»" />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="story-label-checkbox" />
      <Label htmlFor="story-label-checkbox">Без водяного знака</Label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="group flex items-center gap-2" data-disabled="true">
      <Checkbox id="story-label-disabled" disabled />
      <Label htmlFor="story-label-disabled">Недоступно на бесплатном тарифе</Label>
    </div>
  ),
}
