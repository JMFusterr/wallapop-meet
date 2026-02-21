import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatCounterpartCard } from "@/components/ui/chat-counterpart-card"
import sampleProfile from "@/stories/assets/avif-test-image.avif"

const meta = {
    title: "Design System/Chat Counterpart Card",
    component: ChatCounterpartCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {
        name: "Lorena",
        rating: 4.5,
        distanceLabel: "42km de ti",
        locationLabel: "Desconocido",
        profileImageSrc: sampleProfile,
    },
} satisfies Meta<typeof ChatCounterpartCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
