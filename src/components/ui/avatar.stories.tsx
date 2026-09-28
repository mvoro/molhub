import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Аватар пользователя: картинка с тонкой обводкой, которая замешивается в фон (не «съедает» тёмную тему), и фолбэк-инициалы. `size` — sm/default/lg. `AvatarBadge` — индикатор поверх иконки; `AvatarGroup`/`AvatarGroupCount` — несколько аватаров внахлёст, как участники проекта.",
      },
    },
  },
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/avatars/pallas-cat.webp" alt="" />
      <AvatarFallback>МВ</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {}

export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>МВ</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar size="sm">
        <AvatarImage src="/avatars/baby-griffin.webp" alt="" />
        <AvatarFallback>МВ</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="/avatars/baby-griffin.webp" alt="" />
        <AvatarFallback>МВ</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="/avatars/baby-griffin.webp" alt="" />
        <AvatarFallback>МВ</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage src="/avatars/serval.webp" alt="" />
      <AvatarFallback>МВ</AvatarFallback>
      <AvatarBadge>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={ICON_STROKE} />
      </AvatarBadge>
    </Avatar>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="/avatars/monkey-gentle-smile.webp" alt="" />
        <AvatarFallback>МВ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/wombat-2.webp" alt="" />
        <AvatarFallback>АК</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/avatars/sleepy-raccoon.webp" alt="" />
        <AvatarFallback>ЕЛ</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
}
