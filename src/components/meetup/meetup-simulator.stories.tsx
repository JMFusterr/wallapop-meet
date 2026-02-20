import type { Meta, StoryObj } from "@storybook/react-vite"

import { MeetupSimulator } from "@/components/meetup/meetup-simulator"

const meta = {
    title: "Design System/Meetup Simulator",
    component: MeetupSimulator,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="w-full min-w-[360px] max-w-[920px] bg-[var(--wm-color-background-surface)] p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MeetupSimulator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
