import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"
import { MeetTransactionRatingModal } from "@/components/meetup/meet-transaction-rating-modal"

function MeetTransactionRatingModalStory() {
    const [open, setOpen] = React.useState(true)
    return (
        <div className="min-h-[var(--wm-size-360)] w-full max-w-[var(--wm-size-520)] p-4">
            <Button type="button" variant="primary" onClick={() => setOpen(true)}>
                Abrir modal de valoración
            </Button>
            <MeetTransactionRatingModal
                open={open}
                counterpartName="Samuel"
                defaultSalePrice="40 €"
                onClose={() => setOpen(false)}
                onPublish={() => setOpen(false)}
            />
        </div>
    )
}

const meta = {
    title: "Design System/Meet Transaction Rating Modal",
    component: MeetTransactionRatingModalStory,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MeetTransactionRatingModalStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => <MeetTransactionRatingModalStory />,
}
