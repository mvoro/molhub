import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox"

const MODELS = ["Молли", "GPT-5", "Claude", "Gemini", "Grok"]

const ROLE_GROUPS = [
  { label: "Тексты", items: ["Копирайтер", "Редактор", "SMM-менеджер"] },
  { label: "Разработка", items: ["Программист", "Технический писатель"] },
]

const meta = {
  title: "UI/Combobox",
  component: Combobox,
  parameters: {
    docs: {
      description: {
        component:
          "Поле выбора с поиском по списку, на базе Base UI `Combobox`. Для одиночного выбора без поиска используйте `Select`. `multiple` вместе с `ComboboxChips`/`ComboboxChip` даёт мультивыбор с тегами (например, роли для чата). Открыт по умолчанию (`defaultOpen`), чтобы попап был виден в доке.",
      },
    },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Combobox items={MODELS} defaultValue="Молли" defaultOpen>
      <ComboboxInput placeholder="Выберите модель" className="w-56">
        <ComboboxContent>
          <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
    </Combobox>
  ),
}

export const WithClear: Story = {
  render: () => (
    <Combobox items={MODELS} defaultValue="GPT-5">
      <ComboboxInput placeholder="Выберите модель" showClear className="w-56">
        <ComboboxContent>
          <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
    </Combobox>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Combobox items={ROLE_GROUPS} defaultOpen>
      <ComboboxInput placeholder="Найти роль" className="w-64">
        <ComboboxContent>
          <ComboboxEmpty>Роли не найдены</ComboboxEmpty>
          <ComboboxList>
            {(group: (typeof ROLE_GROUPS)[number]) => (
              <ComboboxGroup key={group.label} items={group.items}>
                <ComboboxLabel>{group.label}</ComboboxLabel>
                {group.items.map((role) => (
                  <ComboboxItem key={role} value={role}>
                    {role}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
    </Combobox>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Combobox items={MODELS} defaultValue="Молли" disabled>
      <ComboboxInput placeholder="Выберите модель" disabled className="w-56">
        <ComboboxContent>
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
    </Combobox>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Combobox items={MODELS}>
      <ComboboxInput placeholder="Выберите модель" aria-invalid className="w-56">
        <ComboboxContent>
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
    </Combobox>
  ),
}

function MultipleDemo() {
  const [value, setValue] = React.useState<string[]>(["Копирайтер", "Редактор"])
  const anchor = useComboboxAnchor()
  const roles = ROLE_GROUPS.flatMap((group) => group.items)

  return (
    <Combobox items={roles} multiple value={value} onValueChange={setValue}>
      <ComboboxChips ref={anchor} className="w-72">
        {value.map((role) => (
          <ComboboxChip key={role}>{role}</ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder={value.length ? "" : "Добавить роль"} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Роли не найдены</ComboboxEmpty>
        <ComboboxList>{(role: string) => <ComboboxItem key={role} value={role}>{role}</ComboboxItem>}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
}
