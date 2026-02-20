import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatComposer } from "@/components/ui/chat-composer"

const meta = {
  title: "Design System/Chat Composer",
  component: ChatComposer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[680px] bg-[var(--wm-color-background-surface)] p-3">
        <Story />
      </div>
    ),
  ],
  args: {
    defaultValue: "Te va bien quedar manana?",
  },
} satisfies Meta<typeof ChatComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Empty: Story = {
  args: {
    defaultValue: "",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const WithSecondaryAction: Story = {
  args: {
    defaultValue: "",
    secondaryActionLabel: "Proponer quedar",
    secondaryActionAriaLabel: "Proponer quedar",
    secondaryActionIconName: "calendar",
  },
}
