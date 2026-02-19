import type { Meta, StoryObj } from "@storybook/react-vite"

import { InboxBottomNav } from "@/components/ui/inbox-bottom-nav"

const meta = {
  title: "Design System/Inbox Bottom Nav",
  component: InboxBottomNav,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-[390px] overflow-hidden rounded-[20px] border border-[var(--wm-color-border-default)] bg-[#F8F9FA]">
        <div className="h-[520px]" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InboxBottomNav>

export default meta
type Story = StoryObj<typeof meta>

export const InboxActive: Story = {}

export const HomeActiveWithBadge: Story = {
  args: {
    activeItemId: "home",
    items: [
      { id: "home", label: "Inicio", icon: "home" },
      { id: "favorites", label: "Favoritos", icon: "heart", badgeCount: 2 },
      { id: "sell", label: "Vender", icon: "plus" },
      { id: "inbox", label: "Buzon", icon: "mail" },
      { id: "profile", label: "Tu", icon: "user" },
    ],
  },
}
