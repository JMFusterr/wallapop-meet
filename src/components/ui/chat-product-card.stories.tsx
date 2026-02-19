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
    price: "250 EUR",
    stats: "320 visitas",
  },
} satisfies Meta<typeof ChatProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithEditAction: Story = {
  args: {
    onEdit: () => undefined,
  },
}
