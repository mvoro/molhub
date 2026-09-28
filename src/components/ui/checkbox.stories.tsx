import type { Meta, StoryObj } from "@storybook/react-vite"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Флажок на базе Radix `Checkbox`. Для строки настройки с подписью и описанием оборачивайте в `FieldLabel` + `Field` (карточка целиком кликабельна) — см. `UI/Field → CheckboxRow`.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = {
  args: { defaultChecked: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
}

export const Invalid: Story = {
  args: { "aria-invalid": true },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="story-checkbox-label" />
      <Label htmlFor="story-checkbox-label">Без водяного знака</Label>
    </div>
  ),
}

export const SettingRow: Story = {
  render: () => (
    <FieldLabel htmlFor="story-checkbox-row" className="w-80">
      <Field orientation="horizontal">
        <Checkbox id="story-checkbox-row" defaultChecked />
        <FieldContent>
          <FieldTitle>Без водяного знака</FieldTitle>
          <FieldDescription>Спишет дополнительные молекулы за генерацию</FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  ),
}
