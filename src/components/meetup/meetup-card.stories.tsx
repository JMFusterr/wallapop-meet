import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { MeetupCard } from "@/components/meetup/meetup-card"
import { createMeetupMachine, transitionMeetup } from "@/meetup"
import type { ActorRole, MeetupChatContext, MeetupMachine } from "@/meetup/types"

const scheduledAt = new Date("2026-02-20T18:00:00.000Z")
const chatContext: MeetupChatContext = {
    conversationId: "conv-story-001",
    listingId: "listing-story-001",
    sellerUserId: "user-seller-story-001",
    buyerUserId: "user-buyer-story-001",
}

function buildConfirmedMachine(): MeetupMachine {
    const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
        type: "PROPOSE",
        actorRole: "SELLER",
        occurredAt: new Date("2026-02-20T16:00:00.000Z"),
    })
    if (!proposed.ok) {
        return createMeetupMachine({ scheduledAt, chatContext })
    }

    const confirmed = transitionMeetup(proposed.meetup, {
        type: "ACCEPT",
        actorRole: "BUYER",
        occurredAt: new Date("2026-02-20T17:00:00.000Z"),
    })
    return confirmed.ok
        ? confirmed.meetup
        : createMeetupMachine({ scheduledAt, chatContext })
}

const meta = {
    title: "Design System/Meetup Card",
    component: MeetupCard,
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
} satisfies Meta<typeof MeetupCard>

export default meta
type Story = StoryObj<typeof meta>

function CardHarness({
    initialMeetup,
    actorRole,
    currentTime,
}: {
    initialMeetup: MeetupMachine
    actorRole: ActorRole
    currentTime: Date
}) {
    const [machine, setMachine] = React.useState(initialMeetup)
    const [error, setError] = React.useState("")

    return (
        <div className="space-y-3">
            <MeetupCard
                meetup={machine}
                actorRole={actorRole}
                currentTime={currentTime}
                onMeetupChange={setMachine}
                onError={setError}
            />
            {error ? (
                <p className="rounded-[8px] bg-[#FDEBEC] px-3 py-2 font-wallie-fit text-[13px] text-[#A81F2D]">
                    {error}
                </p>
            ) : null}
        </div>
    )
}

export const ProposalSellerView: Story = {
    render: () => (
        <CardHarness
            initialMeetup={createMeetupMachine({ scheduledAt, chatContext })}
            actorRole="SELLER"
            currentTime={new Date("2026-02-20T16:00:00.000Z")}
        />
    ),
}

export const ConfirmedBuyerWindowOpen: Story = {
    render: () => (
        <CardHarness
            initialMeetup={buildConfirmedMachine()}
            actorRole="BUYER"
            currentTime={new Date("2026-02-20T17:50:00.000Z")}
        />
    ),
}
