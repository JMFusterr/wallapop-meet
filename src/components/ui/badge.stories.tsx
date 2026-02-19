import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "@/components/ui/badge"

const meta = {
  title: "Design System/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    value: 3,
    variant: "unread",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["unread", "success", "error"],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const HiddenWhenZero: Story = {
  args: {
    value: 0,
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge value={5} variant="unread" />
      <Badge value="OK" variant="success" />
      <Badge value="!" variant="error" />
    </div>
  ),
}
