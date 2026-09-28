import type { Meta, StoryObj } from "@storybook/react-vite"

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"

const meta = {
  title: "UI/NativeSelect",
  component: NativeSelect,
  parameters: {
    docs: {
      description: {
        component:
          "Обёртка над нативным `<select>` со стрелкой Hugeicons поверх. Используйте, когда нужен системный пикер (мобильные ОС показывают свой UI) или простая форма без анимации попапа — иначе предпочитайте `Select`.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default"] },
  },
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <NativeSelect defaultValue="1:1" aria-label="Формат изображения">
      <NativeSelectOption value="1:1">1:1</NativeSelectOption>
      <NativeSelectOption value="16:9">16:9</NativeSelectOption>
      <NativeSelectOption value="9:16">9:16</NativeSelectOption>
    </NativeSelect>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <NativeSelect size="sm" defaultValue="fast" aria-label="Качество">
        <NativeSelectOption value="fast">Быстро</NativeSelectOption>
        <NativeSelectOption value="quality">Качество</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="default" defaultValue="fast" aria-label="Качество">
        <NativeSelectOption value="fast">Быстро</NativeSelectOption>
        <NativeSelectOption value="quality">Качество</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
}

export const WithOptGroup: Story = {
  render: () => (
    <NativeSelect defaultValue="molly" aria-label="Модель" className="w-48">
      <NativeSelectOptGroup label="Без наценки">
        <NativeSelectOption value="molly">Молли</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="С наценкой">
        <NativeSelectOption value="gpt5">GPT-5</NativeSelectOption>
        <NativeSelectOption value="claude">Claude</NativeSelectOption>
        <NativeSelectOption value="gemini">Gemini</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
}

export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled defaultValue="fast" aria-label="Качество">
      <NativeSelectOption value="fast">Быстро</NativeSelectOption>
    </NativeSelect>
  ),
}

export const Invalid: Story = {
  render: () => (
    <NativeSelect aria-invalid defaultValue="" aria-label="Модель">
      <NativeSelectOption value="" disabled>
        Выберите модель
      </NativeSelectOption>
      <NativeSelectOption value="molly">Молли</NativeSelectOption>
    </NativeSelect>
  ),
}
