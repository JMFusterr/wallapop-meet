import { describe, expect, it } from "vitest"

import { createMeetupMachine } from "@/meetup/state-machine"
import type { MeetupChatContext } from "@/meetup/types"

describe("meetup chat entry", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")

    it("crea meetup cuando existe contexto de chat valido", () => {
        const chatContext: MeetupChatContext = {
            conversationId: "conv-001",
            listingId: "listing-001",
            sellerUserId: "user-seller-001",
            buyerUserId: "user-buyer-001",
        }

        const meetup = createMeetupMachine({ scheduledAt, chatContext })

        expect(meetup.chatContext.conversationId).toBe("conv-001")
        expect(meetup.chatContext.listingId).toBe("listing-001")
    })

    it("falla si conversationId no existe", () => {
        const chatContext: MeetupChatContext = {
            conversationId: "  ",
            listingId: "listing-001",
            sellerUserId: "user-seller-001",
            buyerUserId: "user-buyer-001",
        }

        expect(() => createMeetupMachine({ scheduledAt, chatContext })).toThrow(
            /conversationId es obligatorio/
        )
    })

    it("falla si seller y buyer son el mismo usuario", () => {
        const chatContext: MeetupChatContext = {
            conversationId: "conv-001",
            listingId: "listing-001",
            sellerUserId: "user-001",
            buyerUserId: "user-001",
        }

        expect(() => createMeetupMachine({ scheduledAt, chatContext })).toThrow(
            /no pueden ser el mismo usuario/
        )
    })
})
