import type { Meta, StoryObj } from "@storybook/react-vite"

import { WallapopIcon } from "@/components/ui/wallapop-icon"

const meta = {
    title: "Design System/Wallapop Icon",
    component: WallapopIcon,
    tags: ["autodocs"],
    args: {
        name: "calendar",
        size: "medium",
    },
} satisfies Meta<typeof WallapopIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

