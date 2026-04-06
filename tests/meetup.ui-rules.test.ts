import { describe, expect, it } from "vitest"

import {
    resolveArrivalActionState,
    resolveMeetupDayBannerVariant,
} from "@/components/meetup/meetup-ui-rules"
import { createMeetupMachine, transitionMeetup } from "@/meetup"
import type { MeetupChatContext } from "@/meetup/types"

describe("meetup ui rules", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")
    const chatContext: MeetupChatContext = {
        conversationId: "conv-001",
        listingId: "listing-001",
        sellerUserId: "user-seller-001",
        buyerUserId: "user-buyer-001",
    }

    function buildConfirmedMeetup() {
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
            type: "PROPOSE",
            actorRole: "SELLER",
            occurredAt: new Date("2026-02-20T16:00:00.000Z"),
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba meetup propuesto para la prueba.")
        }

        const confirmed = transitionMeetup(proposed.meetup, {
            type: "ACCEPT",
            actorRole: "BUYER",
            occurredAt: new Date("2026-02-20T16:30:00.000Z"),
        })
        if (!confirmed.ok) {
            throw new Error("Se esperaba meetup confirmado para la prueba.")
        }

        return confirmed.meetup
    }

    it("habilita accion de llegada en ventana valida", () => {
        const meetup = buildConfirmedMeetup()
        const state = resolveArrivalActionState(
            meetup,
            new Date("2026-02-20T17:50:00.000Z")
        )

        expect(state.enabled).toBe(true)
    })

    it("deshabilita accion de llegada fuera de ventana", () => {
        const meetup = buildConfirmedMeetup()
        const state = resolveArrivalActionState(
            meetup,
            new Date("2026-02-20T21:30:00.000Z")
        )

        expect(state.enabled).toBe(false)
    })

    it("resuelve variante de banner en ventana activa", () => {
        const meetup = buildConfirmedMeetup()
        const variant = resolveMeetupDayBannerVariant(
            meetup,
            new Date("2026-02-20T17:45:00.000Z")
        )

        expect(variant).toBe("in_window")
    })

    it("deshabilita llegada si el actor ya marco ARRIVED", () => {
        const confirmed = buildConfirmedMeetup()
        const arrivedResult = transitionMeetup(confirmed, {
            type: "MARK_ARRIVED",
            actorRole: "SELLER",
            occurredAt: new Date("2026-02-20T17:45:00.000Z"),
            withinSafeRadius: true,
        })
        if (!arrivedResult.ok) {
            throw new Error("Se esperaba meetup ARRIVED para la prueba.")
        }

        const state = resolveArrivalActionState(
            arrivedResult.meetup,
            new Date("2026-02-20T17:50:00.000Z"),
            "SELLER"
        )

        expect(state.enabled).toBe(false)
        expect(state.message).toBe("Ya has marcado que has llegado.")
    })

    it("muestra banner upcoming fuera de ventana en meetup confirmado", () => {
        const meetup = buildConfirmedMeetup()
        const variant = resolveMeetupDayBannerVariant(
            meetup,
            new Date("2026-02-20T16:00:00.000Z")
        )

        expect(variant).toBe("upcoming")
    })
})
