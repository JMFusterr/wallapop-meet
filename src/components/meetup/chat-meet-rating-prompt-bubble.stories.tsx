import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatMeetRatingPromptBubble } from "@/components/meetup/chat-meet-rating-prompt-bubble"

const meta = {
    title: "Design System/Chat Meet Rating Prompt Bubble",
    component: ChatMeetRatingPromptBubble,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="w-full min-w-[var(--wm-size-320)] max-w-[var(--wm-size-420)] rounded-[var(--wm-size-12)] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChatMeetRatingPromptBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        time: "7:07",
    },
}

export const Completed: Story = {
    args: {
        time: "11:03",
        completed: true,
    },
}
