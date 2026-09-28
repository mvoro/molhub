import type { Meta, StoryObj } from "@storybook/react-vite"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Сворачиваемый список «вопрос — ответ»: справка по тарифам, FAQ, детали настроек. `type=\"single\" collapsible` держит открытым один пункт за раз, `type=\"multiple\"` — сразу несколько. Высота анимируется по `--radix-accordion-content-height`.",
      },
    },
  },
  args: { type: "single", collapsible: true },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const FAQ = [
  {
    q: "Как списываются молекулы?",
    a: "Молекулы списываются за каждый успешный запрос к нейросети. Стоимость запроса зависит от модели и показана рядом с её названием в выборе нейросети.",
  },
  {
    q: "Что будет, если молекулы закончатся?",
    a: "Бесплатные модели останутся доступны без ограничений. Чтобы продолжить работу с платными, пополните баланс или перейдите на тариф «Плюс» или «Про».",
  },
  {
    q: "Можно ли вернуть молекулы за неудачную генерацию?",
    a: "Если результат не получился из-за ошибки на нашей стороне, молекулы возвращаются на баланс автоматически в течение нескольких минут.",
  },
  {
    q: "Как отменить подписку?",
    a: "Откройте настройки, затем «Подписка» и «Отменить». Доступ к тарифу сохранится до конца уже оплаченного периода.",
  },
]

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue={FAQ[0].q} className="w-96">
      {FAQ.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={[FAQ[0].q, FAQ[1].q]} className="w-96">
      {FAQ.slice(0, 3).map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}
