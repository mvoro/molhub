import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { ru } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          "Календарь на базе `react-day-picker`. `mode=\"single\"` — одна дата (история чатов, срок действия тарифа), `mode=\"range\"` — период (отчёт по расходам).",
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

function SingleDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 26))
  return <Calendar mode="single" selected={date} onSelect={setDate} locale={ru} />
}

function RangeDemo() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 8, 22),
    to: new Date(2026, 8, 26),
  })
  return <Calendar mode="range" selected={range} onSelect={setRange} locale={ru} />
}

export const Default: Story = {
  render: () => <SingleDemo />,
}

export const Range: Story = {
  render: () => <RangeDemo />,
}

export const Disabled: Story = {
  render: () => (
    <Calendar
      mode="single"
      selected={new Date(2026, 8, 26)}
      disabled={{ before: new Date(2026, 8, 26) }}
      locale={ru}
    />
  ),
}
