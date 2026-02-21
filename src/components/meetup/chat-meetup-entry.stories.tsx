import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"

import { ChatMeetupEntry } from "@/components/meetup/chat-meetup-entry"
import { createMeetupMachine } from "@/meetup"
import type { ActorRole, MeetupChatContext, MeetupMachine } from "@/meetup/types"

const scheduledAt = new Date("2026-02-20T18:00:00.000Z")
const chatContext: MeetupChatContext = {
    conversationId: "conv-story-entry-001",
    listingId: "listing-story-entry-001",
    sellerUserId: "user-seller-story-001",
    buyerUserId: "user-buyer-story-001",
}

const meta = {
    title: "Design System/Meetup Chat Entry",
    component: ChatMeetupEntry,
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
} satisfies Meta<typeof ChatMeetupEntry>

export default meta
type Story = StoryObj<typeof meta>

function EntryHarness({ actorRole }: { actorRole: ActorRole }) {
    const [machine, setMachine] = React.useState<MeetupMachine>(() =>
        createMeetupMachine({ scheduledAt, chatContext })
    )
    const [error, setError] = React.useState("")

    return (
        <div className="space-y-3">
            <ChatMeetupEntry
                meetup={machine}
                actorRole={actorRole}
                currentTime={new Date("2026-02-20T16:00:00.000Z")}
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

export const SellerCanStart: Story = {
    args: {
        meetup: createMeetupMachine({ scheduledAt, chatContext }),
        actorRole: "SELLER",
        currentTime: new Date("2026-02-20T16:00:00.000Z"),
        onMeetupChange: () => undefined,
        onError: () => undefined,
    },
    render: () => <EntryHarness actorRole="SELLER" />,
}

export const BuyerDoesNotSeeEntry: Story = {
    args: {
        meetup: createMeetupMachine({ scheduledAt, chatContext }),
        actorRole: "BUYER",
        currentTime: new Date("2026-02-20T16:00:00.000Z"),
        onMeetupChange: () => undefined,
        onError: () => undefined,
    },
    render: () => <EntryHarness actorRole="BUYER" />,
}
