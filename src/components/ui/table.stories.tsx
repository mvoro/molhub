import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoleculesIcon } from "@hugeicons/core-free-icons"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          "Таблица данных. Основной сценарий в AI Hub — «История списаний»: дата, модель, запрос и сколько молекул списано за него.",
      },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const ROWS = [
  { date: "25 сен, 14:12", model: "Молли", request: "Логотип для кофейни в стиле минимализм", spent: 3 },
  { date: "24 сен, 21:03", model: "GPT-5", request: "Сравнение тарифов хостинга", spent: 1 },
  { date: "24 сен, 09:47", model: "Kling", request: "Промо-ролик для запуска приложения", spent: 12 },
  { date: "22 сен, 18:30", model: "Midjourney", request: "Обложка для подкаста про технологии", spent: 6 },
  { date: "21 сен, 11:15", model: "Claude", request: "План публикаций на неделю", spent: 1 },
]

export const BillingHistory: Story = {
  name: "История списаний",
  render: () => (
    <Table className="w-[42rem]">
      <TableCaption>История списаний за последние 7 дней</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Дата</TableHead>
          <TableHead>Модель</TableHead>
          <TableHead>Запрос</TableHead>
          <TableHead className="text-right">Списано</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.date + row.request}>
            <TableCell className="text-muted-foreground">{row.date}</TableCell>
            <TableCell>{row.model}</TableCell>
            <TableCell className="max-w-64 truncate">{row.request}</TableCell>
            <TableCell className="text-right">
              <span className="inline-flex items-center gap-1">
                {row.spent}
                <HugeiconsIcon icon={MoleculesIcon} strokeWidth={ICON_STROKE} className="size-3.5 text-muted-foreground" />
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Итого</TableCell>
          <TableCell className="text-right">
            {ROWS.reduce((sum, row) => sum + row.spent, 0)} молекул
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const Compact: Story = {
  name: "Без подвала",
  render: () => (
    <Table className="w-96">
      <TableHeader>
        <TableRow>
          <TableHead>Модель</TableHead>
          <TableHead className="text-right">Цена за запрос</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Молли</TableCell>
          <TableCell className="text-right">3 молекулы</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>GPT-5</TableCell>
          <TableCell className="text-right">1 молекула</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Gemini</TableCell>
          <TableCell className="text-right">1 молекула</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
