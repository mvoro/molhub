import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Download04Icon, Share08Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Склеивает кнопки (и `Input`/`Select`) в один сегментированный блок — общие рамки, без двойных бордеров между элементами. `orientation=\"vertical\"` — колонкой.",
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Быстро</Button>
      <Button variant="outline">Качество</Button>
    </ButtonGroup>
  ),
}

export const IconButtons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Скачать">
        <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} />
      </Button>
      <Button variant="outline" size="icon" aria-label="Скопировать">
        <HugeiconsIcon icon={Copy01Icon} strokeWidth={ICON_STROKE} />
      </Button>
      <Button variant="outline" size="icon" aria-label="Поделиться">
        <HugeiconsIcon icon={Share08Icon} strokeWidth={ICON_STROKE} />
      </Button>
    </ButtonGroup>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Копировать</Button>
      <ButtonGroupSeparator />
      <Button variant="outline" size="icon" aria-label="Скачать">
        <HugeiconsIcon icon={Download04Icon} strokeWidth={ICON_STROKE} />
      </Button>
    </ButtonGroup>
  ),
}

export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>₽</ButtonGroupText>
      <Button variant="outline">990 в месяц</Button>
    </ButtonGroup>
  ),
}

export const WithSelect: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Скачать</Button>
      <Select defaultValue="png">
        <SelectTrigger aria-label="Формат файла">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="jpg">JPG</SelectItem>
          <SelectItem value="webp">WEBP</SelectItem>
        </SelectContent>
      </Select>
    </ButtonGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" className="w-40">
      <Button variant="outline">Быстро</Button>
      <Button variant="outline">Качество</Button>
    </ButtonGroup>
  ),
}
