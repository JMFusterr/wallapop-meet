import type { Meta, StoryObj } from "@storybook/react-vite"
import { X } from "lucide-react"

import { IconButton } from "@/components/ui/icon-button"

const meta = {
    title: "Design System/Icon Button",
    component: IconButton,
    tags: ["autodocs"],
    args: {
        label: "Cerrar",
        icon: <X size={16} aria-hidden />,
        variant: "icon",
    },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
    args: {
        disabled: true,
    },
}

