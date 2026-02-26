import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatConversationHeader } from "@/components/ui/chat-conversation-header"
import listingImage from "@/stories/assets/avif-test-image.avif"

const meta = {
    title: "Design System/Chat Conversation Header",
    component: ChatConversationHeader,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
    args: {
        itemImageSrc: listingImage,
        itemImageAlt: "Producto en venta",
        itemPrice: "40,00 EUR",
        itemTitle: "Silent Hill f PS5 Juego",
        profileImageSrc: listingImage,
        profileImageAlt: "Foto de perfil del contacto",
        userName: "Samuel",
        rating: 5,
        distanceLabel: "10,4km de ti",
        attendanceRate: 96,
        attendanceMeetups: 28,
        productStatusIcon: "bookmark",
        onBack: () => undefined,
        onMenuClick: () => undefined,
    },
} satisfies Meta<typeof ChatConversationHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {
    args: {
        expanded: false,
    },
}

export const Expanded: Story = {
    args: {
        expanded: true,
    },
}

export const Interactive: Story = {
    args: {
        defaultExpanded: false,
        expanded: undefined,
    },
}
