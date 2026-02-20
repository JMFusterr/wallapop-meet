import { describe, expect, it } from "vitest"

import { resolveChatMeetupEntryActionState } from "@/components/meetup/chat-meetup-entry-rules"
import { createMeetupMachine, transitionMeetup } from "@/meetup"
import type { MeetupChatContext } from "@/meetup/types"

describe("chat meetup entry ui rules", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")
    const chatContext: MeetupChatContext = {
        conversationId: "conv-001",
        listingId: "listing-001",
        sellerUserId: "user-seller-001",
        buyerUserId: "user-buyer-001",
    }

    it("habilita entrada para vendedor cuando no hay meetup activo", () => {
        const meetup = createMeetupMachine({ scheduledAt, chatContext })
        const state = resolveChatMeetupEntryActionState(meetup, "SELLER")

        expect(state.visible).toBe(true)
        expect(state.enabled).toBe(true)
    })

    it("deshabilita entrada para comprador cuando no hay meetup activo", () => {
        const meetup = createMeetupMachine({ scheduledAt, chatContext })
        const state = resolveChatMeetupEntryActionState(meetup, "BUYER")

        expect(state.visible).toBe(true)
        expect(state.enabled).toBe(false)
    })

    it("oculta entrada cuando ya existe propuesta activa en el chat", () => {
        const initial = createMeetupMachine({ scheduledAt, chatContext })
        const proposed = transitionMeetup(initial, {
            type: "PROPOSE",
            actorRole: "SELLER",
            occurredAt: new Date("2026-02-20T16:00:00.000Z"),
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba meetup propuesto para la prueba.")
        }

        const state = resolveChatMeetupEntryActionState(proposed.meetup, "SELLER")

        expect(state.visible).toBe(false)
        expect(state.enabled).toBe(false)
    })
})
