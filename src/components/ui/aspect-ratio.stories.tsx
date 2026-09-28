import type { Meta, StoryObj } from "@storybook/react-vite"

import { AspectRatio } from "@/components/ui/aspect-ratio"

const meta = {
  title: "UI/AspectRatio",
  component: AspectRatio,
  parameters: {
    docs: {
      description: {
        component:
          "Фиксирует пропорции блока — превью сгенерированных изображений и видео в ленте идей и карточках результата. Сам по себе не стилизует содержимое: скругление, фон и `object-cover` задаются на дочернем элементе. Radix оборачивает `Root` в свой div с `width: 100%`, поэтому ширину задают на внешнем контейнере, а не на самом `AspectRatio` (его `className` достаётся внутреннему `position: absolute` слою).",
      },
    },
  },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Square: Story = {
  render: () => (
    <div className="w-64">
      <AspectRatio ratio={1} className="overflow-hidden rounded-xl bg-muted">
        <img src="/presets/aurora.jpg" alt="Северное сияние" className="size-full object-cover" />
      </AspectRatio>
    </div>
  ),
}

export const Widescreen: Story = {
  render: () => (
    <div className="w-96">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-muted">
        <img src="/presets/city-walk.jpg" alt="Прогулка по городу" className="size-full object-cover" />
      </AspectRatio>
    </div>
  ),
}

export const Portrait: Story = {
  render: () => (
    <div className="w-56">
      <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-xl bg-muted">
        <img src="/presets/watercolor.jpg" alt="Акварель" className="size-full object-cover" />
      </AspectRatio>
    </div>
  ),
}
