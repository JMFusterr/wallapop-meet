import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatMessageBubble } from "@/components/ui/chat-message-bubble"

const meta = {
  title: "Design System/Chat Message Bubble",
  component: ChatMessageBubble,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "Perfecto, nos vemos en la estacion.",
    variant: "received",
    time: "14:52",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["sent", "received"],
    },
    deliveryState: {
      control: "inline-radio",
      options: ["sent", "read"],
    },
  },
} satisfies Meta<typeof ChatMessageBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const ThreadExample: Story = {
  render: () => (
    <div className="flex w-full max-w-[var(--wm-size-420)] flex-col gap-2">
      <div className="flex justify-start">
        <ChatMessageBubble variant="received" time="14:52">
          Te va bien manana a las 18:30?
        </ChatMessageBubble>
      </div>
      <div className="flex justify-end">
        <ChatMessageBubble variant="sent" time="15:16" deliveryState="sent">
          Si, confirmo en Glories.
        </ChatMessageBubble>
      </div>
      <div className="flex justify-end">
        <ChatMessageBubble variant="sent" time="15:18" deliveryState="read">
          Perfecto
        </ChatMessageBubble>
      </div>
    </div>
  ),
}
