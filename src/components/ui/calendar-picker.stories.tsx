import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { CalendarPicker } from "@/components/ui/calendar-picker"

const meta = {
  title: "Design System/CalendarPicker",
  component: CalendarPicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[var(--wm-size-360)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CalendarPicker>

export default meta
type Story = StoryObj<typeof meta>

function DemoCalendarPicker() {
  const today = new Date()
  const [monthDate, setMonthDate] = React.useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDateValue, setSelectedDateValue] = React.useState("")
  const minDateValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  return (
    <CalendarPicker
      monthDate={monthDate}
      selectedDateValue={selectedDateValue}
      minDateValue={minDateValue}
      onMonthChange={setMonthDate}
      onSelectDate={setSelectedDateValue}
    />
  )
}

export const Playground: Story = {
  args: {
    monthDate: new Date(),
    selectedDateValue: "",
    minDateValue: "2026-01-01",
    onMonthChange: () => undefined,
    onSelectDate: () => undefined,
  },
  render: () => <DemoCalendarPicker />,
}
