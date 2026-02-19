import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatSecurityBanner } from "@/components/ui/chat-security-banner"

const meta = {
  title: "Design System/Chat Security Banner",
  component: ChatSecurityBanner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[560px] border border-[var(--wm-color-border-default)] bg-white">
        <Story />
      </div>
    ),
  ],
  args: {
    message: "Quedate en Wallapop. Mas facil, mas seguro.",
    linkText: "Preguntas? Habla con nuestro chatbot",
  },
} satisfies Meta<typeof ChatSecurityBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
