import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field, FieldContent, FieldDescription, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "Переключатель on/off на базе Radix. Для строки настройки с заголовком и описанием оборачивайте в `Field orientation=\"horizontal\"` + `FieldContent` — см. `WithLabel`.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default"] },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = {
  args: { defaultChecked: true },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch size="sm" defaultChecked />
      <Switch size="default" defaultChecked />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch disabled />
      <Switch disabled defaultChecked />
    </div>
  ),
}

export const Invalid: Story = {
  args: { "aria-invalid": true },
}

export const WithLabel: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-80">
      <FieldContent>
        <FieldTitle>Улучшить запрос</FieldTitle>
        <FieldDescription>Модель уточнит формулировку перед генерацией</FieldDescription>
      </FieldContent>
      <Switch defaultChecked />
    </Field>
  ),
}
