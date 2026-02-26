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
            <div className="w-full min-w-[var(--wm-size-360)] max-w-[var(--wm-size-920)] bg-[color:var(--wm-color-background-surface)] p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MeetupSimulator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

