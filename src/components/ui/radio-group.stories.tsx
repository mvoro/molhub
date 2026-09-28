import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field, FieldContent, FieldDescription, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Группа радиокнопок на базе Radix. Для списка с подписью и описанием у каждого варианта оборачивайте каждый `RadioGroupItem` в `FieldLabel` + `Field orientation=\"horizontal\"` — получаются кликабельные карточки, как выбор модели.",
      },
    },
  },
  args: { defaultValue: "molly" },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} className="w-56">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="molly" id="story-radio-molly" />
        <Label htmlFor="story-radio-molly">Молли</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="gpt5" id="story-radio-gpt5" />
        <Label htmlFor="story-radio-gpt5">GPT-5</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="claude" id="story-radio-claude" />
        <Label htmlFor="story-radio-claude">Claude</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="gemini" id="story-radio-gemini" />
        <Label htmlFor="story-radio-gemini">Gemini</Label>
      </div>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="fast" className="w-56">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="fast" id="story-radio-fast" />
        <Label htmlFor="story-radio-fast">Быстро</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="quality" id="story-radio-quality" disabled />
        <Label htmlFor="story-radio-quality">Качество (нужен тариф выше)</Label>
      </div>
    </RadioGroup>
  ),
}

export const Invalid: Story = {
  render: () => (
    <FieldSet>
      <RadioGroup aria-invalid className="w-56">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="visa" id="story-radio-visa" aria-invalid />
          <Label htmlFor="story-radio-visa">Visa •• 4411</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="mir" id="story-radio-mir" aria-invalid />
          <Label htmlFor="story-radio-mir">Мир •• 2280</Label>
        </div>
      </RadioGroup>
    </FieldSet>
  ),
}

export const ChoiceCards: Story = {
  render: () => (
    <RadioGroup defaultValue="molly" className="w-80">
      <FieldLabel htmlFor="story-card-molly">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Молли</FieldTitle>
            <FieldDescription>Быстрая модель AI Hub, без наценки</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="molly" id="story-card-molly" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="story-card-gpt5">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>GPT-5</FieldTitle>
            <FieldDescription>Точнее в коде и рассуждениях, дороже в молекулах</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="gpt5" id="story-card-gpt5" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  ),
}
