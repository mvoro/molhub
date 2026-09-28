import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field, FieldContent, FieldDescription, FieldTitle } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          "Ползунок значения на базе Radix. Одно значение — `defaultValue={[x]}`, диапазон — `defaultValue={[from, to]}` (тогда рендерятся два бегунка). Без видимой подписи передавайте `aria-label`: он уходит на бегунок (`role=\"slider\"`), иначе скринридер назовёт ползунок безымянным.",
      },
    },
  },
  args: { defaultValue: [50], min: 0, max: 100, step: 1 },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
  render: (args) => (
    <div className="w-64">
      <Slider {...args} />
    </div>
  ),
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Range: Story = {
  args: { defaultValue: [20, 80] },
}

export const Disabled: Story = {
  args: { defaultValue: [30], disabled: true },
}

export const Vertical: Story = {
  render: () => (
    <div className="h-40">
      <Slider defaultValue={[40]} orientation="vertical" />
    </div>
  ),
}

/* Без видимой подписи: имя — через aria-label, иконка рядом декоративная (размер превью на «Фото»). */
export const AriaLabel: Story = {
  render: () => (
    <div className="flex h-9 w-44 items-center gap-3 rounded-full bg-muted px-3.5">
      <Slider min={0} max={4} step={1} defaultValue={[2]} aria-label="Размер превью" />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <Field className="w-64">
      <FieldContent className="flex-row items-center justify-between">
        <FieldTitle>Качество</FieldTitle>
        <FieldDescription>70 из 100</FieldDescription>
      </FieldContent>
      <Slider defaultValue={[70]} />
    </Field>
  ),
}
