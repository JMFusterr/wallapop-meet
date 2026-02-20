import type { Meta, StoryObj } from "@storybook/react-vite"

import { MeetupDayBanner } from "@/components/meetup/meetup-day-banner"
import { createMeetupMachine, transitionMeetup } from "@/meetup"

const baseScheduledAt = new Date("2026-02-20T18:00:00.000Z")

const confirmedMeetup = (() => {
    const proposed = transitionMeetup(createMeetupMachine(baseScheduledAt), {
        type: "PROPOSE",
        actorRole: "SELLER",
        occurredAt: new Date("2026-02-20T16:00:00.000Z"),
    })
    if (!proposed.ok) {
        return createMeetupMachine(baseScheduledAt)
    }

    const confirmed = transitionMeetup(proposed.meetup, {
        type: "ACCEPT",
        actorRole: "BUYER",
        occurredAt: new Date("2026-02-20T17:00:00.000Z"),
    })
    return confirmed.ok ? confirmed.meetup : createMeetupMachine(baseScheduledAt)
})()

const meta = {
    title: "Design System/Meetup Day Banner",
    component: MeetupDayBanner,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="w-full min-w-[360px] max-w-[860px] bg-[var(--wm-color-background-surface)] p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MeetupDayBanner>

export default meta
type Story = StoryObj<typeof meta>

export const ConfirmedOutsideWindow: Story = {
    args: {
        meetup: confirmedMeetup,
        currentTime: new Date("2026-02-20T15:00:00.000Z"),
    },
}

export const ConfirmedInsideWindow: Story = {
    args: {
        meetup: confirmedMeetup,
        currentTime: new Date("2026-02-20T17:50:00.000Z"),
    },
}
