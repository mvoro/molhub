import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Выпадающий список на базе Radix `Select` — для выбора одного значения из закрытого набора без поиска (например, формат изображения). Если вариантов много и нужен поиск или множественный выбор — используйте `Combobox`. Открыт по умолчанию (`defaultOpen`), чтобы попап был виден в доке.",
      },
      // An open Select is modal: two of them inline on one docs page fight over focus.
      story: { inline: false, height: "360px" },
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select defaultOpen defaultValue="1:1">
      <SelectTrigger className="w-40" aria-label="Формат изображения">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1:1">1:1</SelectItem>
        <SelectItem value="16:9">16:9</SelectItem>
        <SelectItem value="9:16">9:16</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Select defaultValue="fast">
        <SelectTrigger size="sm" className="w-32" aria-label="Качество">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fast">Быстро</SelectItem>
          <SelectItem value="quality">Качество</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="fast">
        <SelectTrigger size="default" className="w-32" aria-label="Качество">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fast">Быстро</SelectItem>
          <SelectItem value="quality">Качество</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Select defaultOpen defaultValue="molly">
      <SelectTrigger className="w-48" aria-label="Модель">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Без наценки</SelectLabel>
          <SelectItem value="molly">Молли</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>С наценкой</SelectLabel>
          <SelectItem value="gpt5">GPT-5</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
          <SelectItem value="gemini">Gemini</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select defaultValue="fast" disabled>
      <SelectTrigger className="w-40" aria-label="Качество">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fast">Быстро</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-invalid className="w-40" aria-label="Модель">
        <SelectValue placeholder="Выберите модель" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="molly">Молли</SelectItem>
        <SelectItem value="gpt5">GPT-5</SelectItem>
      </SelectContent>
    </Select>
  ),
}
