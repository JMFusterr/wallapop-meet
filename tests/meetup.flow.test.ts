import { describe, expect, it } from "vitest"

import { createMeetupMachine, transitionMeetup } from "@/meetup/state-machine"
import type { MeetupChatContext, MeetupMachine } from "@/meetup/types"

function expectSuccess(meetupOrResult: MeetupMachine | ReturnType<typeof transitionMeetup>) {
    if ("ok" in meetupOrResult) {
        if (!meetupOrResult.ok) {
            throw new Error(`Se esperaba transicion valida, recibido: ${meetupOrResult.reason}`)
        }
        return meetupOrResult.meetup
    }

    return meetupOrResult
}

describe("meetup flow integration", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")
    const chatContext: MeetupChatContext = {
        conversationId: "conv-001",
        listingId: "listing-001",
        sellerUserId: "user-seller-001",
        buyerUserId: "user-buyer-001",
    }

    it("completa happy path sin contraoferta hasta venta completada", () => {
        let machine = createMeetupMachine({ scheduledAt, chatContext })

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "PROPOSE",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T16:00:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "ACCEPT",
                actorRole: "BUYER",
                occurredAt: new Date("2026-02-20T16:15:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "MARK_ARRIVED",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T17:50:00.000Z"),
                distanceMeters: 42,
                withinSafeRadius: true,
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "COMPLETE",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T18:05:00.000Z"),
            })
        )

        expect(machine.status).toBe("COMPLETED")
        expect(machine.confirmedAt?.toISOString()).toBe("2026-02-20T16:15:00.000Z")
        expect(machine.arrivedAt?.toISOString()).toBe("2026-02-20T17:50:00.000Z")
        expect(machine.completedAt?.toISOString()).toBe("2026-02-20T18:05:00.000Z")
    })

    it("completa flujo con contraoferta y cierre exitoso", () => {
        let machine = createMeetupMachine({ scheduledAt, chatContext })

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "PROPOSE",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T16:00:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "COUNTER_PROPOSE",
                actorRole: "BUYER",
                occurredAt: new Date("2026-02-20T16:20:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "PROPOSE",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T16:30:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "ACCEPT",
                actorRole: "BUYER",
                occurredAt: new Date("2026-02-20T17:00:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "MARK_ARRIVED",
                actorRole: "BUYER",
                occurredAt: new Date("2026-02-20T17:50:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "COMPLETE",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T19:10:00.000Z"),
            })
        )

        expect(machine.status).toBe("COMPLETED")
        expect(machine.completedAt?.toISOString()).toBe("2026-02-20T19:10:00.000Z")
    })

    it("cancela meetup por no-show y bloquea transiciones posteriores", () => {
        let machine = createMeetupMachine({ scheduledAt, chatContext })

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "PROPOSE",
                actorRole: "SELLER",
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "ACCEPT",
                actorRole: "BUYER",
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "MARK_ARRIVED",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T18:01:00.000Z"),
            })
        )

        machine = expectSuccess(
            transitionMeetup(machine, {
                type: "REPORT_NO_SHOW",
                actorRole: "SELLER",
                occurredAt: new Date("2026-02-20T18:06:00.000Z"),
            })
        )

        expect(machine.status).toBe("CANCELLED")

        const invalid = transitionMeetup(machine, {
            type: "COMPLETE",
            actorRole: "SELLER",
        })

        expect(invalid.ok).toBe(false)
    })

    it("bloquea aceptacion por rol incorrecto en propuesta inicial", () => {
        const proposed = expectSuccess(
            transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
                type: "PROPOSE",
                actorRole: "SELLER",
            })
        )

        const invalid = transitionMeetup(proposed, {
            type: "ACCEPT",
            actorRole: "SELLER",
        })

        expect(invalid.ok).toBe(false)
    })
})
