import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatListItem } from "@/components/ui/chat-list-item"

const meta = {
  title: "Design System/Chat List Item",
  component: ChatListItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-[var(--wm-color-border-default)] bg-white">
        <Story />
      </div>
    ),
  ],
  args: {
    userName: "Marta",
    messageDate: "18:42",
    itemTitle: "iPhone 13 128GB",
    messagePreview: "Perfecto, me va bien en el metro.",
    unreadCount: 2,
  },
} satisfies Meta<typeof ChatListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const NoUnread: Story = {
  args: {
    unreadCount: 0,
  },
}
