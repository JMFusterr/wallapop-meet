import type { Meta, StoryObj } from "@storybook/react-vite"

import { MeetupTimeline } from "@/components/meetup/meetup-timeline"
import type { MeetupStatus } from "@/meetup/types"

const meta = {
    title: "Design System/Meetup Timeline",
    component: MeetupTimeline,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="w-full min-w-[320px] max-w-[560px] rounded-[12px] border border-[#D3DEE2] bg-white p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MeetupTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
    args: {
        currentStatus: null,
    },
}

const flowStatuses: MeetupStatus[] = [
    "PROPOSED",
    "COUNTER_PROPOSED",
    "CONFIRMED",
    "ARRIVED",
    "COMPLETED",
    "EXPIRED",
    "CANCELLED",
]

export const ByStatus: Story = {
    args: {
        currentStatus: null,
    },
    render: () => (
        <div className="space-y-3">
            {flowStatuses.map((status) => (
                <div key={status} className="rounded-[8px] border border-[#E8ECEF] p-3">
                    <p className="mb-2 font-wallie-fit text-[12px] text-[#6E8792]">
                        Estado: {status}
                    </p>
                    <MeetupTimeline currentStatus={status} />
                </div>
            ))}
        </div>
    ),
}
