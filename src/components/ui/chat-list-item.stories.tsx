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
      <div className="w-full max-w-[var(--wm-size-360)] border border-[color:var(--wm-color-border-default)] bg-white">
        <Story />
      </div>
    ),
  ],
  args: {
    userName: "Lorena",
    messageDate: "18:35",
    itemTitle: "Chaqueta de borrego",
    messagePreview: "Un saludo",
    unreadCount: 0,
    lastMessageDeliveryState: "read",
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

export const WithBookmark: Story = {
  args: {
    userName: "Samuel",
    messageDate: "15:07",
    itemTitle: "Silent Hill f PS5 Juego",
    messagePreview: "El paquete ha llegado al punto ...",
    leadingIndicator: "bookmark",
  },
}

export const WithDeal: Story = {
  args: {
    userName: "Daniel",
    messageDate: "17:24",
    itemTitle: "Figura Pickett Animales Fan...",
    messagePreview: "Ya voy",
    leadingIndicator: "deal",
    lastMessageDeliveryState: "read",
  },
}

export const WithUnreadBadge: Story = {
  args: {
    userName: "Marta",
    messageDate: "Ayer",
    itemTitle: "iPhone 13 128GB",
    messagePreview: "Perfecto, me va bien en el metro.",
    unreadCount: 2,
  },
}

