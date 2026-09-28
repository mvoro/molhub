import type { Meta, StoryObj } from "@storybook/react-vite"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

const meta = {
  title: "UI/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Каркас строки формы: подпись, описание, ошибка. `orientation` — vertical (по умолчанию), horizontal (переключатель в строке) или responsive. `FieldSet`/`FieldLegend` группируют несколько полей, `FieldGroup` задаёт отступы между ними, `FieldSeparator` — разделитель «или». Подпись, обёрнутая вокруг `Field`, превращает строку в кликабельную карточку (`FieldLabel` + вложенный `Field`). Используется в `project-dialog.tsx`.",
      },
    },
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="story-field-name">Название проекта</FieldLabel>
      <Input id="story-field-name" placeholder="Например, «Лендинг кофейни»" />
      <FieldDescription>Видно в боковой панели и в списке проектов.</FieldDescription>
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field data-invalid="true" className="w-72">
      <FieldLabel htmlFor="story-field-error">Электронная почта</FieldLabel>
      <Input id="story-field-error" aria-invalid defaultValue="не похоже на почту" />
      <FieldError>Проверьте адрес почты</FieldError>
    </Field>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-80">
      <FieldContent>
        <FieldTitle>Улучшить запрос</FieldTitle>
        <FieldDescription>Модель уточнит формулировку перед генерацией.</FieldDescription>
      </FieldContent>
      <Switch defaultChecked />
    </Field>
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
            <FieldDescription>Точнее в коде и рассуждениях</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="gpt5" id="story-card-gpt5" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  ),
}

export const CheckboxRow: Story = {
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

export const Grouped: Story = {
  render: () => (
    <FieldSet className="w-80">
      <FieldLegend>Новый проект</FieldLegend>
      <FieldDescription>Название и цвет папки видны в боковой панели.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="story-grouped-name">Название</FieldLabel>
          <Input id="story-grouped-name" placeholder="Например, «Лендинг кофейни»" />
        </Field>
        <FieldSeparator>или</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="story-grouped-template">Шаблон</FieldLabel>
          <Input id="story-grouped-template" placeholder="Выберите готовый шаблон" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}
