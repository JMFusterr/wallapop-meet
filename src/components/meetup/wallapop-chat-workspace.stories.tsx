import type { Meta, StoryObj } from "@storybook/react-vite"

import { WallapopChatWorkspace } from "@/components/meetup/wallapop-chat-workspace"

const meta = {
    title: "Design System/Wallapop Chat Workspace",
    component: WallapopChatWorkspace,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof WallapopChatWorkspace>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
