import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatProductCard } from "@/components/ui/chat-product-card"
import sampleImage from "@/stories/assets/avif-test-image.avif"

const meta = {
  title: "Design System/Chat Product Card",
  component: ChatProductCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    imageSrc: sampleImage,
    imageAlt: "Producto en venta",
    title: "Nintendo Switch OLED",
    price: "250 €",
    viewerRole: "seller",
    viewsCount: 320,
    likesCount: 24,
  },
} satisfies Meta<typeof ChatProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {
  args: {
    statusLabel: undefined,
    viewerRole: "seller",
    onEdit: () => undefined,
    onReserve: () => undefined,
    onSold: () => undefined,
  },
}

export const Reserved: Story = {
  args: {
    statusLabel: "Reservado",
    viewerRole: "seller",
    onEdit: () => undefined,
    onReserve: () => undefined,
    onSold: () => undefined,
  },
}

export const Sold: Story = {
  args: {
    viewerRole: "buyer",
    statusLabel: "Vendido",
  },
}
