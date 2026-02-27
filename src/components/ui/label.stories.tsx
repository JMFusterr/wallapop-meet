import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "@/components/ui/label"

const meta = {
    title: "Design System/Label",
    component: Label,
    tags: ["autodocs"],
    args: {
        children: "pendiente",
        tone: "pending",
    },
    argTypes: {
        tone: {
            control: "inline-radio",
            options: ["pending", "confirmed", "arrived", "completed", "cancelled"],
        },
    },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
    args: { children: "pendiente", tone: "pending" },
}

export const Confirmed: Story = {
    args: { children: "confirmada", tone: "confirmed" },
}

export const Arrived: Story = {
    args: { children: "llegada", tone: "arrived" },
}

export const Completed: Story = {
    args: { children: "completada", tone: "completed" },
}

export const Cancelled: Story = {
    args: { children: "cancelada", tone: "cancelled" },
}
