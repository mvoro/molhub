import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

const meta = {
  title: "UI/InputOTP",
  component: InputOTP,
  parameters: {
    docs: {
      description: {
        component:
          "Поле для кода из шести цифр — вход по почте. Управляемый компонент (`value`/`onChange`), под капотом `input-otp`. Разбивайте на группы через `InputOTPSeparator`, ошибку показывайте через `aria-invalid` на `InputOTPGroup`.",
      },
    },
  },
  args: { maxLength: 6, children: null },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

function OTPDemo({ initialValue = "", disabled = false, invalid = false }: { initialValue?: string; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = React.useState(initialValue)
  return (
    <InputOTP maxLength={6} value={value} onChange={setValue} disabled={disabled}>
      <InputOTPGroup aria-invalid={invalid || undefined}>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup aria-invalid={invalid || undefined}>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

export const Default: Story = {
  render: () => <OTPDemo />,
}

export const Filled: Story = {
  render: () => <OTPDemo initialValue="482913" />,
}

export const Disabled: Story = {
  render: () => <OTPDemo initialValue="482" disabled />,
}

export const Invalid: Story = {
  render: () => <OTPDemo initialValue="482913" invalid />,
}
