import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const meta = {
  title: "UI/Carousel",
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component:
          "Горизонтальная лента на embla-carousel: идеи для генерации, загруженные фото и видео. Стрелки — `CarouselPrevious`/`CarouselNext`; на тач-устройствах их обычно прячут и оставляют только свайп. `opts={{ align: \"start\", dragFree: true }}` — как в ленте загрузок композера. Клавиатура: Tab на слайд за краем докручивает ленту так, чтобы он был виден целиком (нативный скролл вьюпорта гасится); ←/→ листают, пока фокус внутри.",
      },
    },
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

const IDEAS = [
  { file: "aurora.jpg", title: "Северное сияние" },
  { file: "city-walk.jpg", title: "Прогулка по городу" },
  { file: "noir.jpg", title: "Нуар-портрет" },
  { file: "watercolor.jpg", title: "Акварель" },
  { file: "risograph.jpg", title: "Ризография" },
]

export const Default: Story = {
  render: () => (
    <Carousel opts={{ align: "start" }} aria-label="Идеи для генерации" className="w-[420px]">
      <CarouselContent>
        {IDEAS.map((idea) => (
          <CarouselItem key={idea.file} className="basis-1/2">
            <div className="overflow-hidden rounded-xl bg-muted">
              <img src={`/presets/${idea.file}`} alt="" className="aspect-[4/5] w-full object-cover" />
            </div>
            <p className="mt-2 truncate text-sm font-medium">{idea.title}</p>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious aria-label="Предыдущие идеи" />
      <CarouselNext aria-label="Следующие идеи" />
    </Carousel>
  ),
}

export const DragFree: Story = {
  render: () => (
    <Carousel opts={{ align: "start", dragFree: true }} aria-label="Загруженные фото" className="w-[420px]">
      <CarouselContent className="-ml-2">
        {IDEAS.map((idea) => (
          <CarouselItem key={idea.file} className="basis-[38%] pl-2">
            <div className="overflow-hidden rounded-[20px] bg-muted">
              <img src={`/presets/${idea.file}`} alt="" className="aspect-[4/5] w-full object-cover" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ),
}

/* Slides are buttons (the home page's idea cards): Tab through them — the one past the edge is
   scrolled fully into view, with the focus ring visible. */
export const KeyboardFocus: Story = {
  render: () => (
    <Carousel opts={{ align: "start", dragFree: true }} aria-label="Идеи" className="w-[420px]">
      <CarouselContent className="-ml-2">
        {IDEAS.map((idea) => (
          <CarouselItem key={idea.file} className="basis-[45%] pl-2">
            <Button
              variant="secondary"
              aria-label={`Идея: ${idea.title}`}
              className="relative h-auto w-full overflow-hidden rounded-[20px] p-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring/70"
            >
              <img src={`/presets/${idea.file}`} alt="" className="aspect-[4/5] w-full object-cover" />
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ),
}
