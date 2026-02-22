import { describe, expect, it } from "vitest"

import { resolveProposalScheduledAtValue } from "@/components/meetup/wallapop-chat-workspace-utils"
import { createMeetupMachine } from "@/meetup"
import type { MeetupChatContext } from "@/meetup/types"

describe("wallapop chat workspace utils", () => {
    const chatContext: MeetupChatContext = {
        conversationId: "conv-utils-001",
        listingId: "listing-utils-001",
        sellerUserId: "user-seller-utils-001",
        buyerUserId: "user-buyer-utils-001",
    }

    it("preload scheduledAt as local datetime value for proposal overlay", () => {
        const scheduledAt = new Date("2026-02-20T18:45:00.000Z")
        const meetup = createMeetupMachine({ scheduledAt, chatContext })

        const value = resolveProposalScheduledAtValue(meetup)

        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
        expect(new Date(value).getTime()).toBe(meetup.scheduledAt.getTime())
    })
})
