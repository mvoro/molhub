import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Однострочное текстовое поле. Для иконок и кнопок внутри поля используйте `InputGroup`, а не самодельную обёртку. Подпись, описание и ошибку добавляйте через `Field`/`FieldLabel`/`FieldDescription`/`FieldError`, а не отдельными `<label>`/`<p>`.",
      },
    },
  },
  args: { placeholder: "Введите название" },
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number", "search", "file"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  args: { defaultValue: "Лендинг кофейни" },
}

export const Types: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Input type="email" placeholder="Электронная почта" />
      <Input type="password" placeholder="Пароль" />
      <Input type="number" placeholder="Количество" />
      <Input type="file" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Недоступно для изменения" },
}

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "не похоже на почту" },
}

export const WithField: Story = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="story-input-name">Название проекта</FieldLabel>
      <Input id="story-input-name" placeholder="Например, «Лендинг кофейни»" />
      <FieldDescription>Видно в боковой панели и в списке проектов.</FieldDescription>
    </Field>
  ),
}

export const WithFieldError: Story = {
  render: () => (
    <Field data-invalid="true" className="w-72">
      <FieldLabel htmlFor="story-input-email">Электронная почта</FieldLabel>
      <Input id="story-input-email" aria-invalid defaultValue="не похоже на почту" />
      <FieldError>Проверьте адрес почты</FieldError>
    </Field>
  ),
}
