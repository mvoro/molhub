import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Многострочное поле, растёт по содержимому (`field-sizing-content`). Для поля с иконками, кнопками или счётчиком символов внутри рамки используйте `InputGroupTextarea` из `InputGroup`.",
      },
    },
  },
  args: { placeholder: "Опишите картинку" },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  args: { defaultValue: "Кофейня на рассвете, тёплый свет, мягкая плёнка, вид с улицы" },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Недоступно для изменения" },
}

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "" },
}

export const WithField: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="story-textarea">Системный промпт роли</FieldLabel>
      <Textarea id="story-textarea" placeholder="Опишите, как модель должна отвечать" />
      <FieldDescription>Виден только вам, применяется ко всем чатам с этой ролью.</FieldDescription>
    </Field>
  ),
}

export const WithFieldError: Story = {
  render: () => (
    <Field data-invalid="true" className="w-80">
      <FieldLabel htmlFor="story-textarea-error">Описание проекта</FieldLabel>
      <Textarea id="story-textarea-error" aria-invalid />
      <FieldError>Добавьте хотя бы несколько слов</FieldError>
    </Field>
  ),
}
