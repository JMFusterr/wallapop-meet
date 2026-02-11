import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"

const meta = {
  title: "Design System/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost", "critical"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    children: "Enviar propuesta",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="critical">Critical</Button>
    </div>
  ),
}

export const Loading: Story = {
  args: {
    loading: true,
    loadingText: "Enviando...",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
