import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Archive02Icon, PencilEdit02Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Empty",
  component: Empty,
  parameters: {
    docs: {
      description: {
        component:
          "Пустое состояние: что это, почему пусто, как начать. Используется в архиве, истории чатов, поиске. `EmptyMedia variant=\"icon\"` — серый квадрат с иконкой; `EmptyContent` — место под кнопку действия. `Default` собирает пункт меню «пусто» ровно как в модалке архива.",
      },
    },
  },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty className="w-96">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Archive02Icon} strokeWidth={ICON_STROKE} />
        </EmptyMedia>
        <EmptyTitle>Здесь пока пусто</EmptyTitle>
        <EmptyDescription>Создайте первый проект, чтобы собрать чаты по теме.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Создать проект</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const SearchNoResults: Story = {
  render: () => (
    <Empty className="w-96 p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
        </EmptyMedia>
        <EmptyTitle>Ничего не нашлось</EmptyTitle>
        <EmptyDescription>Попробуйте другое название чата или проекта.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}

export const ArchiveEmpty: Story = {
  render: () => (
    <Empty className="w-96 p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-10 rounded-xl [&_svg]:size-5">
          <HugeiconsIcon icon={Archive02Icon} strokeWidth={ICON_STROKE} />
        </EmptyMedia>
        <EmptyTitle className="text-base">В архиве пусто</EmptyTitle>
        <EmptyDescription>
          Чаты, которые вы уберёте в архив, появятся здесь. Их можно открыть, вернуть в историю или удалить.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}

export const NewChat: Story = {
  render: () => (
    <Empty className="w-96">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-10 rounded-xl [&_svg]:size-5">
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={ICON_STROKE} />
        </EmptyMedia>
        <EmptyTitle className="text-base">Что создадим сегодня?</EmptyTitle>
        <EmptyDescription>Опишите задачу в поле ниже — Молли сама подберёт подходящую нейросеть.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}
