import type { Meta, StoryObj } from "@storybook/react-vite"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const meta = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Группа переключателей на базе Radix `ToggleGroup` — формат изображения, качество и подобные наборы взаимоисключающих (`type=\"single\"`) или независимых (`type=\"multiple\"`) значений. `spacing={0}` склеивает кнопки в один сегментированный контрол.",
      },
    },
  },
  args: { type: "single" },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="1:1">
      <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
      <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
      <ToggleGroupItem value="9:16">9:16</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Segmented: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="fast" variant="outline" spacing={0}>
      <ToggleGroupItem value="fast">Быстро</ToggleGroupItem>
      <ToggleGroupItem value="quality">Качество</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["boost"]}>
      <ToggleGroupItem value="boost">Улучшить запрос</ToggleGroupItem>
      <ToggleGroupItem value="watermark">Без водяного знака</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="9:16" orientation="vertical" className="w-32">
      <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
      <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
      <ToggleGroupItem value="9:16">9:16</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="fast">
      <ToggleGroupItem value="fast">Быстро</ToggleGroupItem>
      <ToggleGroupItem value="quality" disabled>
        Качество
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
