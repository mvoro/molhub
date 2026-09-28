import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Copy01Icon, Folder01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Поле ввода с иконками, текстом или кнопками по краям — обёртка вокруг `Input`/`Textarea`. Используется для переименования в боковой панели, названия проекта в `project-dialog.tsx` и настроек в composer'е чата (`chat-composer/settings.tsx`). Внутри — `InputGroupAddon` (`align`: inline-start/inline-end/block-start/block-end), `InputGroupButton`, `InputGroupText`.",
      },
    },
  },
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const WithLeadingIcon: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
      </InputGroupAddon>
      <InputGroupInput placeholder="Например, «Лендинг кофейни»" defaultValue="Лендинг кофейни" />
    </InputGroup>
  ),
}

export const SearchWithClear: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
      </InputGroupAddon>
      <InputGroupInput placeholder="Поиск роли" defaultValue="Копирайтер" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="ghost" size="icon-xs" aria-label="Очистить поиск">
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithTrailingButton: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupInput readOnly defaultValue="https://aihub.app/s/kofeynya-9f2" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="ghost" size="icon-xs" aria-label="Скопировать ссылку">
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Textarea: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupTextarea placeholder="Опишите картинку" defaultValue="Кофейня на рассвете, тёплый свет, мягкая плёнка" />
      <InputGroupAddon align="block-end" className="border-t">
        <InputGroupText>48 / 500</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
      </InputGroupAddon>
      <InputGroupInput placeholder="Недоступно для изменения" disabled />
    </InputGroup>
  ),
}

export const Invalid: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <HugeiconsIcon icon={Folder01Icon} strokeWidth={ICON_STROKE} />
      </InputGroupAddon>
      <InputGroupInput aria-invalid defaultValue="" placeholder="Название проекта" />
    </InputGroup>
  ),
}
